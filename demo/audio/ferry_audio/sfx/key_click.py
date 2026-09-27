"""A short keyboard mechanism click."""
import numpy as np
from ..dsp import tone


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    out = tone(1700, 0.065, sample_rate, 100)
    t = np.arange(len(out)) / sample_rate
    return 0.3 * out + 0.3 * np.random.default_rng(seed).normal(0, 1, len(out)) * np.exp(-120 * t) * np.minimum(t / 0.001, 1)
