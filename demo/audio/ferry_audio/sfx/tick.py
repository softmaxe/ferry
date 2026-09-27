"""Synthesized tick cue."""
import numpy as np
from ..dsp import tone


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    return tone(1174.66, 0.4, sample_rate, 12)
