"""A quiet D-major boat horn with a soft attack."""
import numpy as np


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    t = np.arange(round(0.6 * sample_rate)) / sample_rate
    tone = np.sin(2 * np.pi * 146.8324 * t) + 0.22 * np.sin(2 * np.pi * 293.6648 * t)
    envelope = np.minimum(t / 0.07, 1) * np.minimum((0.6 - t) / 0.2, 1)
    return 0.7 * tone * envelope
