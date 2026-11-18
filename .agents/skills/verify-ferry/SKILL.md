---
name: verify-ferry
description: Build and verify ferry's macOS CLI, window movement and Space following, and Raycast Script Commands using the repository's CLI tests and live desktop harness. Use when proving ferry behavior or checking a change with retained evidence.
---

# Verify ferry

Choose a journey from the [feature map](features/README.md). Build the checkout's
executable for each run. Use only disposable fixture windows for desktop checks.

## Build and check readiness

Run from the repository root in one shell.

```sh
FERRY_VERIFY="$PWD/.agents/skills/verify-ferry/scripts/verify.sh"
FERRY_EVIDENCE="$("$FERRY_VERIFY" launch)"
FERRY_BIN="$FERRY_EVIDENCE/scratch/ferry"
export FERRY_VERIFY FERRY_EVIDENCE FERRY_BIN
printf 'Evidence: %s\n' "$FERRY_EVIDENCE"
"$FERRY_VERIFY" doctor "$FERRY_EVIDENCE"
```

Launch uses the Makefile, Apple silicon, and the Xcode Command Line Tools or
Xcode with a macOS 26+ SDK. A failed build prints the evidence path and removes
its scratch directory. The supported runtime is macOS 26. Report the actual OS
version for compatibility runs.

Doctor checks the source and binary fingerprints, version, architecture,
deployment target, and AppKit linkage. It runs without Accessibility or a
desktop. Launch again after changing the build inputs, tests, Raycast scripts,
or verification helper.

## Run a journey

For headless CLI verification, capture a terminal transcript.

```sh
/usr/bin/script -q "$FERRY_EVIDENCE/cli.pty.txt" \
  "$FERRY_VERIFY" cli "$FERRY_EVIDENCE"
```

Require exit 0 and the final `PASS:` line. The helper preserves example
invocations and runs [the CLI contract](../../../tests/cli.sh) for help,
version, argument diagnostics, and stream routing. All cases exit during
argument parsing. A valid destination, including one passed with
`--no-follow`, can move a window.

For the live explicit-window regression, run the following command when the
desktop is available and idle.

```sh
"$FERRY_VERIFY" desktop "$FERRY_EVIDENCE"
```

The helper locks the shared desktop and runs `make test-follow` with the verified
binary. The harness creates two windows, checks the selected window's location
and the active Space, then closes its fixture and restores the prior app. Allow
it to finish. A passing run exits 0 and reports the background-follow,
already-there, and no-follow assertions. If it fails, inspect
`desktop/stderr.txt`. The harness returns 77 for missing Accessibility or two
normal Spaces on the active display. Make can surface this as exit 2. Report the
skip and keep the user's Spaces and permissions intact.

The [feature map](features/README.md) describes lock ownership, fixture setup,
visual evidence, and restoration for manual focused-window and Raycast journeys.
Use the real launcher when verifying a Raycast action or hotkey. Record the
observed active Space and window membership for movement claims.

## Retain evidence

For additional commands, use a fresh label each time.

```sh
"$FERRY_VERIFY" capture "$FERRY_EVIDENCE" version-check "$FERRY_BIN" --version
```

Each label records the command, stdout, stderr, and exit status. The run directory
also contains the OS version, Git revision, tracked input changes against HEAD,
and input and binary hashes. Report its absolute path. Keep any screenshots or
recordings there. Copy it to durable storage if needed before OS temp cleanup.

After a successful launch, clean up even when a journey fails.

```sh
"$FERRY_VERIFY" cleanup "$FERRY_EVIDENCE"
test ! -e "$FERRY_EVIDENCE/scratch"
test -s "$FERRY_EVIDENCE/cleanup.txt"
```

Cleanup removes the run-owned scratch binary and retains evidence and the
checkout's reusable `build/follow-test`. Manual journeys must first terminate
their recorded fixture PID, restore the original app and Space, and release
their lock. After an interrupted desktop run, inspect the fixture from that
run before attempting restoration.
