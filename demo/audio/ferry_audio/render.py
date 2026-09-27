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
    track = np.clip(track, -0.95, 0.95)
    stereo = np.column_stack((track, track))
    output.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(output), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes((stereo * 32767).astype("<i2").tobytes())
    return output
