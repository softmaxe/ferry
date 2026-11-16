#!/bin/bash
# Build and drive the real CLI while retaining commands, streams, and statuses.
set -euo pipefail

root="$(cd "$(dirname "$0")/../../../.." && pwd -P)"
self="$root/.agents/skills/verify-ferry/scripts/verify.sh"
mode="${1:-}"

capture() {
  local label="$1" status=0
  shift
  local step="$run/$label"
  mkdir "$step"
  {
    printf 'cwd: %s\ncommand: ' "$root"
    printf '%q ' "$@"
    printf '\n'
  } > "$step/command.txt"
  "$@" > "$step/stdout.txt" 2> "$step/stderr.txt" || status=$?
  printf '%s\n' "$status" > "$step/exit-code.txt"
  return "$status"
}

fingerprint() {
  (cd "$root" && shasum -a 256 src/ferry.m Makefile)
}

if [[ "$mode" == launch ]]; then
  run="$(mktemp -d "${TMPDIR:-/tmp}/ferry-verification.XXXXXX")"
  printf '%s\n' "$root" > "$run/checkout.txt"
  mkdir "$run/scratch"
  fingerprint > "$run/source.sha256"
  sw_vers > "$run/platform.txt"
  git -C "$root" rev-parse HEAD > "$run/revision.txt"
  git -C "$root" diff -- src/ferry.m Makefile > "$run/source.diff"
  if ! capture build make -C "$root" BIN="$run/scratch/ferry" all; then
    rm -rf -- "$run/scratch"
    printf 'Build failed; evidence retained at %s\n' "$run" >&2
    exit 1
  fi
  shasum -a 256 "$run/scratch/ferry" > "$run/binary.sha256"
  printf '%s\n' "$run"
  exit 0
fi

run="${2:?usage: verify.sh launch | doctor/cli/desktop/cleanup <evidence-dir> | capture <evidence-dir> <label> <command> [args...]}"
run="$(cd "$run" && pwd -P)"
[[ -f "$run/checkout.txt" && "$(cat "$run/checkout.txt")" == "$root" ]] || {
  printf 'Refusing evidence directory from another checkout\n' >&2
  exit 2
}
cd "$root"
binary="$run/scratch/ferry"
version="$(awk '$1 == "VERSION" && $2 == "=" {print $3; exit}' Makefile)"

case "$mode" in
  doctor)
    # Read-only with respect to the app and desktop. No permission prompt.
    [[ -x "$binary" ]]
    fingerprint | cmp -s "$run/source.sha256" -
    shasum -a 256 -c "$run/binary.sha256"
    [[ "$("$binary" --version)" == "ferry $version" ]]
    tests/binary.sh "$binary" arm64 26.0
    printf 'Ready for CLI verification; desktop permissions and Spaces are checked separately.\n'
    ;;
  cli)
    "$self" doctor "$run"
    capture help "$binary" --help
    capture help-short "$binary" -h
    capture version "$binary" --version
    status=0
    capture invalid-index "$binary" abc || status=$?
    [[ "$status" == 2 ]]
    [[ ! -s "$run/help/stderr.txt" && ! -s "$run/version/stderr.txt" ]]
    [[ ! -s "$run/invalid-index/stdout.txt" ]]
    cmp "$run/help/stdout.txt" "$run/help-short/stdout.txt"
    grep -q 'usage: ferry' "$run/help/stdout.txt"
    grep -q "invalid space index 'abc'" "$run/invalid-index/stderr.txt"
    capture contract tests/cli.sh "$binary" "$version"
    printf 'PASS: CLI discovery, stream routing, argument validation, and existing contract tests\n'
    ;;
  desktop)
    "$self" doctor "$run"
    lock="${TMPDIR:-/tmp}/ferry-verification-desktop.lock"
    mkdir "$lock" || {
      printf 'Desktop verification already reserved: %s\n' "$lock" >&2
      exit 1
    }
    trap 'rmdir "$lock"' EXIT
    # Reuse the owned-window regression, including its restoration and finally block.
    capture desktop make BIN="$binary" test-follow
    cat "$run/desktop/stdout.txt"
    ;;
  capture)
    shift 2
    label="${1:?missing evidence label}"
    [[ "$label" =~ ^[a-z0-9][a-z0-9-]*$ ]] || exit 2
    shift
    capture "$label" "$@"
    ;;
  cleanup)
    # The directory marker above binds this scratch directory to this checkout.
    rm -rf -- "$run/scratch"
    printf 'Scratch removed; evidence retained at %s\n' "$run" > "$run/cleanup.txt"
    cat "$run/cleanup.txt"
    ;;
  *)
    printf 'Unknown mode: %s\n' "$mode" >&2
    exit 2
    ;;
esac
