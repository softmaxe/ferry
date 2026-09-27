"""A small descending bubble for notes and UI panels."""
import numpy as np


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    t = np.arange(round(0.12 * sample_rate)) / sample_rate
    phase = 2 * np.pi * (720 * t - 2000 * t * t)
    return np.sin(phase) * np.exp(-35 * t) * np.minimum(t / 0.003, 1)
