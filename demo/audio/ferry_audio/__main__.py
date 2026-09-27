import argparse
from pathlib import Path
from .render import render
from .timeline import DEFAULT_TIMELINE, load
parser = argparse.ArgumentParser(description="Synthesize the ferry soundtrack using numpy.")
parser.add_argument("--timeline", type=Path, default=DEFAULT_TIMELINE)
parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[2] / "public/handdrawn.wav")
parser.add_argument("--sfx-only", action="store_true")
args = parser.parse_args()
print(render(load(args.timeline), args.output, music_enabled=not args.sfx_only))
