// ferry - move the focused window to a Mission Control space and follow it.
//
// The window-management calls are taken from yabai
// (https://github.com/asmvik/yabai), Copyright (c) 2019 Åsmund Vikane,
// MIT License. See LICENSE.
//
// Only the macOS 26 code path is implemented: SkyLight's bridged
// "move windows to managed space" operation. It needs no daemon and no
// scripting addition, so SIP can stay enabled.

#import <Foundation/Foundation.h>
#import <ApplicationServices/ApplicationServices.h>
#include <mach-o/dyld.h>
#include <mach-o/loader.h>
#include <mach-o/nlist.h>
#include <objc/message.h>
#include <objc/runtime.h>
#include <limits.h>
#include <stdarg.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

#ifndef FERRY_VERSION
#define FERRY_VERSION "dev"
#endif

#define kCPSUserGenerated 0x200
#define SPACE_TYPE_FULLSCREEN 4
#define MOVE_TIMEOUT_MS 1000
#define MOVE_POLL_S 0.001

#define SKYLIGHT_PATH "/System/Library/PrivateFrameworks/SkyLight.framework/Versions/A/SkyLight"
#define BRIDGED_OPERATION_SYMBOL "__ZL54SLSPerformAsynchronousBridgedWindowManagementOperationP47SLSAsynchronousBridgedWindowManagementOperation"
#define BRIDGED_MOVE_CLASS "SLSBridgedMoveWindowsToManagedSpaceOperation"

extern int SLSMainConnectionID(void);
extern CFArrayRef SLSCopyManagedDisplaySpaces(int cid);
extern int SLSSpaceGetType(int cid, uint64_t sid);
extern CFArrayRef SLSCopySpacesForWindows(int cid, int selector, CFArrayRef window_list);
extern CGError SLSSpaceSetFrontPSN(int cid, uint64_t sid, ProcessSerialNumber psn);
extern CGError SLSGetWindowOwner(int cid, uint32_t wid, int *wcid);
extern CGError SLSGetConnectionPSN(int cid, ProcessSerialNumber *psn);
extern OSStatus _SLPSGetFrontProcess(ProcessSerialNumber *psn);
extern CGError _SLPSSetFrontProcessWithOptions(ProcessSerialNumber *psn, uint32_t wid, uint32_t mode);
extern CGError SLPSPostEventRecordTo(ProcessSerialNumber *psn, uint8_t *bytes);
extern AXError _AXUIElementGetWindow(AXUIElementRef ref, uint32_t *wid);

typedef int64_t (*bridged_operation_fn)(void *operation);

static bool g_verbose;

static void fail(int code, const char *fmt, ...) __attribute__((noreturn, format(printf, 2, 3)));
static void fail(int code, const char *fmt, ...)
{
    va_list args;
    va_start(args, fmt);
    fputs("ferry: ", stderr);
    vfprintf(stderr, fmt, args);
    fputc('\n', stderr);
    va_end(args);
    exit(code);
}

static double elapsed_ms(uint64_t start_ns)
{
    return (clock_gettime_nsec_np(CLOCK_UPTIME_RAW) - start_ns) / 1e6;
}

//
// Symbol lookup for functions that SkyLight does not export (yabai: misc/macho_dlsym.h).
//

static struct mach_header_64 *macho_find_image_header(const char *target_name, intptr_t *slide)
{
    uint32_t image_count = _dyld_image_count();

    for (uint32_t i = 0; i < image_count; ++i) {
        const char *image_name = _dyld_get_image_name(i);
        if (image_name && strcmp(image_name, target_name) == 0) {
            *slide = _dyld_get_image_vmaddr_slide(i);
            return (struct mach_header_64 *) _dyld_get_image_header(i);
        }
    }

    return NULL;
}

