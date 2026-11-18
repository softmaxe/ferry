#!/bin/bash
# Exercise Script Command dispatch without launching a window manager.
set -euo pipefail

scripts="$(cd "$(dirname "$0")/../raycast" && pwd)"
scratch="$(mktemp -d)"
trap 'rm -rf "$scratch"' EXIT
cd "$scratch"

# echo makes every forwarded argument visible. The second executable has a
# space in its name and a different exit status to distinguish the override.
mkdir bin
ln -s /bin/echo bin/ferry
ln -s /usr/bin/false 'custom ferry'
export PATH="$scratch/bin:$PATH"
unset FERRY_BINARY

for space in 1 2 3 4 5; do
  script="$scripts/ferry-to-space-$space.sh"
  if ! output="$("$script")" || [[ "$output" != "$space" ]]; then
    echo "FAIL: $script must forward Space $space to ferry on PATH" >&2
    exit 1
  fi

  status=0
  FERRY_BINARY='custom ferry' "$script" || status=$?
  if [[ "$status" != 1 ]]; then
    echo "FAIL: $script did not return the override executable's status" >&2
    exit 1
  fi

  status=0
  FERRY_BINARY="$scratch" "$script" >out 2>err || status=$?
  if [[ "$status" != 127 || -s out ]] || ! grep -Fq 'brew install softmaxe/tap/ferry' err; then
    echo "FAIL: $script must reject a directory and print the installation hint to stderr" >&2
    exit 1
  fi
done
echo "ok: Raycast Space arguments, binary lookup, and error reporting"
