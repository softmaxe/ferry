// Live desktop regression for issue #2. Run explicitly with make test-follow.
// Creates its own windows, requires Accessibility and two normal Spaces, and
// temporarily switches Spaces. No existing windows are moved.
#import <AppKit/AppKit.h>
#import <ApplicationServices/ApplicationServices.h>

extern int SLSMainConnectionID(void);
extern uint64_t SLSGetActiveSpace(int cid);
extern CFArrayRef SLSCopyManagedDisplaySpaces(int cid);
extern CFArrayRef SLSCopySpacesForWindows(int cid, int selector, CFArrayRef windows);
extern int SLSSpaceGetType(int cid, uint64_t sid);

#define SPACE_TYPE_USER 0

static void pump(double seconds)
{
    NSDate *end = [NSDate dateWithTimeIntervalSinceNow:seconds];
    while ([end timeIntervalSinceNow] > 0) {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:0.01]];
    }
}

static bool wait_for_space(int cid, uint64_t sid)
{
    NSDate *deadline = [NSDate dateWithTimeIntervalSinceNow:3];
    while (SLSGetActiveSpace(cid) != sid && [deadline timeIntervalSinceNow] > 0) pump(0.01);
    return SLSGetActiveSpace(cid) == sid;
}

static bool window_only_on_space(int cid, uint32_t wid, uint64_t sid)
{
    NSArray *spaces = (NSArray *) SLSCopySpacesForWindows(cid, 0x7, (CFArrayRef) @[@(wid)]);
    bool result = [spaces isEqualToArray:@[@(sid)]];
    [spaces release];
    return result;
}

static bool run_ferry(NSString *binary, uint32_t wid, int index, bool follow, NSString *expected_action)
{
    NSTask *task = [[[NSTask alloc] init] autorelease];
    task.launchPath = binary;
    NSMutableArray *args = [NSMutableArray arrayWithObjects:@"--verbose", @"--window",
                           [@(wid) stringValue], [@(index) stringValue], nil];
    if (!follow) [args addObject:@"--no-follow"];
    task.arguments = args;
    NSPipe *pipe = [NSPipe pipe];
    task.standardOutput = pipe;
    [task launch];
    NSData *output = [pipe.fileHandleForReading readDataToEndOfFile];
    [[NSFileHandle fileHandleWithStandardOutput] writeData:output];
    [task waitUntilExit];
    NSString *verbose = [[[NSString alloc] initWithData:output encoding:NSUTF8StringEncoding] autorelease];
    if (task.terminationStatus || ![verbose containsString:expected_action]) {
        fprintf(stderr, "FAIL: ferry exit=%d, expected verbose output containing '%s'\n",
                task.terminationStatus, expected_action.UTF8String);
        return false;
    }
    return true;
}

