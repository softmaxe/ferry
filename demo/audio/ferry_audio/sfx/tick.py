"""A glassy confirmation chime in D major."""
import numpy as np
from ..dsp import tone


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    return 0.65 * tone(1174.659, 0.5, sample_rate, 12) + 0.25 * tone(1760, 0.5, sample_rate, 18)
