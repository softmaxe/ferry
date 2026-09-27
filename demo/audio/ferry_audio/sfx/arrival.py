"""Each Space sounds its scale degree in D major."""
import numpy as np
from ..dsp import tone


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    notes = [587.3295, 659.2551, 739.9888, 783.9909, 880.0]
    return tone(notes[(space or 1) - 1], 0.7, sample_rate, 7)
