"""Renders the score to public/music.wav.

Each instrument becomes its own MIDI file, FluidSynth renders it with its sampled
SoundFont, and pedalboard mixes the stems: pan, per-stem room, then a gentle master
chain. ffmpeg's two-pass loudnorm brings the result to -16 LUFS with -1 dBTP headroom.

Soundfonts are read from $FERRY_DEMO_SOUNDFONTS (default ~/.cache/ferry-demo/sf2).
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

import mido
import numpy as np
from pedalboard import Compressor, Gain, HighpassFilter, HighShelfFilter, Limiter, LowShelfFilter, Pedalboard, PeakFilter, Reverb
from pedalboard.io import AudioFile

from score import EIGHTH_SECONDS, INSTRUMENTS, compose, pedal_changes, total_eighths

RATE = 48000
TICKS_PER_QUARTER = 480
TICKS_PER_EIGHTH = TICKS_PER_QUARTER // 2
HERE = Path(__file__).parent
BUILD = HERE / "build"
OUTPUT = HERE.parent / "public" / "music.wav"
SOUNDFONTS = Path(os.environ.get("FERRY_DEMO_SOUNDFONTS", Path.home() / ".cache" / "ferry-demo" / "sf2"))


@dataclass(frozen=True)
class Channel:
    gain_db: float
    pan: float  # -1 left … 1 right
    room: float  # extra reverb wet level for this stem
    highpass: float = 60


MIX = {
    "piano": Channel(3.0, 0.0, 0.10, 40),
    "harp": Channel(-5.0, 0.30, 0.28),
    "glock": Channel(-5.0, -0.25, 0.32, 400),
    "vln_pizz": Channel(-3.0, -0.35, 0.18),
    "vcl_pizz": Channel(-3.0, 0.25, 0.14),
    "cb_pizz": Channel(-2.0, 0.05, 0.10, 30),
    "vln": Channel(-5.0, -0.30, 0.24),
    "vla": Channel(-7.0, 0.20, 0.24),
    "vcl": Channel(-6.0, 0.35, 0.20, 40),
}


def write_midi(instrument: str, notes, path: Path) -> None:
    mid = mido.MidiFile(ticks_per_beat=TICKS_PER_QUARTER)
    track = mido.MidiTrack()
    mid.tracks.append(track)
    quarter_seconds = EIGHTH_SECONDS * 2
    track.append(mido.MetaMessage("set_tempo", tempo=round(quarter_seconds * 1_000_000), time=0))
    track.append(mido.Message("program_change", program=0, channel=0, time=0))
    track.append(mido.Message("control_change", control=7, value=127, channel=0, time=0))

    events: list[tuple[int, int, mido.Message]] = []  # (tick, order, message); note-offs sort first
    transpose = INSTRUMENTS[instrument].transpose
    for n in notes:
        on = round(n.start * TICKS_PER_EIGHTH)
        off = max(on + 1, round((n.start + n.length) * TICKS_PER_EIGHTH))
        events.append((on, 1, mido.Message("note_on", note=n.pitch + transpose, velocity=n.velocity, channel=0)))
        events.append((off, 0, mido.Message("note_off", note=n.pitch + transpose, velocity=0, channel=0)))
    if instrument == "piano":
        for change in pedal_changes():
            tick = round(change * TICKS_PER_EIGHTH)
            if tick > 0:
                events.append((tick - 6, 0, mido.Message("control_change", control=64, value=0, channel=0)))
            events.append((tick + 10, 2, mido.Message("control_change", control=64, value=127, channel=0)))
    # A silent event at the very end so FluidSynth renders release tails.
    end = round(total_eighths() * TICKS_PER_EIGHTH)
    events.append((end, 3, mido.Message("control_change", control=64, value=0, channel=0)))

    events.sort(key=lambda e: (e[0], e[1]))
    last = 0
    for tick, _, message in events:
        track.append(message.copy(time=max(0, tick - last)))
        last = max(last, tick)
    mid.save(path)


def render_stem(instrument: str, midi: Path, wav: Path) -> None:
    soundfont = SOUNDFONTS / INSTRUMENTS[instrument].soundfont
    if not soundfont.exists():
        sys.exit(f"missing soundfont: {soundfont}")
    subprocess.run(
        [
            "fluidsynth", "-ni", "-q", "-F", str(wav), "-r", str(RATE), "-g", "0.5",
            "-o", "synth.reverb.active=0", "-o", "synth.chorus.active=0", "-o", "synth.polyphony=512",
            str(soundfont), str(midi),
        ],
        check=True,
    )


def load(path: Path, length: int) -> np.ndarray:
    with AudioFile(str(path)) as f:
        audio = f.read(f.frames)
    if audio.shape[0] == 1:
        audio = np.vstack([audio, audio])
    out = np.zeros((2, length), dtype=np.float32)
    n = min(length, audio.shape[1])
    out[:, :n] = audio[:, :n]
    return out


def pan(audio: np.ndarray, position: float) -> np.ndarray:
    angle = (position + 1) * np.pi / 4
    return np.vstack([audio[0] * np.cos(angle) * np.sqrt(2), audio[1] * np.sin(angle) * np.sqrt(2)])


def loudnorm(src: Path, dst: Path) -> None:
    target = "I=-16:TP=-1.0:LRA=11"
    probe = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(src), "-af", f"loudnorm={target}:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    )
    report = probe.stderr[probe.stderr.rindex("{"):]
    stats = json.loads(report[: report.index("}") + 1])
    measured = ":".join(
        f"measured_{k}={stats['input_' + k]}" for k in ("i", "tp", "lra", "thresh")
    ) + f":offset={stats['target_offset']}"
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(src),
         "-af", f"loudnorm={target}:{measured}:linear=true", "-ar", str(RATE), "-c:a", "pcm_s24le", str(dst)],
        check=True,
    )


def main() -> None:
    if not shutil.which("fluidsynth"):
        sys.exit("fluidsynth not found; install it with: brew install fluid-synth")
    BUILD.mkdir(exist_ok=True)
    notes = compose()
    length = round(total_eighths() * EIGHTH_SECONDS * RATE)

    mix = np.zeros((2, length), dtype=np.float32)
    for instrument, channel in MIX.items():
        part = [n for n in notes if n.instrument == instrument]
        midi = BUILD / f"{instrument}.mid"
        wav = BUILD / f"{instrument}.wav"
        write_midi(instrument, part, midi)
        render_stem(instrument, midi, wav)
        stem = load(wav, length)
        chain = Pedalboard([
            HighpassFilter(channel.highpass),
            Reverb(room_size=0.82, damping=0.45, wet_level=channel.room, dry_level=1.0, width=1.0),
            Gain(channel.gain_db),
        ])
        stem = chain(stem, RATE)
        mix += pan(stem, channel.pan)
        print(f"{instrument:9s} {len(part):4d} notes  peak {20 * np.log10(np.abs(stem).max() + 1e-9):6.1f} dBFS")

    master = Pedalboard([
        HighpassFilter(28),
        LowShelfFilter(cutoff_frequency_hz=120, gain_db=-2.0),
        PeakFilter(cutoff_frequency_hz=320, gain_db=-1.5, q=0.8),
        HighShelfFilter(cutoff_frequency_hz=9000, gain_db=1.5),
        Reverb(room_size=0.9, damping=0.5, wet_level=0.10, dry_level=1.0, width=1.0),
        Compressor(threshold_db=-20, ratio=2.0, attack_ms=20, release_ms=250),
        Limiter(threshold_db=-2.0, release_ms=120),
    ])
    mixed = master(mix, RATE)
    fade = int(1.0 * RATE)
    mixed[:, -fade:] *= np.linspace(1, 0, fade, dtype=np.float32) ** 2

    premaster = BUILD / "premaster.wav"
    with AudioFile(str(premaster), "w", RATE, 2, bit_depth=24) as f:
        f.write(mixed)
    OUTPUT.parent.mkdir(exist_ok=True)
    loudnorm(premaster, OUTPUT)
    print(f"wrote {OUTPUT} ({length / RATE:.2f} s)")


if __name__ == "__main__":
    main()
