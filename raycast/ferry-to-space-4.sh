#!/bin/zsh
# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Ferry Window to Space 4
# @raycast.mode silent
# @raycast.packageName Ferry
# @raycast.icon ⛴️
# @raycast.description Move the focused window to Space 4 and follow it

set -euo pipefail

space=4
script_dir="${0:A:h}"
project_dir="${script_dir:h}"

if [[ -n "${FERRY_BINARY:-}" ]]; then
  binary_path="$FERRY_BINARY"
elif binary_path="$(command -v ferry 2>/dev/null)" && [[ -x "$binary_path" ]]; then
  :
else
  binary_path=""
  for candidate in \
    "/opt/homebrew/bin/ferry" \
    "/usr/local/bin/ferry" \
    "$HOME/.local/bin/ferry" \
    "$project_dir/build/ferry"; do
    if [[ -x "$candidate" ]]; then
      binary_path="$candidate"
      break
    fi
  done
fi

if [[ -z "$binary_path" || ! -x "$binary_path" ]]; then
  print -u2 "ferry binary not found. Install it with: brew install softmaxe/tap/ferry"
  exit 127
fi

exec "$binary_path" "$space"
