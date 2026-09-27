"""Each timeline cue type has one synthesis module."""
from importlib import import_module


def synthesize(kind: str, sample_rate: int, seed: int, space: int | None = None):
    return import_module(f"{__name__}.{kind}").synthesize(sample_rate, seed, space)
