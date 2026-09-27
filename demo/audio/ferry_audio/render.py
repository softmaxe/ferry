from __future__ import annotations
import wave
from pathlib import Path
import numpy as np
from . import music, sfx
from .dsp import add
from .timeline import duration_seconds, position_seconds
SAMPLE_RATE = 48_000


def render(timeline: dict, output: Path, *, sample_rate: int = SAMPLE_RATE, music_enabled: bool = True) -> Path:
    track = music.synthesize(timeline, sample_rate) if music_enabled else np.zeros(round(duration_seconds(timeline) * sample_rate))
    for index, cue in enumerate(timeline["cues"]):
        sound = sfx.synthesize(cue["type"], sample_rate, index + 13, cue.get("space"))
        add(track, sound, round(position_seconds(timeline, cue["at"]) * sample_rate), 0.33)
    stereo = np.column_stack((track, track))
    # Short asymmetric reflections give the wooden instruments a small room.
    for channel, delay, gain in ((0, 0.037, 0.075), (1, 0.061, 0.065)):
        offset = round(delay * sample_rate)
        stereo[offset:, channel] += track[:-offset] * gain
    stereo = np.tanh(stereo)
    peak = np.max(np.abs(stereo))
    if peak > 0.89:
        stereo *= 0.89 / peak
    # Finish before the last second so the AAC encoder has room for its filter tail.
    silent_at = len(stereo) - round(1.1 * sample_rate)
    fade_at = max(0, silent_at - round(2 * sample_rate))
    stereo[fade_at:silent_at] *= np.cos(np.linspace(0, np.pi / 2, silent_at - fade_at))[:, None] ** 2
    stereo[silent_at:] = 0
    output.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(output), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes((stereo * 32767).astype("<i2").tobytes())
    return output
