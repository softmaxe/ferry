# Move the focused window

The positional command moves the focused normal window to an existing Space and
follows it. Accessibility identifies the focused window; the visible window list
provides a fallback if the app's focused Accessibility window cannot be read.

## Sub-features

- `focused-move`: choose the focused window without passing `--window`.
- `focused-selection`: move the chosen window, leaving its sibling in place.
- `focused-fallback`: use the frontmost app's visible normal window without AX.

## How to get to it (user POV)

Run `ferry 2` in a terminal to move that terminal, or bind the same command to a
launcher/hotkey to move another app's focused window. Raycast has its own recipe.

## Driving it with verify.sh and native UI

Preconditions: manual desktop baseline and fixture from the index; both windows
start on global Space 1. Capture source state and start a short screen recording.

- **Choose a window.** With native UI control, activate the fixture and focus
  `Ferry follow test: target`. Run commands through the agent's non-GUI shell so
  it does not steal focus. If the tool activates another app, stop and fix setup.
- **Move it.** Run `"$FERRY_VERIFY" capture "$FERRY_EVIDENCE" focused-move
  "$FERRY_BIN" --verbose 2`. Require exit 0 and a verbose window ID equal to
  `FERRY_TARGET`, with `via accessibility` and `focus requested`.
- **Prove the result.** Observe the active destination Space 2 and target window;
  visit Space 1 to confirm `Ferry follow test: other window` stayed. Save before,
  after, recording, and the observations in the artifact directory.
- **Fallback entry.** Only in a launcher already lacking Accessibility, repeat
  a fresh fixture journey. Require `via window list`, the selected visible normal
  window's ID, its actual destination, and actual focus outcome. Do not revoke
  the user's permissions to manufacture this state.
- **Terminal entry.** If separately claiming interactive terminal coverage, use
  a disposable terminal window, type the same positional command there, and
  observe that terminal move and follow. The non-GUI fixture route does not prove
  terminal launch behavior; close only the disposable window afterward.

## Gotchas

- The existing `test-follow` always uses `--window`; it does not cover this path.
- Missing AX or terminal UI access leaves the corresponding entry unverified.
- The focused window at invocation matters. Running in an existing terminal
  moves a user's terminal and violates the disposable-window baseline.
- AX fallback may select a different normal window when an app has several;
  record the observed window ID rather than assuming it is the key window.