static void *macho_find_symbol(const char *target_image, const char *target_symbol)
{
    intptr_t slide = 0;
    struct mach_header_64 *header = macho_find_image_header(target_image, &slide);
    if (!header) return NULL;

    struct segment_command_64 *linkedit = NULL;
    struct symtab_command *symtab = NULL;
    uint8_t *cursor = (uint8_t *) header + sizeof(struct mach_header_64);

    for (uint32_t i = 0; i < header->ncmds; ++i) {
        struct load_command *cmd = (struct load_command *) cursor;

        if (cmd->cmd == LC_SEGMENT_64) {
            struct segment_command_64 *segment = (struct segment_command_64 *) cmd;
            if (strncmp(segment->segname, SEG_LINKEDIT, sizeof(segment->segname)) == 0) {
                linkedit = segment;
            }
        } else if (cmd->cmd == LC_SYMTAB) {
            symtab = (struct symtab_command *) cmd;
        }

        cursor += cmd->cmdsize;
    }

    if (!linkedit || !symtab) return NULL;

    uint8_t *linkedit_base = (uint8_t *) (linkedit->vmaddr - linkedit->fileoff + slide);
    const char *strings = (const char *) (linkedit_base + symtab->stroff);
    struct nlist_64 *symbols = (struct nlist_64 *) (linkedit_base + symtab->symoff);

    for (uint32_t i = 0; i < symtab->nsyms; ++i) {
        if (strcmp(strings + symbols[i].n_un.n_strx, target_symbol) == 0) {
            return (void *) (symbols[i].n_value + slide);
        }
    }

    return NULL;
}

//
// Spaces and windows.
//

static CFArrayRef window_id_array(uint32_t wid)
{
    CFNumberRef number = CFNumberCreate(NULL, kCFNumberSInt32Type, &wid);
    CFArrayRef array = CFArrayCreate(NULL, (const void **) &number, 1, &kCFTypeArrayCallBacks);
    CFRelease(number);
    return array;
}

// Maps a 1-based Mission Control index to a space id, counting spaces across
// all displays in order (yabai: space_manager_mission_control_space).
static uint64_t space_for_index(int cid, int index)
{
    CFArrayRef displays = SLSCopyManagedDisplaySpaces(cid);
    if (!displays) return 0;

    uint64_t result = 0;
    int current = 1;

    for (CFIndex i = 0; i < CFArrayGetCount(displays) && !result; ++i) {
        CFDictionaryRef display = CFArrayGetValueAtIndex(displays, i);
        CFArrayRef spaces = CFDictionaryGetValue(display, CFSTR("Spaces"));
        if (!spaces) continue;

        for (CFIndex j = 0; j < CFArrayGetCount(spaces); ++j, ++current) {
            if (current != index) continue;

            CFDictionaryRef space = CFArrayGetValueAtIndex(spaces, j);
            CFNumberRef sid = CFDictionaryGetValue(space, CFSTR("id64"));
            if (sid) CFNumberGetValue(sid, kCFNumberSInt64Type, &result);
            break;
        }
    }

    CFRelease(displays);
    return result;
}

static bool window_is_on_space(int cid, uint32_t wid, uint64_t sid)
{
    CFArrayRef windows = window_id_array(wid);
    CFArrayRef spaces = SLSCopySpacesForWindows(cid, 0x7, windows);
    CFRelease(windows);
    if (!spaces) return false;

    bool result = false;
    for (CFIndex i = 0; i < CFArrayGetCount(spaces) && !result; ++i) {
        uint64_t value = 0;
        CFNumberGetValue(CFArrayGetValueAtIndex(spaces, i), kCFNumberSInt64Type, &value);
        result = value == sid;
    }

    CFRelease(spaces);
    return result;
}

static uint32_t ax_focused_window(pid_t pid, AXUIElementRef *window_ref)
{
    AXUIElementRef app = AXUIElementCreateApplication(pid);
    CFTypeRef window = NULL;
    uint32_t wid = 0;

    if (AXUIElementCopyAttributeValue(app, kAXFocusedWindowAttribute, &window) == kAXErrorSuccess && window) {
        if (_AXUIElementGetWindow(window, &wid) == kAXErrorSuccess && wid) {
            *window_ref = window;
        } else {
            wid = 0;
            CFRelease(window);
        }
    }

    CFRelease(app);
    return wid;
}

