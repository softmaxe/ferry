#!/bin/bash
# All invocations exit during argument parsing, before reaching WindowServer.
set -euo pipefail

binary="${1:?usage: tests/cli.sh <binary> <version>}"
version="${2:?usage: tests/cli.sh <binary> <version>}"
streams="$(mktemp -d)"
trap 'rm -rf -- "$streams"' EXIT

run() {
  local expected_status="$1" status=0 unexpected="$streams/stderr"
  shift
  "$binary" "$@" > "$streams/stdout" 2> "$streams/stderr" || status=$?
  if ((expected_status != 0)); then unexpected="$streams/stdout"; fi
  if ((status != expected_status)) || [[ -s "$unexpected" ]]; then
    echo "FAIL: ferry $*: expected exit $expected_status and empty ${unexpected##*/}, got exit $status" >&2
    cat "$streams/stdout" "$streams/stderr" >&2
    exit 1
  fi
}

check_error() {
  local name="$1" message="$2"
  shift 2
  run 2 "$@"
  if ! grep -Fq -- "$message" "$streams/stderr"; then
    echo "FAIL: $name: expected '$message' in stderr" >&2
    cat "$streams/stderr" >&2
    exit 1
  fi
  echo "ok: $name"
}

run 0 --version
printf 'ferry %s\n' "$version" | diff -u - "$streams/stdout"
echo 'ok: version'

run 0 --help
grep -q '^usage: ferry ' "$streams/stdout"
mv "$streams/stdout" "$streams/help"
run 0 -h
diff -u "$streams/help" "$streams/stdout"
echo 'ok: help aliases'

check_error 'no arguments'            'usage: ferry'
check_error 'non-numeric index'       "invalid space index 'abc'" abc
check_error 'zero index'              "invalid space index '0'" 0
check_error 'overflowing index'       "invalid space index '2147483648'" 2147483648
check_error 'invalid window id'       "invalid window id 'x'" --window x 1
check_error 'overflowing window id'   "invalid window id '4294967296'" --window 4294967296 1
check_error 'missing window id value' 'usage: ferry' --window
check_error 'unknown option'          'usage: ferry' --bogus 1
check_error 'two indexes'             'usage: ferry' 1 2
