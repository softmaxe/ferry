#!/bin/zsh
# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Ferry Window to Space 2
# @raycast.mode silent
# @raycast.packageName Ferry
# @raycast.icon ⛴️
# @raycast.description Move the focused window to Space 2 and follow it

set -euo pipefail

space=2

# Raycast runs scripts with a minimal PATH, so also search the usual install
# locations and this checkout's build/ directory, after the inherited PATH.
path+=(/opt/homebrew/bin /usr/local/bin "$HOME/.local/bin" "${0:A:h:h}/build")
binary_path="${FERRY_BINARY:-$(whence -p ferry || true)}"

if [[ ! -x "$binary_path" ]]; then
  print -u2 "ferry binary not found. Install it with: brew install softmaxe/tap/ferry"
  exit 127
fi

exec "$binary_path" "$space"
