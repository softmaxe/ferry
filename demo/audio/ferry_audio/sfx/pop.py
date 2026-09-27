"""Synthesized pop cue."""
import numpy as np
from ..dsp import tone


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    return tone(480, 0.12, sample_rate, 35)
