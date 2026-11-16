---
name: verify-ferry
description: Build and verify ferry's macOS CLI, window movement and Space following, and Raycast Script Commands using the repository's CLI tests and live desktop harness. Use when proving ferry behavior or checking a change with retained evidence.
---

# Verify ferry

Read [the feature map](features/README.md), then the feature being exercised.
The primary surface is a one-shot CLI that moves macOS windows; Raycast scripts
are a second entry point. There is no daemon, port, auth, database, or seed data.
Never substitute an installed Homebrew binary for the checkout's binary.

## Launch

Run from the repository root in a persistent shell:

```sh
FERRY_VERIFY="$PWD/.agents/skills/verify-ferry/scripts/verify.sh"
FERRY_EVIDENCE="$("$FERRY_VERIFY" launch)"
export FERRY_VERIFY FERRY_EVIDENCE
FERRY_BIN="$FERRY_EVIDENCE/scratch/ferry"
export FERRY_BIN
printf 'Evidence: %s\n' "$FERRY_EVIDENCE"
"$FERRY_VERIFY" doctor "$FERRY_EVIDENCE"
```

Launch builds with the existing Makefile into a fresh scratch directory. It needs
Apple silicon, Xcode Command Line Tools or Xcode, and a macOS 26+ SDK. The default
build is arm64, minimum macOS 26.0, version from `Makefile`. Readiness is a matching
source/binary fingerprint, correct `--version`, and passing architecture, minimum
OS, and AppKit linkage checks. A CLI invocation runs once and exits; launch does
not start a service. A failed build retains its logs and removes its scratch.

The supported runtime is macOS 26. CLI-only checks can run without Accessibility
or a desktop. Results on a newer OS are compatibility observations, not proof on
the supported OS.

No app data isolation is needed for CLI checks, but **the desktop is shared**.
Never run two movement journeys together or move an existing user window.
The `desktop` helper reserves a per-user lock, uses the existing harness's own
two windows, and restores the prior app. It cannot isolate Mission Control from
the user, yabai, hotkeys, or other tools. Do not drive while they are moving
windows. If a lock already exists, stop; do not remove someone else's lock.
For manual journeys, reserve the same lock and release only the lock you created.

## Doctor

```sh
"$FERRY_VERIFY" doctor "$FERRY_EVIDENCE"
```

This is read-only with respect to the app and desktop: it validates this run's
build and source without moving windows or requesting permissions. Run it first
when anything looks off. A source edit invalidates the run; launch a new one.
It does not assert desktop readiness. The live harness checks Accessibility
without prompting and requires two normal Spaces on the active display. A skip
returns `77` from `build/follow-test`; `make test-follow` typically returns `2`
instead, so read `desktop/stderr.txt` for `SKIP:` rather than treating it as pass.
Do not silently grant permissions, create Spaces, or alter Mission Control settings.

## Drive

CLI discovery and argument validation, in a separate real PTY:

```sh
/usr/bin/script -q "$FERRY_EVIDENCE/cli.pty.txt" \
  "$FERRY_VERIFY" cli "$FERRY_EVIDENCE"
```

Require exit `0` and the `PASS:` line. The helper executes real `--help`, `-h`,
`--version`, and invalid input, verifies stream routing, and reuses `tests/cli.sh`.
All these paths return before WindowServer calls; inspect `main` in `src/ferry.m`
when changing the argument cases. There is **no dry-run flag**: a valid destination
can really move a window. Do not treat `--no-follow` as a dry run.

Background explicit-window movement, already-there behavior, and no-follow:

```sh
"$FERRY_VERIFY" desktop "$FERRY_EVIDENCE"
```

This executes `make BIN="$FERRY_BIN" test-follow`, reusing `tests/follow.m`.
Require all three `ok:` messages, no `FAIL:` or `SKIP:`, and exit `0`. The test
checks actual WindowServer membership and active Space, including that the other
fixture window stays put. It does not cover focused-window selection or Raycast.
Those journeys require native desktop UI control and the matching feature recipe.
Missing UI control, permission, or suitable Spaces is an unmet precondition;
report it instead of weakening the journey.

For a further command, preserve its action and streams with a fresh label:

```sh
"$FERRY_VERIFY" capture "$FERRY_EVIDENCE" binary-contract \
  tests/binary.sh "$FERRY_BIN" arm64 26.0
```

Each label is single-use. This prevents a retry from overwriting failed evidence.

## Evidence

`launch` prints the absolute artifact directory, normally under `$TMPDIR` as
`ferry-verification.XXXXXX`. It contains platform, revision, source diff/hashes,
binary hash, and per-action `command.txt`, `stdout.txt`, `stderr.txt`, and
`exit-code.txt`. The PTY transcript records the CLI session. Preserve the directory
and report its absolute path. The binary itself is scratch, not retained evidence.

Exercise the real CLI or launcher, never replace ferry with a mock or use private
setters to manufacture the result. Capture the action and resulting state.
For movement, a successful exit or `focus requested` is insufficient: observe
the window's destination **and** the active Space independently. The existing
live harness supplies those assertions for its three covered paths. A visual
journey also needs before/after screenshots of the fixture and a short recording
of movement/follow timing using available native UI capture; save them in this
artifact directory. Record the selected window ID and source/destination indexes.
Do not infer animation latency from ferry's verbose internal timing.

For manual CLI launches there should be no app data files, background service,
network activity, or git-ref changes; compare the relevant filesystem/process
state if the change could introduce them. No journey here mocks an external
boundary. Shell-running a Raycast script proves the script path only; the real
Raycast action/hotkey must be exercised separately for launcher claims.

## Cleanup

Run after successful **and failed** iterations:

```sh
"$FERRY_VERIFY" cleanup "$FERRY_EVIDENCE"
test ! -e "$FERRY_EVIDENCE/scratch"
test -s "$FERRY_EVIDENCE/build/command.txt"
test -s "$FERRY_EVIDENCE/source.sha256"
test -s "$FERRY_EVIDENCE/cleanup.txt"
```

The live harness normally closes its own windows and restores the previous app
in `@finally`. Let it finish; do not force-kill it mid-switch. After an abnormal
termination, inspect the exact fixture PID/window IDs from that run and close
only those windows/processes; restore the recorded source Space. Never kill by
process name. `cleanup` removes only the run's scratch, not evidence or the shared
`build/` directory. `make test-follow` may leave its reusable `build/follow-test`.
Manual recipes must stop their recorded fixture PID and release their own lock
before scratch removal. Verify the evidence files for the chosen feature still
exist after cleanup; copy artifacts to durable storage if needed before OS temp
cleanup. Do not commit desktop captures or local evidence by default.

## Helpers

[scripts/verify.sh](scripts/verify.sh) is executable and provides `launch`,
`doctor`, `cli`, `desktop`, `capture`, and `cleanup` as invoked above. It requires
the system Bash and existing Makefile/test tools, no package installation.
Feature-specific manual setup is documented in the map, not hidden in the helper.
Keep the map current with `/maintain-verification-skill` as ferry changes.
