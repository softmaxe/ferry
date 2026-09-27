"""Synthesized pen cue."""
import numpy as np
from ..dsp import tone


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    return tone(3200, 0.35, sample_rate, 12)
