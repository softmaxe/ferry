# Raycast commands

Users move their focused window with the supplied Space 1–5 Script Commands,
optionally assigning a hotkey. Scripts locate ferry or honor `FERRY_BINARY`.

## Sub-features

- `raycast-script`: each script selects its documented Space number.
- `raycast-action`: choosing a command in Raycast moves the previously focused window.
- `raycast-hotkey`: an assigned shortcut invokes the same user behavior.
- `raycast-lookup`: explicit override and documented binary search paths work.
- `raycast-missing`: a nonexecutable override reports the installation hint, exit 127.

## How to get to it (user POV)

Add this checkout's `raycast/` directory in Raycast Settings > Extensions > + >
Add Script Directory. Search `Ferry Window to Space 2` or invoke its assigned
hotkey. Scripts for Space 1, 3, 4, and 5 are separate user entry points.

## Driving it with verify.sh and native UI

Preconditions: native desktop control, manual fixture baseline from the index,
Raycast installed and already configured for these scripts for action/hotkey
coverage. Do not modify the user's extension directory or hotkeys implicitly.

`make test` exercises script dispatch on a headless machine. The live journeys
below exercise the real executable and observe window and Space changes.

- **Shell script route.** Focus `Ferry follow test: target` and run `"$FERRY_VERIFY"
  capture "$FERRY_EVIDENCE" raycast-shell env FERRY_BINARY="$FERRY_BIN"
  /bin/zsh raycast/ferry-to-space-2.sh`. Require exit 0, empty streams, target on
  Space 2 and active Space 2, sibling still on Space 1. This proves the real
  wrapper and binary, not Raycast UI dispatch.
- **Missing binary.** Run `"$FERRY_VERIFY" capture "$FERRY_EVIDENCE"
  raycast-missing env FERRY_BINARY="$FERRY_EVIDENCE/scratch/not-installed"
  /bin/zsh raycast/ferry-to-space-2.sh`. Require exit 127 and `ferry binary not
  found` plus the Homebrew hint in stderr, without moving anything.
- **Raycast action.** In a fresh fixture source state, invoke Raycast, search the
  exact command title above, and choose it. Capture the action, selected target's
  destination and active Space. First establish that the script's binary lookup
  resolves this build; a terminal export does not propagate into Raycast. If
  that cannot be established without changing persistent settings, report the
  unmet precondition and keep the shell result separate.
- **Hotkey.** From another fresh source state, focus the fixture target and press
  the already assigned shortcut. Require the same target/sibling/focus outcome.
- **Other scripts and lookup paths.** Repeat with each Space's named script only
  when that normal destination exists; record each separately. For an unset
  override, observe the executable selected by the script's actual search order
  and require it to match this run's build before moving a fixture. Do not replace
  installed executables just to manufacture lookup coverage.

## Gotchas

- Space 3–5 or Raycast configuration may be absent; those paths stay unverified.
- Scripts prefer `FERRY_BINARY`, then PATH and standard install directories,
  then the checkout's `build/`. The isolated scratch binary needs the override.
- Homebrew installs the binary but does not install these scripts.
