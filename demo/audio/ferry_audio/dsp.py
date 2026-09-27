"""Small deterministic numpy synthesis helpers; no samples or downloads."""
import numpy as np


def tone(frequency: float, duration: float, sample_rate: int, decay: float = 8) -> np.ndarray:
    t = np.arange(round(duration * sample_rate)) / sample_rate
    attack = np.minimum(t / 0.004, 1)
    return (np.sin(2 * np.pi * frequency * t) + 0.2 * np.sin(4 * np.pi * frequency * t)) * np.exp(-decay * t) * attack


def add(destination: np.ndarray, sound: np.ndarray, start: int, gain: float = 1) -> None:
    length = min(len(sound), len(destination) - start)
    if length > 0:
        destination[start:start + length] += sound[:length] * gain