// Fallback when Accessibility is unavailable: the frontmost normal-level
// on-screen window owned by the app.
static uint32_t window_list_front_window(pid_t pid)
{
    CFArrayRef list = CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements, kCGNullWindowID);
    if (!list) return 0;

    uint32_t wid = 0;
    for (CFIndex i = 0; i < CFArrayGetCount(list) && !wid; ++i) {
        CFDictionaryRef info = CFArrayGetValueAtIndex(list, i);
        int owner = 0, layer = -1;
        CFNumberGetValue(CFDictionaryGetValue(info, kCGWindowOwnerPID), kCFNumberIntType, &owner);
        CFNumberGetValue(CFDictionaryGetValue(info, kCGWindowLayer), kCFNumberIntType, &layer);
        if (owner == pid && layer == 0) {
            CFNumberGetValue(CFDictionaryGetValue(info, kCGWindowNumber), kCFNumberSInt32Type, &wid);
        }
    }

    CFRelease(list);
    return wid;
}

// yabai: space_manager_move_window_to_space, macOS 26 branch.
static int64_t move_window_to_space(bridged_operation_fn perform, uint32_t wid, uint64_t sid)
{
    Class cls = objc_getClass(BRIDGED_MOVE_CLASS);
    if (!cls) fail(1, "SkyLight class %s not found; unsupported macOS version", BRIDGED_MOVE_CLASS);

    CFArrayRef windows = window_id_array(wid);
    SEL sel = sel_registerName("initWithWindows:spaceID:");
    id operation = ((id (*)(id, SEL, id, uint64_t)) objc_msgSend)([cls alloc], sel, (id) windows, sid);
    int64_t result = perform(operation);
    [operation release];
    CFRelease(windows);

    return result;
}

// yabai: window_manager_make_key_window. Synthesizes the event pair that
// makes the window key within its application.
static void make_key_window(ProcessSerialNumber *psn, uint32_t wid)
{
    uint8_t bytes[0x100] = {0};
    bytes[0x04] = 0xf8;
    bytes[0x3a] = 0x10;
    memcpy(bytes + 0x3c, &wid, sizeof(uint32_t));
    memset(bytes + 0x20, 0xff, 0x10);

    bytes[0x08] = 0x01;
    SLPSPostEventRecordTo(psn, bytes);

    bytes[0x08] = 0x02;
    SLPSPostEventRecordTo(psn, bytes);
}

// yabai: window_manager_focus_window_with_raise. Focusing a window on another
// space makes macOS switch to that space.
static void focus_window(ProcessSerialNumber *psn, uint32_t wid, AXUIElementRef window_ref)
{
    _SLPSSetFrontProcessWithOptions(psn, wid, kCPSUserGenerated);
    make_key_window(psn, wid);
    if (window_ref) AXUIElementPerformAction(window_ref, kAXRaiseAction);
}

static void usage(FILE *stream)
{
    fputs("usage: ferry [--no-follow] [--window <id>] [--verbose] <space-index>\n"
          "       ferry --version\n"
          "\n"
          "Move the focused window to the Mission Control space <space-index>\n"
          "(1-based, counted across displays like yabai's space index) and\n"
          "switch to it.\n"
          "\n"
          "  --no-follow     move the window without switching spaces\n"
          "  --window <id>   act on this window id instead of the focused window\n"
          "  --verbose       print what was done and how long it took\n"
          "  --version       print the version and exit\n", stream);
}

