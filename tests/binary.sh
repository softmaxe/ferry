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

architecture="$(lipo -archs "$binary")"
deployment="$(vtool -show-build "$binary" | awk '$1 == "platform" { platform = $2 } $1 == "minos" { print platform, $2 }')"
appkit="$(otool -L "$binary" | awk 'NR > 1 && $1 ~ /\/AppKit\.framework\/(Versions\/[^\/]+\/)?AppKit$/ { found = 1 } END { print found ? "yes" : "no" }')"

check "architecture" "$arch" "$architecture"
check "minimum macOS" "MACOS $minimum_macos" "$deployment"
check "links AppKit" "yes" "$appkit"

if ((failures)); then
  echo "$failures test(s) failed" >&2
  exit 1
fi
