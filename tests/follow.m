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

static bool window_on_space(int cid, uint32_t wid, uint64_t sid)
{
    CFArrayRef spaces = SLSCopySpacesForWindows(cid, 0x7, (CFArrayRef) @[@(wid)]);
    bool result = spaces && [(NSArray *) spaces containsObject:@(sid)];
    if (spaces) CFRelease(spaces);
    return result;
}

static int run_ferry(NSString *binary, uint32_t wid, int index, bool follow)
{
    NSTask *task = [[[NSTask alloc] init] autorelease];
    task.launchPath = binary;
    NSMutableArray *args = [NSMutableArray arrayWithObjects:@"--verbose", @"--window",
                           [@(wid) stringValue], [@(index) stringValue], nil];
    if (!follow) [args addObject:@"--no-follow"];
    task.arguments = args;
    [task launch];
    [task waitUntilExit];
    return task.terminationStatus;
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
                else if (current && !dst && SLSSpaceGetType(cid, sid) != 4) {
                    dst = sid;
                    dst_index = index;
                }
            }
        }
        if (displays) CFRelease(displays);
        if (!src_index || !dst_index || SLSSpaceGetType(cid, src) == 4) {
            fputs("SKIP: test-follow requires two normal Spaces on the active display\n", stderr);
            return 77;
        }

        NSString *binary = [[NSString stringWithUTF8String:argv[1]] stringByStandardizingPath];
        NSRunningApplication *original = [[[NSWorkspace sharedWorkspace] frontmostApplication] retain];
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
            if (!wid || !other || front == fixture.processIdentifier || front == getpid() ||
                !window_on_space(cid, wid, src) || !window_on_space(cid, other, src)) {
                fprintf(stderr, "FAIL: fixture setup: target=%u other=%u front_pid=%d fixture_pid=%d source=%llu target_on_source=%d other_on_source=%d\n",
                        wid, other, front, fixture.processIdentifier, src,
                        window_on_space(cid, wid, src), window_on_space(cid, other, src));
                return 1;
            }

            // The selected window is not the app's key window. Matching only
            // the owning app or its focused window must not satisfy this test.
            int status = run_ferry(binary, wid, dst_index, true);
            bool followed = wait_for_space(cid, dst);
            bool moved = window_on_space(cid, wid, dst);
            if (status || !moved || !followed || !window_on_space(cid, other, src)) {
                fprintf(stderr, "FAIL: background --window: exit=%d moved=%d followed=%d active=%llu expected=%llu\n",
                        status, moved, followed, SLSGetActiveSpace(cid), dst);
                return 1;
            }
            puts("ok: background --window moves and follows the selected window");

            status = run_ferry(binary, wid, dst_index, true);
            if (status || !window_on_space(cid, wid, dst) || SLSGetActiveSpace(cid) != dst) {
                fputs("FAIL: --window already on the active destination Space\n", stderr);
                return 1;
            }
            puts("ok: --window already on the active destination Space");

            status = run_ferry(binary, wid, src_index, false);
            pump(0.3);
            if (status || !window_on_space(cid, wid, src) || SLSGetActiveSpace(cid) != dst) {
                fputs("FAIL: --no-follow must move without switching Spaces\n", stderr);
                return 1;
            }
            puts("ok: --no-follow leaves the active Space unchanged");
            result = 0;
        } @finally {
            if (fixture.running) {
                if (wid && !window_on_space(cid, wid, src)) run_ferry(binary, wid, src_index, false);
                [fixture terminate];
                [fixture waitUntilExit];
            }
            restore_app(original, original_window);
            wait_for_space(cid, src);
            if (original_window) CFRelease(original_window);
            [original release];
        }
        return result;
    }
}
#pragma clang diagnostic pop
