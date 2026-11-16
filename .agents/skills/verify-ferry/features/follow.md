# Follow and no-follow

Default movement requests focus on the destination window. `--no-follow` moves
the window while keeping the active Space unchanged; verbose output explains
what ferry requested and measures its own work.

## Sub-features

- `follow-default`: the selected window moves and the active Space follows.
- `follow-disabled`: movement succeeds while the active Space remains unchanged.
- `follow-verbose`: window, selection method, destination and timings are visible.
- `follow-silent`: a successful move without `--verbose` produces no output.

## How to get to it (user POV)

Run `ferry 2`, `ferry --no-follow 2`, or add `--verbose` and/or `--window` to either
command. Raycast scripts invoke the default follow path silently.

## Driving it with verify.sh and native UI

Preconditions: the desktop harness baseline for the automated route; the manual
fixture baseline from the index for silent output and visual proof.

- **Automated default and no-follow.** Run `"$FERRY_VERIFY" desktop
  "$FERRY_EVIDENCE"` once per run. Require the background-follow assertion and
  `ok: --no-follow leaves the active Space unchanged`. The latter returns the
  selected window to source while independently checking the active destination
  is unchanged. Verbose records must include `focus requested` then `not followed`.
- **Silent no-follow.** In a fresh manual fixture on Space 1 run `"$FERRY_VERIFY"
  capture "$FERRY_EVIDENCE" silent-no-follow "$FERRY_BIN" --no-follow --window
  "$FERRY_TARGET" 2`. Require exit 0 and empty stdout/stderr. Observe Space 1
  still active and confirm the target is on Space 2, sibling on Space 1.
- **Silent default.** From the same observed fixture, run `"$FERRY_VERIFY" capture
  "$FERRY_EVIDENCE" silent-follow "$FERRY_BIN" --window "$FERRY_TARGET" 1`.
  Require empty streams, exit 0, target back on source Space 1 and focus there.
- **Visual proof.** Record the complete action and before/after Space/window state.
  Use actual visible switching to assess animation; the verbose timer excludes it.

## Gotchas

- No-follow really moves the window. It is not a safe no-op or dry-run option.
- `focus requested` alone cannot prove the screen followed.
- On inactive Spaces, missing Accessibility window references can prevent Follow.
- Automated verbose coverage does not cover silent output or focused selection.
