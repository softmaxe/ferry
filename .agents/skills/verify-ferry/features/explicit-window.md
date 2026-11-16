# Move an explicit window

Users select a particular macOS window ID even when its app is in the background.
The selected window moves and follows; another window from the same app stays.

## Sub-features

- `explicit-background`: select a background app's non-key window by ID.
- `explicit-already-there`: a repeated destination succeeds without another move.
- `explicit-stale-id`: a nonexistent window ID fails with runtime exit 1.

## How to get to it (user POV)

Run `ferry --window 1234 2`, replacing the example ID with a current macOS window
ID. IDs identify windows, not processes, and become stale when windows close.

## Driving it with verify.sh

Preconditions: launch/doctor passed; live local desktop, Accessibility, two normal
Spaces on its active display, and no other desktop journey running.

- **Background selection and repeated destination.** Run `"$FERRY_VERIFY"
  desktop "$FERRY_EVIDENCE"`. Require `ok: background --window moves and follows
  the selected window` and `ok: --window already on the active destination Space`.
  The harness creates two windows, backgrounds them, selects the non-key one,
  calls the real CLI, and independently checks selected/sibling Space membership.
- **Inspect action evidence.** `desktop/command.txt` identifies the checkout binary
  passed to `make`; `desktop/stdout.txt` includes real IDs, indexes, verbose
  results, and assertions. Require overall exit 0 and no `SKIP:`/`FAIL:`.
- **Stale ID.** In a separate manual fixture journey from the index, retain
  `FERRY_TARGET`, close that fixture through its recorded PID, and immediately run
  `"$FERRY_VERIFY" capture "$FERRY_EVIDENCE" stale-window "$FERRY_BIN" --window
  "$FERRY_TARGET" 2`. Require exit 1 and `window N not found` in stderr, with no
  other window moved. If the OS reused that ID, fail the setup and use a new run.

## Gotchas

- Harness exit 77 or a `SKIP:` message is missing coverage, not success. `make`
  can translate it into exit 2. Look at both streams.
- Resolving an ID on an inactive Space may lack AX support: ferry can move
  successfully without following. Verify actual active Space independently.
- The regression checks already-there on the active destination. Already-there
  on an inactive destination is a distinct precondition and is not covered.
- Existing harness cleanup runs in `@finally`; force termination can bypass it.
