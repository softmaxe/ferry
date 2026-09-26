"""The ferry barcarolle: 6/8, D major, dotted quarter = 66.

Time is counted in eighth notes from the first downbeat. Picture cues come from
src/timeline.json, the same file the animation reads, so every hit lands on its frame.
Each Space has a pitch (D major scale degree = Space number) that rings whenever a
window arrives there.
"""

from __future__ import annotations

import json
import random
from dataclasses import dataclass
from pathlib import Path

TIMELINE = json.loads((Path(__file__).parent.parent / "src" / "timeline.json").read_text())
EIGHTH_SECONDS = 60 / TIMELINE["dottedQuarterBpm"] / 3


@dataclass(frozen=True)
class Instrument:
    soundfont: str
    range: tuple[int, int]  # sounding MIDI pitches the samples cover (measured)
    transpose: int = 0  # key = sounding pitch + transpose


INSTRUMENTS = {
    "piano": Instrument("SalamanderGrandPiano-V3+20200602.sf2", (21, 108)),
    "harp": Instrument("Concert Harp.sf2", (36, 96)),
    # The glockenspiel samples sound two octaves above their keys, like the real instrument.
    "glock": Instrument("Percussion - Glockenspiel.sf2", (84, 108), transpose=-24),
    "vln_pizz": Instrument("Strings - 1st Violins Pizzicato.sf2", (55, 96)),
    "vcl_pizz": Instrument("Strings - Celli Pizzicato.sf2", (36, 72)),
    "cb_pizz": Instrument("Strings - Basses Pizzicato.sf2", (24, 61)),
    "vln": Instrument("Strings - 1st Violins Sustain.sf2", (55, 97)),
    "vla": Instrument("Strings - Violas Sustain.sf2", (48, 85)),
    "vcl": Instrument("Strings - Celli Sustain.sf2", (36, 80)),
}


@dataclass(frozen=True)
class Note:
    instrument: str
    start: float  # eighths from the first downbeat
    length: float  # eighths
    pitch: int
    velocity: int


NAMES = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def p(name: str) -> int:
    """MIDI number for a note name such as "F#5" (C4 = 60)."""
    return NAMES[name[:-1]] + 12 * (int(name[-1]) + 1)


def at(bar: int, eighth: float = 0) -> float:
    return (bar - 1) * TIMELINE["eighthsPerBar"] + eighth


def cue_eighths(name: str) -> float:
    bar, eighth = TIMELINE["cues"][name]
    return at(bar, eighth)


def total_eighths() -> float:
    return TIMELINE["bars"] * TIMELINE["eighthsPerBar"] + TIMELINE["tailSeconds"] / EIGHTH_SECONDS


def space_pitch(space: int) -> int:
    """The glockenspiel pitch for a Space: its degree of the D major scale, from D6."""
    return [p("D6"), p("E6"), p("F#6"), p("G6"), p("A6")][space - 1]


# Chord symbol -> (bass pitch class, chord pitch classes)
CHORDS = {
    "D": ("D", ["D", "F#", "A"]),
    "Dadd9": ("D", ["D", "F#", "A", "E"]),
    "D/F#": ("F#", ["D", "F#", "A"]),
    "Bm": ("B", ["B", "D", "F#"]),
    "G": ("G", ["G", "B", "D"]),
    "G/B": ("B", ["G", "B", "D"]),
    "A": ("A", ["A", "C#", "E"]),
    "A/C#": ("C#", ["A", "C#", "E"]),
    "A7": ("A", ["A", "C#", "E", "G"]),
    "A7sus4": ("A", ["A", "D", "E", "G"]),
    "F#m": ("F#", ["F#", "A", "C#"]),
    "Em7": ("E", ["E", "G", "B", "D"]),
}

# One chord per bar, or two when the bar splits at the dotted quarter.
HARMONY: dict[int, list[str]] = {
    1: ["D"], 2: ["Bm"], 3: ["G"], 4: ["A7sus4"],
    5: ["D"], 6: ["Bm"], 7: ["G"], 8: ["A7"],
    9: ["D"], 10: ["F#m"], 11: ["G"], 12: ["A7"],
    13: ["Bm"], 14: ["G"], 15: ["D/F#"], 16: ["A"],
    17: ["D"], 18: ["A/C#"], 19: ["Bm"], 20: ["G", "A"],
    21: ["Bm"], 22: ["G"], 23: ["Em7"], 24: ["A7sus4", "A7"],
    25: ["D"], 26: ["G/B"], 27: ["G", "A7"], 28: ["Dadd9"],
}