static long parse_positive(const char *text, long max)
{
    char *end = NULL;
    long value = strtol(text, &end, 10);
    return (end && *end == '\0' && value > 0 && value <= max) ? value : 0;
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
int main(int argc, char **argv)
{
    @autoreleasepool {
        uint64_t start = clock_gettime_nsec_np(CLOCK_UPTIME_RAW);
        bool follow = true;
        uint32_t wid = 0;
        int index = 0;

        for (int i = 1; i < argc; ++i) {
            const char *arg = argv[i];

            if (strcmp(arg, "-h") == 0 || strcmp(arg, "--help") == 0) {
                usage(stdout);
                return 0;
            } else if (strcmp(arg, "--version") == 0) {
                puts("ferry " FERRY_VERSION);
                return 0;
            } else if (strcmp(arg, "--no-follow") == 0) {
                follow = false;
            } else if (strcmp(arg, "--verbose") == 0) {
                g_verbose = true;
            } else if (strcmp(arg, "--window") == 0 && i + 1 < argc) {
                wid = (uint32_t) parse_positive(argv[++i], UINT32_MAX);
                if (!wid) fail(2, "invalid window id '%s'", argv[i]);
            } else if (!index && arg[0] != '-') {
                index = (int) parse_positive(arg, INT_MAX);
                if (!index) fail(2, "invalid space index '%s'", arg);
            } else {
                usage(stderr);
                return 2;
            }
        }

        if (!index) {
            usage(stderr);
            return 2;
        }

        // The binary must link AppKit (see Makefile): without AppKit loaded,
        // the window server silently ignores the bridged move operation.
        // Calling NSApplicationLoad() is not needed and would add ~45 ms.
        int cid = SLSMainConnectionID();

        bridged_operation_fn perform = macho_find_symbol(SKYLIGHT_PATH, BRIDGED_OPERATION_SYMBOL);
        if (!perform) fail(1, "SkyLight bridged window operation not found; unsupported macOS version");

        uint64_t dst_sid = space_for_index(cid, index);
        if (!dst_sid) fail(1, "space %d does not exist", index);
        if (SLSSpaceGetType(cid, dst_sid) == SPACE_TYPE_FULLSCREEN) {
            fail(1, "space %d is a native fullscreen space", index);
        }

        AXUIElementRef window_ref = NULL;
        const char *source = "--window";

        if (!wid) {
            ProcessSerialNumber front = {0};
            pid_t pid = 0;
            _SLPSGetFrontProcess(&front);
            GetProcessPID(&front, &pid);

            source = "accessibility";
            wid = ax_focused_window(pid, &window_ref);
            if (!wid) {
                source = "window list";
                wid = window_list_front_window(pid);
            }
            if (!wid) fail(1, "no focused window");
        }

        int owner_cid = 0;
        ProcessSerialNumber psn = {0};
        if (SLSGetWindowOwner(cid, wid, &owner_cid) != kCGErrorSuccess ||
            SLSGetConnectionPSN(owner_cid, &psn) != kCGErrorSuccess) {
            fail(1, "window %u not found", wid);
        }

        bool moved = false;
        double move_ms = 0;

        if (!window_is_on_space(cid, wid, dst_sid)) {
            uint64_t move_start = clock_gettime_nsec_np(CLOCK_UPTIME_RAW);
            int64_t result = move_window_to_space(perform, wid, dst_sid);
            SLSSpaceSetFrontPSN(cid, dst_sid, psn);

            // The operation is asynchronous; wait until the window server
            // reports the new space before focusing it.
            while (!(moved = window_is_on_space(cid, wid, dst_sid)) && elapsed_ms(move_start) < MOVE_TIMEOUT_MS) {
                CFRunLoopRunInMode(kCFRunLoopDefaultMode, MOVE_POLL_S, true);
            }

            move_ms = elapsed_ms(move_start);
            if (!moved) {
                fail(1, "window %u did not move to space %d (operation result %lld); the app may not allow it",
                     wid, index, (long long) result);
            }
        }

        if (follow) focus_window(&psn, wid, window_ref);
        if (window_ref) CFRelease(window_ref);

        if (g_verbose) {
            printf("window %u (via %s) -> space %d (id %llu): %s in %.1f ms, %s, total %.1f ms\n",
                   wid, source, index, (unsigned long long) dst_sid,
                   moved ? "moved" : "already there", move_ms,
                   follow ? "focused" : "not followed", elapsed_ms(start));
        }
    }

    return 0;
}
#pragma clang diagnostic pop
