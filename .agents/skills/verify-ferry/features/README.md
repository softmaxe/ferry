# Ferry verification map

This is the maintained map of user-visible verification paths. Read this index
before choosing a journey. One passing journey is not full application coverage.

## Baseline preconditions

- Launch and doctor using [the skill](../SKILL.md); use its run-owned `FERRY_BIN`.
- CLI-only checks need no desktop. Live journeys need a local logged-in desktop,
  Accessibility for the launcher, two normal Spaces, and stable Space numbering.
- Do not rearrange Spaces or change system permissions automatically. Report a
  missing precondition as failure to execute the journey, with its reason.
- For the manual recipes below, confirm Mission Control shows the current Space
  as global index 1 and destination as global index 2; both must be normal Spaces
  on the active display. Do not assume these indexes from screen position on a
  multiple-display system. The automated regression discovers indexes itself.
- Only use disposable fixture windows. Reserve the desktop lock specified in the
  skill. Do not double-drive a shared desktop or shared Raycast settings.

## Driving conventions

Use the executable helper for command/stream/exit evidence and native UI tools
for visible app focus and launcher actions. Manual desktop recipes share this
setup after `doctor`; the first command reserves the lock:

```sh
mkdir "${TMPDIR:-/tmp}/ferry-verification-desktop.lock"
make build/follow-test
build/follow-test --fixture > "$FERRY_EVIDENCE/fixture-ids.txt" \
  2> "$FERRY_EVIDENCE/fixture-stderr.txt" &
FERRY_FIXTURE_PID=$!
printf '%s\n' "$FERRY_FIXTURE_PID" > "$FERRY_EVIDENCE/fixture-pid.txt"
```

Wait for `fixture-ids.txt` to contain two nonzero decimal window IDs and for both
windows to appear on source Space 1. Record the original frontmost app and Space
with native UI control before starting. The titles are `Ferry follow test: target`
and `Ferry follow test: other window`. Read IDs only after readiness:

```sh
read -r FERRY_TARGET FERRY_OTHER < "$FERRY_EVIDENCE/fixture-ids.txt"
export FERRY_TARGET FERRY_OTHER
```

Focus windows by their title and owning fixture process, never by coordinates or
guessing a PID as a window ID. Capture the before state, action, resulting window
location and active Space. After each manual journey, close only this fixture:

```sh
kill -TERM "$FERRY_FIXTURE_PID"
wait "$FERRY_FIXTURE_PID" || true
rmdir "${TMPDIR:-/tmp}/ferry-verification-desktop.lock"
```

Restore the original app and Space with native UI control, then run the skill's
cleanup. If fixture startup fails, still stop the PID you started and release
your lock. Do not launch a second fixture to hide a broken first attempt.

## Proof and skip reporting

- Record feature ID and entry point, command, stdout, stderr, and exit code.
- UI journeys require before/after screenshots and movement recording; retain
  evidence through cleanup. Native UI absence is an unmet precondition.
- `focus requested` does not assert that the active Space changed. Inspect the
  actual active Space and the selected window's location.
- `make test-follow` covers explicit IDs, already-there, and no-follow only.
- Report Raycast shell, Raycast action, hotkey, and focused CLI paths separately.
- A missing prerequisite must not turn into a different, easier passing journey.

## Features

- [CLI discovery and validation](cli.md): help, version, invalid arguments, streams.
- [Move the focused window](focused-window.md): positional CLI and AX selection.
- [Move an explicit window](explicit-window.md): background selection and already-there.
- [Follow and no-follow](follow.md): active Space behavior and verbose output.
- [Raycast commands](raycast.md): script, action, and hotkey entry points.
