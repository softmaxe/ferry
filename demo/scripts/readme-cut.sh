#!/bin/zsh
# Re-encodes a rendered master to fit GitHub's 10 MB limit for videos attached on free plans:
# scripts/readme-cut.sh out/ferry-en.mp4 out/ferry-en-readme.mp4
set -euo pipefail
zmodload zsh/mathfunc
src=$1
dst=$2
limit_bytes=$((10 * 1000 * 1000))
duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
audio_kbps=96
# Leave 4% for container overhead.
video_kbps=$(( int((limit_bytes * 8 * 0.96) / 1000 / duration) - audio_kbps - 20 ))
workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT
passlog=$workdir/pass
ffmpeg -loglevel error -y -i "$src" -c:v libx264 -preset slow -b:v ${video_kbps}k -pass 1 -passlogfile "$passlog" -an -f mp4 /dev/null
ffmpeg -loglevel error -y -i "$src" -c:v libx264 -preset slow -b:v ${video_kbps}k -pass 2 -passlogfile "$passlog" \
  -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a ${audio_kbps}k "$dst"
size=$(stat -f %z "$dst")
echo "$dst: $size bytes (${video_kbps} kb/s video)"
(( size <= limit_bytes )) || { echo "over the 10 MB limit" >&2; exit 1; }
