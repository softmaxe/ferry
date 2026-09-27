"""A D-major barcarolle in 6/8, with a two-pulse bass and a wooden plucked theme."""

from __future__ import annotations

import numpy as np

from .dsp import add
from .instruments import bass, envelope, frequency, glock, paper, pluck
from .timeline import duration_seconds, position_seconds


def synthesize(timeline: dict, sample_rate: int) -> np.ndarray:
    duration = duration_seconds(timeline)
    out = 0.0018 * paper(duration, sample_rate)
    eighth = 60 / timeline["dottedQuarterBpm"] / 3
    resolve = next(cue for cue in timeline["cues"] if cue["id"] == "b6.resolve")
    final_at = position_seconds(timeline, resolve["at"])
    chords = {
        "D": (38, (62, 66, 69)), "Bm": (35, (62, 66, 71)),
        "G": (43, (62, 67, 71)), "A": (33, (61, 64, 69)),
        "D/F#": (42, (62, 66, 69)), "A/C#": (37, (61, 64, 69)),
        "Em7": (40, (62, 64, 67, 71)), "Asus": (33, (62, 64, 67, 69)),
        "A7": (33, (61, 64, 67, 69)), "G/B": (35, (62, 67, 71)),
    }
    progressions = {
        "B1": ("D", "Bm", "G", "Asus", "Em7", "A7"),
        "B2": ("D", "Bm", "G", "A7"),
        "B3": ("D", "A/C#", "Bm", "G", "D/F#", "G", "A7", "D"),
        "B4": ("D", "Bm", "G", "A", "D", "Asus", "G", "A7"),
        "B5": ("Bm", "G", "Em7", "Asus", "D/F#", "G", "Em7", "A7"),
        "B6": ("D", "G/B", "G", "A7"),
    }
    dynamics = {"B1": (0.48, 0.40), "B2": (0.73, 0.84), "B3": (0.65, 0.82),
                "B4": (0.85, 1.0), "B5": (0.66, 0.78), "B6": (0.84, 0.60)}
    motifs = {
        "B1": ((69, 2), (74, 1), (78, 3), (78, 2), (76, 1), (74, 3)),
        "B2": ((78, 2), (76, 1), (74, 2), (78, 1), (83, 3), (81, 2), (78, 1),
               (79, 2), (78, 1), (76, 2), (74, 1), (76, 3), (73, 3)),
        "B3": ((78, 3), (81, 3), (76, 2), (74, 1), (73, 3),
               (74, 2), (78, 1), (81, 3), (79, 3), (78, 2), (76, 1)),
        "B4": ((78, 2), (81, 1), (86, 3), (83, 2), (81, 1), (78, 3),
               (79, 2), (83, 1), (86, 3), (85, 2), (83, 1), (81, 3)),
        "B5": ((74, 3), (78, 3), (79, 2), (78, 1), (74, 3),
               (76, 3), (79, 3), (76, 3), (73, 3)),
        "B6": ((78, 2), (76, 1), (74, 2), (78, 1), (83, 3), (81, 2), (79, 1),
               (79, 2), (78, 1), (76, 2), (74, 1), (73, 3), (76, 3)),
    }

    def put(sound: np.ndarray, at: float, gain: float) -> None:
        add(out, sound, round(at * sample_rate), gain)

    for beat in timeline["beats"]:
        beat_id = beat["id"]
        start_bar = beat["startBar"]
        start = position_seconds(timeline, [start_bar, 0])
        end = position_seconds(timeline, [start_bar + beat["bars"], 0])
        low, high = dynamics[beat_id]
        for index in range(beat["bars"]):
            bar = start_bar + index
            at = position_seconds(timeline, [bar, 0])
            if at >= final_at:
                break
            gain = low + (high - low) * index / max(1, beat["bars"] - 1)
            root, tones = chords[progressions[beat_id][index % len(progressions[beat_id])]]
            # Each dotted-quarter pulse starts with the root or fifth of the chord.
            put(bass(root, eighth * 3, sample_rate), at, 0.23 * gain)
            put(bass(root + 7, eighth * 3, sample_rate), at + eighth * 3, 0.17 * gain)
            for step, tone_index in enumerate((0, 2, 1, 2, 1, 0)):
                if beat_id == "B1" and step not in (1, 4):
                    continue
                note = tones[tone_index] + (12 if step == 3 else 0)
                put(pluck(note, 1.7, sample_rate, bar * 17 + step, harp=True), at + eighth * step,
                    0.066 * gain * (1 if step in (0, 3) else 0.8))

        # Leave space around the failed drag and the Raycast typing. The theme returns at sunset.
        melody_start = start + (4 * 6 * eighth if beat_id == "B3" else 0)
        cursor = melody_start
        phrase = motifs[beat_id]
        if beat_id in ("B4", "B5"):
            phrase = phrase * 2
        for index, (note, length) in enumerate(phrase):
            if cursor >= min(end, final_at):
                break
            gain = low + (high - low) * (cursor - start) / max(end - start, eighth)
            put(pluck(note, min(length * eighth + 0.35, 1.8), sample_rate, start_bar * 131 + index),
                cursor, 0.16 * gain)
            if beat_id in ("B2", "B4", "B6") and index % 4 == 0:
                put(glock(note + 12, 1.5, sample_rate), cursor, 0.022 * gain)
            cursor += length * eighth

    for cue in timeline["cues"]:
        if cue["type"] == "horn" and cue["id"] != "b6.sail":
            start = position_seconds(timeline, cue["at"])
            for index, note in enumerate((62, 66, 69, 74, 78, 81)):
                put(pluck(note, 1.4, sample_rate, 900 + index, harp=True), start + index * eighth / 2, 0.05)
        elif cue["id"].startswith("b4.note"):
            note = (86, 88, 90, 91, 93)[cue["space"] - 1]
            put(glock(note, 1.2, sample_rate), position_seconds(timeline, cue["at"]), 0.07)

    # The closing D add9 voicing has a low D anchor and a quiet E above the major triad.
    remaining = duration - final_at
    t = np.arange(round(remaining * sample_rate)) / sample_rate
    for note, gain in ((38, 0.13), (50, 0.07), (62, 0.045), (66, 0.052), (69, 0.045), (76, 0.028)):
        phase = 2 * np.pi * frequency(note) * t
        sustained = (np.sin(phase) + 0.12 * np.sin(2 * phase)) * np.exp(-t / 3.5)
        put(envelope(sustained, sample_rate, 0.015, 0.1), final_at, gain)
    for index, note in enumerate((50, 57, 62, 66, 69, 76, 86)):
        put(pluck(note, remaining, sample_rate, 1200 + index, harp=True), final_at + index * 0.025, 0.055)
    put(glock(86, remaining, sample_rate), final_at, 0.035)
    return out
