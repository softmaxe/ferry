#!/bin/zsh
# Tiles PNGs into a 2-column contact sheet: scripts/sheet.sh out.png a.png b.png ...
set -euo pipefail
out=$1; shift
n=$#
rows=$(( (n + 1) / 2 ))
inputs=()
for f in "$@"; do inputs+=(-i "$f"); done
filter=""
for i in $(seq 0 $((n - 1))); do filter+="[$i:v]scale=960:540[s$i];"; done
layout=""
for i in $(seq 0 $((n - 1))); do
  x=$(( (i % 2) * 960 )); y=$(( (i / 2) * 540 ))
  layout+="${x}_${y}|"
done
stack=""
for i in $(seq 0 $((n - 1))); do stack+="[s$i]"; done
if (( n == 1 )); then
  ffmpeg -loglevel error -y "${inputs[@]}" -vf scale=960:540 "$out"
else
  ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "${filter}${stack}xstack=inputs=${n}:layout=${layout%|}:fill=white" "$out"
fi
