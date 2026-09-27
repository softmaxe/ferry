"""Dry friction noise as a pen moves across paper."""
import numpy as np


def synthesize(sample_rate: int, seed: int, space: int | None = None) -> np.ndarray:
    t = np.arange(round(0.4 * sample_rate)) / sample_rate
    noise = np.random.default_rng(seed).normal(0, 0.4, len(t))
    friction = noise - np.convolve(noise, np.ones(11) / 11, mode="same")
    gesture = np.sin(np.pi * t / 0.4) ** 2 * (0.65 + 0.35 * np.sin(2 * np.pi * 21 * t) ** 2)
    return friction * gesture
