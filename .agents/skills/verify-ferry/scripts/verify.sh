#!/bin/bash
# Build and drive the real CLI while retaining commands, streams, and statuses.
set -euo pipefail

root="$(cd "$(dirname "$0")/../../../.." && pwd -P)"
mode="${1:-}"
if [[ "$mode" != launch ]]; then
  run="${2:?usage: verify.sh launch | doctor/cli/desktop/cleanup <evidence-dir> | capture <evidence-dir> <label> <command> [args...]}"
  run="$(cd "$run" && pwd -P)"
  [[ -f "$run/checkout.txt" && "$(cat "$run/checkout.txt")" == "$root" ]] || {
    printf 'Refusing evidence directory from another checkout\n' >&2
    exit 2
  }
fi
cd "$root"
inputs=(Makefile src/*.m tests/*.m tests/*.sh raycast/*.sh .agents/skills/verify-ferry/scripts/verify.sh)

capture() {
  local label="$1" status=0
  shift
  local step="$run/$label"
  mkdir "$step" || return 1
  {
    printf 'cwd: %s\ncommand: ' "$root"
    printf '%q ' "$@"
    printf '\n'
  } > "$step/command.txt"
  "$@" > "$step/stdout.txt" 2> "$step/stderr.txt" || status=$?
  printf '%s\n' "$status" > "$step/exit-code.txt"
  return "$status"
}

if [[ "$mode" == launch ]]; then
  run="$(mktemp -d "${TMPDIR:-/tmp}/ferry-verification.XXXXXX")"
  printf '%s\n' "$root" > "$run/checkout.txt"
  mkdir "$run/scratch"
  shasum -a 256 "${inputs[@]}" > "$run/source.sha256"
  sw_vers > "$run/platform.txt"
  git rev-parse HEAD > "$run/revision.txt"
  git diff HEAD -- Makefile src tests raycast .agents/skills/verify-ferry/scripts/verify.sh > "$run/source.diff"
  if ! capture build make BIN="$run/scratch/ferry" all; then
    rm -rf -- "$run/scratch"
    printf 'Build failed; evidence retained at %s\n' "$run" >&2
    exit 1
  fi
  (cd "$run" && shasum -a 256 scratch/ferry > binary.sha256)
  printf '%s\n' "$run"
  exit 0
fi

binary="$run/scratch/ferry"

case "$mode" in
  doctor|cli|desktop)
    version="$(make -s print-version)"
    [[ -x "$binary" ]]
    shasum -a 256 "${inputs[@]}" | cmp "$run/source.sha256" -
    (cd "$run" && shasum -a 256 -c binary.sha256)
    [[ "$("$binary" --version)" == "ferry $version" ]]
    make -s -o "$binary" BIN="$binary" test-binary
    ;;
esac

case "$mode" in
  doctor)
    printf 'Ready for CLI verification.\n'
    ;;
  cli)
    capture help "$binary" --help
    capture help-short "$binary" -h
    capture version "$binary" --version
    status=0
    capture invalid-index "$binary" abc || status=$?
    [[ "$status" == 2 ]]
    capture contract tests/cli.sh "$binary" "$version"
    printf 'PASS: CLI discovery, stream routing, and argument validation\n'
    ;;
  desktop)
    lock="${TMPDIR:-/tmp}/ferry-verification-desktop.lock"
    mkdir "$lock" || {
      printf 'Desktop verification already reserved: %s\n' "$lock" >&2
      exit 1
    }
    trap 'rmdir "$lock"' EXIT
    # Reuse the owned-window regression, including its restoration and finally block.
    capture desktop make -o "$binary" BIN="$binary" test-follow
    cat "$run/desktop/stdout.txt"
    ;;
  capture)
    shift 2
    label="${1:?missing evidence label}"
    [[ "$label" =~ ^[a-z0-9][a-z0-9-]*$ ]] || exit 2
    shift
    [[ $# -gt 0 ]] || { printf 'Missing capture command\n' >&2; exit 2; }
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
