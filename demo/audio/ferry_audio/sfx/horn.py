"""Synthesized horn cue."""
import numpy as np
from ..dsp import tone


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    return tone(146.832, 0.55, sample_rate, 4)
