#!/bin/bash
# Build output tests: the shipped binary must match the architecture and
# deployment target in the Makefile and link AppKit.

set -euo pipefail

binary="${1:?usage: tests/binary.sh <binary> <arch> <minimum-macos>}"
arch="${2:?usage: tests/binary.sh <binary> <arch> <minimum-macos>}"
minimum_macos="${3:?usage: tests/binary.sh <binary> <arch> <minimum-macos>}"
failures=0

check() {
  local name="$1" expected="$2" actual="$3"

  if [[ "$actual" != "$expected" ]]; then
    echo "FAIL: $name: expected $expected, got $actual" >&2
    failures=$((failures + 1))
  else
    echo "ok: $name"
  fi
}

check "architecture"   "$arch"          "$(lipo -archs "$binary")"
check "minimum macOS"  "$minimum_macos" "$(otool -l "$binary" | awk '$1 == "minos" { print $2; exit }')"
check "links AppKit"   "yes"            "$(otool -L "$binary" | grep -q '/AppKit.framework/' && echo yes || echo no)"

if ((failures)); then
  echo "$failures test(s) failed" >&2
  exit 1
fi
