"""A short wooden landing with a low resonant body."""
import numpy as np
from ..dsp import tone


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    out = tone(90, 0.2, sample_rate, 30)
    t = np.arange(len(out)) / sample_rate
    noise = np.random.default_rng(seed).normal(0, 0.25, len(out))
    return out + noise * np.exp(-100 * t) * np.minimum(t / 0.001, 1)
