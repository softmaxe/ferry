"""The initial rocking 6/8 bed, ready for the full barcarolle score."""
import numpy as np
from .dsp import add, tone
from .timeline import duration_seconds, position_seconds


def synthesize(timeline: dict, sample_rate: int) -> np.ndarray:
    out = np.zeros(round(duration_seconds(timeline) * sample_rate))
    roots = [146.8324, 146.8324, 195.9977, 220.0]
    for bar in range(1, timeline["bars"] + 1):
        root = roots[((bar - 1) // 2) % len(roots)]
        for eighth in (0, 3):
            start = round(position_seconds(timeline, [bar, eighth]) * sample_rate)
            add(out, tone(root if eighth == 0 else root * 1.5, 1.4, sample_rate, 3.5), start, 0.08)
    return out
