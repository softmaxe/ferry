"""Exercise the WAV boundary using the same timeline as the picture."""
import wave
import numpy as np
import pytest
from ferry_audio.render import render
from ferry_audio.timeline import duration_seconds, load, position_seconds


@pytest.mark.parametrize("music_enabled", [True, False], ids=["mix", "isolated-cues"])
def test_wav_length_and_cue_energy(tmp_path, music_enabled):
    timeline = load()
    output = render(timeline, tmp_path / "film.wav", music_enabled=music_enabled)
    with wave.open(str(output), "rb") as wav:
        sample_rate = wav.getframerate()
        assert wav.getnchannels() == 2
        assert wav.getsampwidth() == 2
        assert abs(wav.getnframes() / sample_rate - duration_seconds(timeline)) <= 1 / sample_rate
        samples = np.frombuffer(wav.readframes(wav.getnframes()), dtype="<i2").astype(float).reshape(-1, 2) / 32768
    assert np.max(np.abs(samples)) < 1
    for cue in timeline["cues"]:
        start = round(position_seconds(timeline, cue["at"]) * sample_rate)
        signal = samples[start:start + round(0.06 * sample_rate)]
        assert np.sqrt(np.mean(signal ** 2)) > 0.002, cue["id"]