static void run_fixture(void)
{
    [NSApplication sharedApplication];
    [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
    NSWindow *target = [[NSWindow alloc] initWithContentRect:NSMakeRect(100, 100, 360, 180)
                                                 styleMask:NSWindowStyleMaskTitled
                                                   backing:NSBackingStoreBuffered defer:NO];
    target.title = @"Ferry follow test: target";
    [target orderFrontRegardless];
    NSWindow *other = [[NSWindow alloc] initWithContentRect:NSMakeRect(500, 100, 360, 180)
                                                styleMask:NSWindowStyleMaskTitled
                                                  backing:NSBackingStoreBuffered defer:NO];
    other.title = @"Ferry follow test: other window";
    [other orderFrontRegardless];
    [other makeKeyWindow];
    [NSApp finishLaunching];
    printf("%u %u\n", (uint32_t) target.windowNumber, (uint32_t) other.windowNumber);
    fflush(stdout);
    [NSApp run];
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
static void restore_app(NSRunningApplication *app, AXUIElementRef window)
{
    [app activateWithOptions:NSApplicationActivateIgnoringOtherApps];
    if (window) AXUIElementPerformAction(window, kAXRaiseAction);
    pump(0.3);
}
#pragma clang diagnostic pop

int main(int argc, char **argv)
{
    @autoreleasepool {
        if (argc == 2 && strcmp(argv[1], "--fixture") == 0) {
            run_fixture();
            return 0;
        }
        if (argc != 2) return 2;
        if (!AXIsProcessTrusted()) {
            fputs("SKIP: test-follow requires Accessibility for the launcher\n", stderr);
            return 77;
        }

        int cid = SLSMainConnectionID();
        uint64_t src = SLSGetActiveSpace(cid), dst = 0;
        int src_index = 0, dst_index = 0, index = 0;
        CFArrayRef displays = SLSCopyManagedDisplaySpaces(cid);
        for (NSDictionary *display in (NSArray *) displays) {
            bool current = false;
            for (NSDictionary *space in display[@"Spaces"]) {
                if ([space[@"id64"] unsignedLongLongValue] == src) current = true;
            }
            for (NSDictionary *space in display[@"Spaces"]) {
                ++index;
                uint64_t sid = [space[@"id64"] unsignedLongLongValue];
                if (sid == src) src_index = index;
                else if (current && !dst && SLSSpaceGetType(cid, sid) == SPACE_TYPE_USER) {
                    dst = sid;
                    dst_index = index;
                }
            }
        }
        if (displays) CFRelease(displays);
        if (!src_index || !dst_index || SLSSpaceGetType(cid, src) != SPACE_TYPE_USER) {
            fputs("SKIP: test-follow requires two normal Spaces on the active display\n", stderr);
            return 77;
        }

        NSString *binary = [[NSString stringWithUTF8String:argv[1]] stringByStandardizingPath];
        NSRunningApplication *original = [[[NSWorkspace sharedWorkspace] frontmostApplication] retain];
        if (!original) {
            fputs("SKIP: test-follow needs a frontmost application to restore\n", stderr);
            return 77;
        }
        AXUIElementRef original_app = AXUIElementCreateApplication(original.processIdentifier);
        AXUIElementRef original_window = NULL;
        AXUIElementCopyAttributeValue(original_app, kAXFocusedWindowAttribute, (CFTypeRef *) &original_window);
        CFRelease(original_app);
        NSTask *fixture = [[[NSTask alloc] init] autorelease];
        fixture.launchPath = [[NSString stringWithUTF8String:argv[0]] stringByStandardizingPath];
        fixture.arguments = @[@"--fixture"];
        NSPipe *pipe = [NSPipe pipe];
        fixture.standardOutput = pipe;
        uint32_t wid = 0, other = 0;
        int result = 1;
        @try {
            [fixture launch];
            NSData *data = [[pipe fileHandleForReading] availableData];
            NSString *ids = [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease];
            if (ids) sscanf(ids.UTF8String, "%u %u", &wid, &other);
            pump(0.3);
            restore_app(original, original_window);
            pid_t front = [[[NSWorkspace sharedWorkspace] frontmostApplication] processIdentifier];
            bool target_on_source = window_only_on_space(cid, wid, src);
            bool other_on_source = window_only_on_space(cid, other, src);
            if (!wid || !other || wid == other || front != original.processIdentifier ||
                SLSGetActiveSpace(cid) != src || !target_on_source || !other_on_source) {
                fprintf(stderr, "FAIL: fixture setup: target=%u other=%u front_pid=%d expected_pid=%d source=%llu target_on_source=%d other_on_source=%d\n",
                        wid, other, front, original.processIdentifier, src, target_on_source, other_on_source);
                return 1;
            }

            // The selected window is not the app's key window. Matching only
            // the owning app or its focused window must not satisfy this test.
            if (!run_ferry(binary, wid, dst_index, true, @": moved in ")) return 1;
            bool followed = wait_for_space(cid, dst);
            bool moved = window_only_on_space(cid, wid, dst);
            if (!moved || !followed || !window_only_on_space(cid, other, src)) {
                fprintf(stderr, "FAIL: background --window: moved=%d followed=%d active=%llu expected=%llu\n",
                        moved, followed, SLSGetActiveSpace(cid), dst);
                return 1;
            }
            puts("ok: background --window moves and follows the selected window");

            if (!run_ferry(binary, wid, dst_index, true, @": already there in ")) return 1;
            if (!window_only_on_space(cid, wid, dst) || SLSGetActiveSpace(cid) != dst) {
                fputs("FAIL: --window already on the active destination Space\n", stderr);
                return 1;
            }
            puts("ok: --window already on the active destination Space");

            if (!run_ferry(binary, wid, src_index, false, @": moved in ")) return 1;
            pump(0.3);
            if (!window_only_on_space(cid, wid, src) || !window_only_on_space(cid, other, src) ||
                SLSGetActiveSpace(cid) != dst) {
                fputs("FAIL: --no-follow must move without switching Spaces\n", stderr);
                return 1;
            }
            puts("ok: --no-follow leaves the active Space unchanged");
            result = 0;
        } @finally {
            if (fixture.running) {
                [fixture terminate];
                [fixture waitUntilExit];
            }
            restore_app(original, original_window);
            if (!wait_for_space(cid, src) ||
                [NSWorkspace sharedWorkspace].frontmostApplication.processIdentifier != original.processIdentifier) {
                fputs("FAIL: could not restore the original app and Space\n", stderr);
                result = 1;
            }
            if (original_window) CFRelease(original_window);
            [original release];
        }
        return result;
    }
}
