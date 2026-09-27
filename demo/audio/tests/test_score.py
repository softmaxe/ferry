"""Check the delivered PCM soundtrack without inspecting the synthesizer's notes."""

import json
import math
from pathlib import Path
import subprocess
import sys
import wave

import numpy as np
import pytest


@pytest.fixture(scope="module")
def soundtrack(tmp_path_factory):
    project = Path(__file__).resolve().parents[1]
    timeline_path = project.parent / "src/handdrawn/timeline.json"
    timeline = json.loads(timeline_path.read_text())
    output = tmp_path_factory.mktemp("score") / "handdrawn.wav"
    subprocess.run([sys.executable, "-m", "ferry_audio", "--timeline", str(timeline_path),
                    "--output", str(output)], cwd=project, check=True, capture_output=True, text=True)
    with wave.open(str(output)) as wav:
        assert wav.getnchannels() == 2
        assert wav.getsampwidth() == 2
        rate = wav.getframerate()
        samples = np.frombuffer(wav.readframes(wav.getnframes()), dtype="<i2").reshape(-1, 2) / 32768
    yield timeline, rate, samples
    output.unlink()
    output.parent.rmdir()


def seconds(timeline, position):
    bar, eighth = position
    return ((bar - 1) * timeline["eighthsPerBar"] + eighth) * 60 / timeline["dottedQuarterBpm"] / 3


def spectrum(samples, rate):
    mono = samples.mean(axis=1)
    return np.fft.rfftfreq(len(mono), 1 / rate), abs(np.fft.rfft(mono * np.hanning(len(mono)))) ** 2


def test_wav_matches_film_duration_without_clipping(soundtrack):
    timeline, rate, samples = soundtrack
    frames = math.ceil(seconds(timeline, [timeline["bars"] + 1, 0]) * timeline["fps"])
    assert rate == 48_000
    assert len(samples) == round(frames / timeline["fps"] * rate)
    assert np.max(np.abs(samples)) < 0.90


def test_every_picture_cue_is_audible_in_the_mix(soundtrack):
    timeline, rate, samples = soundtrack
    for cue in timeline["cues"]:
        start = round(seconds(timeline, cue["at"]) * rate)
        window = samples[start:start + round(0.18 * rate)]
        rms = np.sqrt(np.mean(window ** 2))
        assert rms > 10 ** (-40 / 20), f"{cue['id']} has only {20 * np.log10(max(rms, 1e-12)):.1f} dBFS"


def test_space_arrivals_sound_their_d_major_degrees(soundtrack):
    timeline, rate, samples = soundtrack
    space_frequencies = (587.3295, 659.2551, 739.9888, 783.9909, 880.0)
    for cue in timeline["cues"]:
        if cue["type"] != "arrival":
            continue
        start = seconds(timeline, cue["at"])
        window = samples[round((start + 0.04) * rate):round((start + 0.34) * rate)]
        hz, power = spectrum(window, rate)
        band = (hz > 550) & (hz < 930)
        peak = hz[band][np.argmax(power[band])]
        assert peak == pytest.approx(space_frequencies[cue["space"] - 1], abs=4), cue["id"]


def test_final_chord_has_a_d_root_major_third_fifth_and_ninth(soundtrack):
    timeline, rate, samples = soundtrack
    cue = next(cue for cue in timeline["cues"] if cue["id"] == "b6.resolve")
    start = seconds(timeline, cue["at"])
    hz, power = spectrum(samples[round((start + 0.3) * rate):round((start + 1.45) * rate)], rate)
    bass_band = (hz > 55) & (hz < 220)
    assert hz[bass_band][np.argmax(power[bass_band])] == pytest.approx(73.4162, abs=2)

    def energy(frequency):
        return power[np.abs(hz - frequency) < 5].sum()

    d = energy(293.6648)
    assert d > 1
    for note in (369.9944, 440, 659.2551):
        assert energy(note) > 0.025 * d
    # F natural, A flat and E flat would change the chord quality.
    for note in (349.2282, 415.3047, 622.2540):
        assert energy(note) < 0.01 * d


def test_montage_rises_above_the_opening(soundtrack):
    timeline, rate, samples = soundtrack

    def beat_rms(beat_id):
        beat = next(beat for beat in timeline["beats"] if beat["id"] == beat_id)
        start = round(seconds(timeline, [beat["startBar"], 0]) * rate)
        end = round(seconds(timeline, [beat["startBar"] + beat["bars"], 0]) * rate)
        return np.sqrt(np.mean(samples[start:end] ** 2))

    assert beat_rms("B4") > beat_rms("B1") * 1.5


def test_last_second_is_below_minus_40_dbfs(soundtrack):
    _, rate, samples = soundtrack
    rms = np.sqrt(np.mean(samples[-rate:] ** 2))
    assert rms < 10 ** (-40 / 20)
    assert np.max(np.abs(samples[-rate:])) < 10 ** (-40 / 20)
