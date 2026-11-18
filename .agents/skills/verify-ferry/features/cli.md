# CLI discovery and validation

Users discover the syntax and version without moving windows, and receive useful
argument errors with a distinct exit status.

## Sub-features

- `cli-help`: `--help` and `-h` print identical usage to stdout, exit 0.
- `cli-version`: `--version` prints `ferry` and the Makefile version, exit 0.
- `cli-invalid`: absent, nonnumeric, zero, overflowing, duplicate, and unknown
  arguments are rejected with exit 2; invalid/missing window IDs are rejected.
- `cli-streams`: success text goes to stdout; argument errors go to stderr.

## How to get to it (user POV)

Run `ferry --help`, `ferry -h`, or `ferry --version` from a terminal. Invalid
invocations use the same executable, not a separate validation interface.

## Driving it with verify.sh

Preconditions: launch and doctor passed; no live desktop or Accessibility needed.

- **Drive all mapped CLI cases.** Run `/usr/bin/script -q
  "$FERRY_EVIDENCE/cli.pty.txt" "$FERRY_VERIFY" cli "$FERRY_EVIDENCE"`.
  Require exit 0 and the final `PASS:` line.
- **Inspect proof.** `help`, `help-short`, `version`, and `invalid-index` action
  folders contain example streams and statuses. `contract/stdout.txt` records
  the passing cases from `tests/cli.sh`, which checks help alias equivalence,
  the version, stream routing, and argument diagnostics.
- **Confirm teardown.** Run the skill cleanup. The PTY transcript and all action
  folders remain while `scratch/ferry` is removed.

## Gotchas

- Valid destination arguments would enter real window-management code. The safe
  cases above exit during parsing, before WindowServer access; this is not a mock.
- A `make test` pass does not prove a move or a Space focus change.
