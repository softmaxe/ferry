"""Wood, string and struck-bar voices made from oscillators and a feedback delay."""

from __future__ import annotations

import numpy as np


def frequency(note: int) -> float:
    return 440 * 2 ** ((note - 69) / 12)


def envelope(sound: np.ndarray, sample_rate: int, attack: float, release: float) -> np.ndarray:
    attack_samples = min(len(sound), round(attack * sample_rate))
    release_samples = min(len(sound) - attack_samples, round(release * sample_rate))
    sound[:attack_samples] *= np.linspace(0, 1, attack_samples)
    if release_samples:
        sound[-release_samples:] *= np.linspace(1, 0, release_samples)
    return sound


def pluck(note: int, seconds: float, sample_rate: int, seed: int, *, harp: bool = False) -> np.ndarray:
    """Karplus-Strong string with fractional tuning and a damped feedback loop.

    Each pass averages adjacent delay samples, then interpolates the remaining
    fractional delay. Blocks contain one delay period; the two preceding samples
    carry across blocks so the recurrence also holds at the block boundaries.
    """
    hz = frequency(note)
    period = sample_rate / hz
    delay = max(3, int(period - 0.5))
    fraction = period - delay - 0.5
    weights = (0.5 * (1 - fraction), 0.5, 0.5 * fraction)
    rng = np.random.default_rng(seed)
    phase = np.arange(delay) / delay
    displacement = np.where(phase < 0.22, phase / 0.22, (1 - phase) / 0.78) - 0.5
    noise = np.convolve(rng.uniform(-1, 1, delay), np.ones(5) / 5, mode="same")
    excitation = displacement + (0.13 if harp else 0.3) * noise
    excitation -= excitation.mean()
    excitation /= max(np.max(np.abs(excitation)), 1e-8)
    out = np.zeros(round(seconds * sample_rate))
    out[:min(delay, len(out))] = excitation[:len(out)]
    previous = excitation
    history = excitation[-2:]
    damping = np.exp(-period / sample_rate / (1.15 if harp else 0.68))
    for start in range(delay, len(out), delay):
        padded = np.concatenate((history, previous))
        current = damping * (weights[0] * padded[2:] + weights[1] * padded[1:-1] + weights[2] * padded[:-2])
        length = min(delay, len(out) - start)
        out[start:start + length] = current[:length]
        history, previous = previous[-2:], current
    return envelope(out, sample_rate, 0.003, 0.12)


def bass(note: int, seconds: float, sample_rate: int) -> np.ndarray:
    t = np.arange(round(seconds * sample_rate)) / sample_rate
    phase = 2 * np.pi * frequency(note) * t
    sound = (np.sin(phase) + 0.22 * np.sin(2 * phase) + 0.055 * np.sin(3 * phase)) * np.exp(-t / 0.52)
    return envelope(sound, sample_rate, 0.013, 0.14)


def glock(note: int, seconds: float, sample_rate: int) -> np.ndarray:
    t = np.arange(round(seconds * sample_rate)) / sample_rate
    hz = frequency(note)
    sound = np.zeros(len(t))
    for ratio, gain, decay in ((1, 1, 0.85), (2.76, 0.20, 0.18), (5.4, 0.055, 0.07)):
        if hz * ratio < sample_rate / 2:
            sound += gain * np.sin(2 * np.pi * hz * ratio * t) * np.exp(-t / decay)
    return envelope(sound, sample_rate, 0.002, 0.08)


def paper(seconds: float, sample_rate: int) -> np.ndarray:
    rng = np.random.default_rng(504)
    noise = rng.standard_normal(round(seconds * sample_rate))
    high = noise - np.convolve(noise, np.ones(19) / 19, mode="same")
    grain = np.convolve(high, np.ones(3) / 3, mode="same")
    t = np.arange(len(noise)) / sample_rate
    grain *= 0.65 + 0.2 * np.sin(2 * np.pi * 0.21 * t) + 0.15 * np.sin(2 * np.pi * 0.37 * t)
    return envelope(grain, sample_rate, 1.5, 1.5)
