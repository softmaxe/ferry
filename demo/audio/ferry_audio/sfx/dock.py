"""Synthesized dock cue."""
import numpy as np
from ..dsp import tone


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    return tone(90, 0.18, sample_rate, 30)