def chord_segments():
    """(start, length, symbol) for every chord in the piece."""
    for bar, symbols in HARMONY.items():
        span = 6 / len(symbols)
        for i, symbol in enumerate(symbols):
            yield at(bar, i * span), span, symbol


def pitch_in(pc: str, low: int, high: int) -> int:
    for m in range(low, high + 1):
        if m % 12 == NAMES[pc]:
            return m
    raise ValueError(f"{pc} not in {low}..{high}")


def tones_above(symbol: str, floor: int, count: int) -> list[int]:
    pcs = {NAMES[x] for x in CHORDS[symbol][1]}
    out = []
    m = floor
    while len(out) < count:
        if m % 12 in pcs:
            out.append(m)
        m += 1
    return out


def dynamics(bar: int) -> int:
    """Base velocity for each phrase: quiet start, warm title, a lift for the hotkey montage."""
    if bar <= 4:
        return 46
    if bar <= 12:
        return 58
    if bar <= 16:
        return 58
    if bar <= 20:
        return 68
    if bar <= 22:
        return 58
    if bar <= 24:
        return 64 + (bar - 23) * 4
    if bar <= 27:
        return 70
    return 62


class Score:
    def __init__(self) -> None:
        self.notes: list[Note] = []
        self.rng = random.Random(7)

    def add(self, instrument: str, start: float, length: float, pitch: int | str, velocity: int, humanize: bool = False) -> None:
        if isinstance(pitch, str):
            pitch = p(pitch)
        if humanize:
            start = max(0.0, start + self.rng.uniform(-0.025, 0.025))
            velocity += self.rng.randint(-3, 3)
        length = min(length, total_eighths() - start)
        self.notes.append(Note(instrument, start, length, pitch, max(1, min(127, velocity))))

    def melody(self, instrument: str, bar: int, line: list[tuple[str, float]], velocity: int, legato: float = 0.95) -> None:
        t = at(bar)
        for name, length in line:
            if name != "r":
                self.add(instrument, t, length * legato, name, velocity, humanize=True)
            t += length

    def gliss(self, start: float, end: float, low: str, high: str, symbol: str | None, velocity: int, down: bool = False) -> None:
        pcs = {NAMES[x] for x in (CHORDS[symbol][1] if symbol else ["D", "E", "F#", "G", "A", "B", "C#"])}
        pitches = [m for m in range(p(low), p(high) + 1) if m % 12 in pcs]
        if down:
            pitches.reverse()
        step = (end - start) / max(1, len(pitches) - 1)
        for i, m in enumerate(pitches):
            self.add("harp", start + i * step, 4, m, velocity - 6 + int(12 * i / len(pitches)))

    def roll(self, instrument: str, start: float, pitches: list[str], velocity: int, spread: float = 0.12, length: float = 5) -> None:
        for i, name in enumerate(pitches):
            self.add(instrument, start + i * spread, length, name, velocity)


