"""Read the same bar-grid JSON as the Remotion picture."""
from __future__ import annotations
import json
import math
from pathlib import Path
DEFAULT_TIMELINE = Path(__file__).resolve().parents[2] / "src/handdrawn/timeline.json"


def load(path: Path = DEFAULT_TIMELINE) -> dict:
    return json.loads(path.read_text())


def position_seconds(timeline: dict, position: list[float]) -> float:
    bar, eighth = position
    return ((bar - 1) * timeline["eighthsPerBar"] + eighth) * 60 / timeline["dottedQuarterBpm"] / 3


def duration_seconds(timeline: dict) -> float:
    seconds = position_seconds(timeline, [timeline["bars"] + 1, 0])
    return math.ceil(seconds * timeline["fps"]) / timeline["fps"]
