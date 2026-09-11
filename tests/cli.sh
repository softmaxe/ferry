#!/bin/bash
# Command-line contract tests. They exit before any window server call, so
# they do not move windows and run on headless CI machines.

set -euo pipefail

binary="${1:?usage: tests/cli.sh <binary> <version>}"
version="${2:?usage: tests/cli.sh <binary> <version>}"
failures=0

check() {
  local name="$1" expected_status="$2" expected_output="$3"
  shift 3

  local output status=0
  output="$("$binary" "$@" 2>&1)" || status=$?

  if [[ "$status" != "$expected_status" || "$output" != *"$expected_output"* ]]; then
    echo "FAIL: $name: exit $status, output: $output" >&2
    failures=$((failures + 1))
  else
    echo "ok: $name"
  fi
}

check "version"                 0 "ferry $version"                   --version
check "help"                    0 "usage: ferry"                     --help
check "no arguments"            2 "usage: ferry"
check "non-numeric index"       2 "invalid space index 'abc'"       abc
check "zero index"              2 "invalid space index '0'"         0
check "overflowing index"       2 "invalid space index"             99999999999
check "invalid window id"       2 "invalid window id 'x'"           --window x 1
check "missing window id value" 2 "usage: ferry"                     --window
check "unknown option"          2 "usage: ferry"                     --bogus 1
check "two indexes"             2 "usage: ferry"                     1 2

if ((failures)); then
  echo "$failures test(s) failed" >&2
  exit 1
fi