def compose() -> list[Note]:
    s = Score()

    # --- Piano left hand: the rocking barcarolle figure -------------------------------
    for start, span, symbol in chord_segments():
        bar = int(start // 6) + 1
        v = dynamics(bar)
        bass_pc = CHORDS[symbol][0]
        bass = pitch_in(bass_pc, 38, 49)
        if bar == 28:
            continue  # the final chord is voiced by hand below
        if bar <= 3:
            s.add("piano", start, 6, bass, v - 2, humanize=True)
            s.add("piano", start + 3, 3, tones_above(symbol, bass + 5, 1)[0], v - 14, humanize=True)
            continue
        if bar == 4:
            for m in [bass, p("D3"), p("G3"), p("E4")]:
                s.add("piano", start, 6, m, v - 8, humanize=True)
            continue
        tones = tones_above(symbol, max(bass + 5, 50), 3)
        figure = [tones[0], tones[1], tones[2], tones[1], tones[0]] if span == 6 else [tones[0], tones[1]]
        s.add("piano", start, span, bass, v - 2, humanize=True)
        for i, m in enumerate(figure):
            s.add("piano", start + 1 + i, span - 1 - i, m, v - 14 + (3 if i == 2 else 0), humanize=True)

    # --- Piano right hand ---------------------------------------------------------------
    # P1: a hesitant opening, a chromatic slip when the drag fails, then a sigh.
    s.melody("piano", 1, [("A4", 2), ("D5", 1), ("F#5", 3)], 50)
    s.melody("piano", 2, [("F#5", 2), ("E5", 1), ("D5", 3)], 48)
    s.melody("piano", 3, [("B4", 2), ("D5", 1)], 48)
    for i, name in enumerate(["D5", "C#5", "C5"]):
        s.add("piano", cue_eighths("p1.slip") + i, 0.55, name, 56 - i * 4)
    s.add("cb_pizz", cue_eighths("p1.drop"), 1, "E2", 70)
    s.add("piano", cue_eighths("p1.sigh"), 1.9, "E5", 50)
    s.add("piano", cue_eighths("p1.sigh") + 2, 2.8, "D5", 40)

    # P2: the theme.
    s.melody("piano", 5, [("F#5", 2), ("E5", 1), ("D5", 2), ("F#5", 1)], 70)
    s.melody("piano", 6, [("B5", 3), ("A5", 2), ("F#5", 1)], 68)
    s.melody("piano", 7, [("G5", 2), ("F#5", 1), ("E5", 2), ("D5", 1)], 68)
    s.melody("piano", 8, [("E5", 3), ("A4", 2), ("C#5", 1)], 64)

    # P3: plucks answer each typed letter; the melody waits for the crossing.
    for i, name in enumerate(["A5", "B5", "D6", "C#6", "E6"]):
        s.add("vln_pizz", cue_eighths("p3.type") + i, 1, name, 62)
    s.melody("piano", 11, [("B5", 3), ("D6", 3)], 58, legato=1)
    s.melody("piano", 12, [("C#6", 2), ("B5", 1), ("A5", 2), ("E5", 1)], 64)

    # P4
    s.melody("piano", 13, [("D5", 2), ("C#5", 1), ("B4", 3)], 64)
    s.melody("piano", 14, [("B4", 2), ("D5", 1), ("G5", 3)], 64)
    s.melody("piano", 15, [("F#5", 2), ("E5", 1), ("D5", 2), ("A4", 1)], 62)
    s.melody("piano", 16, [("C#5", 3), ("E5", 3)], 62)

    # P5: flowing eighths above the violins' long line.
    for bar in range(17, 21):
        for start, span, symbol in [seg for seg in chord_segments() if at(bar) <= seg[0] < at(bar + 1)]:
            tones = tones_above(symbol, p("A4"), 4)
            figure = [tones[0], tones[2], tones[3], tones[1], tones[2], tones[3]][: int(span)]
            for i, m in enumerate(figure):
                s.add("piano", start + i, 1.2, m, dynamics(bar) - 12 + (6 if i == 0 else 0), humanize=True)

    # P6: typing plucks, then the reveal on sustained piano chords.
    for i, name in enumerate(["B5", "A5", "F#5", "A5", "B5", "D6"]):
        s.add("vln_pizz", cue_eighths("p6.type") + i, 1, name, 52)
    s.roll("piano", cue_eighths("p6.enter"), ["G4", "B4", "D5"], 60, spread=0.05, length=3)
    s.melody("piano", 23, [("G5", 3), ("F#5", 2), ("E5", 1)], 64)
    s.melody("piano", 24, [("D5", 3), ("C#5", 3)], 66)

    # P7: the theme comes home.
    s.melody("piano", 25, [("F#5", 2), ("E5", 1), ("D5", 2), ("F#5", 1)], 76)
    s.melody("piano", 26, [("B5", 3), ("A5", 2), ("G5", 1)], 74)
    s.melody("piano", 27, [("G5", 2), ("F#5", 1), ("E5", 2), ("C#5", 1)], 72)
    final = cue_eighths("p7.final")
    for name in ["D2", "A2", "D3", "F#3", "E4", "A4", "D5"]:
        s.add("piano", final, 10.5, name, 62)

    # --- Harp ---------------------------------------------------------------------------
    s.gliss(cue_eighths("p2.boatEnter"), cue_eighths("p2.boatEnter") + 3, "D3", "D6", "D", 64)
    s.roll("harp", cue_eighths("p2.wordmark"), ["B3", "F#4", "B4", "D5", "F#5"], 58)
    s.roll("harp", cue_eighths("p3.cmdSpace"), ["D5", "F#5", "A5"], 56, spread=0.2)
    s.gliss(cue_eighths("p3.sail"), cue_eighths("p3.dock"), "G3", "D6", None, 64)
    s.gliss(at(12, 4.8), at(13, 0.4), "A5", "A3", "A7", 52, down=True)
    s.gliss(cue_eighths("p4.close"), cue_eighths("p4.close") + 1.5, "E6", "A4", "A", 50, down=True)
    # The glissando runs the way the Spaces slide: up for a higher Space, down for a lower one.
    for move, symbol, down in [("p5.move1", "D", False), ("p5.move2", "A/C#", True), ("p5.move3", "Bm", False)]:
        s.gliss(cue_eighths(move), cue_eighths(move) + 3, "D4", "D6", symbol, 60, down=down)
    s.gliss(at(20, 4.8), at(21, 0.4), "B5", "B3", "A", 52, down=True)
    s.gliss(cue_eighths("p6.sail"), cue_eighths("p6.sail") + 2.5, "G4", "G6", "G", 56)
    s.roll("harp", cue_eighths("p7.endCard"), ["G3", "D4", "G4", "B4", "D5", "G5"], 60, spread=0.15)
    s.roll("harp", final, ["D3", "A3", "D4", "F#4", "A4", "E5", "F#5", "A5", "D6"], 60, spread=0.1, length=10)

    # --- Glockenspiel: arrivals, taps and badges ----------------------------------------
    for cue, pitch in [("p2.tagline1", "D6"), ("p2.tagline2", "F#6"), ("p2.tagline3", "A6")]:
        s.add("glock", cue_eighths(cue), 3, pitch, 60)
    s.add("glock", cue_eighths("p3.enter"), 3, "A6", 56)
    s.add("glock", cue_eighths("p3.dock"), 4, space_pitch(2), 66)
    for i in range(1, 6):
        s.add("glock", cue_eighths(f"p4.record{i}"), 3, space_pitch(i), 62)
    for move, space in [("p5.move1", 3), ("p5.move2", 1), ("p5.move3", 5)]:
        s.add("glock", cue_eighths(move) + 4, 3, space_pitch(space), 66)
    s.add("glock", cue_eighths("p6.inset"), 4, space_pitch(4), 58)
    for cue, pitch in [("p6.badge1", "G6"), ("p6.badge2", "A6"), ("p6.badge3", "B6")]:
        s.add("glock", cue_eighths(cue), 3, pitch, 64)
    s.add("glock", cue_eighths("p7.install"), 4, "A6", 56)
    s.add("glock", final, 10, "D7", 54)

    # --- Pizzicato strings --------------------------------------------------------------
    for bar in list(range(5, 21)) + list(range(25, 28)):
        for start, span, symbol in [seg for seg in chord_segments() if at(bar) <= seg[0] < at(bar + 1)]:
            root = pitch_in(CHORDS[symbol][0], 33, 44)
            s.add("cb_pizz", start, 1.5, root, dynamics(bar) + 2, humanize=True)
            if span == 6:
                s.add("cb_pizz", start + 3, 1.5, root, dynamics(bar) - 6, humanize=True)
    for bar in range(13, 17):
        symbol = HARMONY[bar][0]
        tones = tones_above(symbol, p("D5"), 3)
        for i, idx in enumerate([0, 1, 2, 1, 2, 1]):
            s.add("vln_pizz", at(bar, i), 0.9, tones[idx], 44 + (8 if i in (0, 3) else 0), humanize=True)
    for bar in range(17, 21):
        for start, span, symbol in [seg for seg in chord_segments() if at(bar) <= seg[0] < at(bar + 1)]:
            fifth = tones_above(symbol, p("A3"), 1)[0]
            s.add("vcl_pizz", start + 1.5, 1, fifth, 50, humanize=True)

    # --- Sustained strings --------------------------------------------------------------
    for start, span, symbol in chord_segments():
        bar = int(start // 6) + 1
        if bar < 5 or bar == 28:
            continue
        soft = 30 if bar <= 12 else 38 if bar <= 16 else 46
        if bar in (23, 24):
            soft = 52
        bass = pitch_in(CHORDS[symbol][0], 38, 49)
        s.add("vcl", start, span, bass, soft)
        mid = tones_above(symbol, p("F#3"), 2)
        for m in mid:
            s.add("vla", start, span, m, soft - 4)
    for bar, line in [
        (17, [("F#5", 6)]),
        (18, [("E5", 6)]),
        (19, [("D5", 3), ("F#5", 3)]),
        (20, [("G5", 3), ("E5", 3)]),
        (23, [("B4", 6)]),
        (24, [("A4", 3), ("C#5", 3)]),
        (25, [("A4", 6)]),
        (26, [("B4", 6)]),
        (27, [("B4", 3), ("C#5", 3)]),
    ]:
        s.melody("vln", bar, line, 56, legato=1)
    for m in ["D3", "A3"]:
        s.add("vcl", final, 10.5, m, 50)
    for m in ["F#4", "A4"]:
        s.add("vla", final, 10.5, m, 46)
    s.add("vln", final, 10.5, "D5", 48)

    return sorted(s.notes, key=lambda n: (n.start, n.instrument, n.pitch))


def pedal_changes() -> list[float]:
    """Where the piano's sustain pedal is re-taken: every chord change."""
    return [start for start, _, _ in chord_segments()]
