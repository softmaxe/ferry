import pytest

from score import INSTRUMENTS, TIMELINE, arrival_eighths, compose, cue_eighths, space_pitch, total_eighths


@pytest.fixture(scope="module")
def notes():
    return compose()


def test_cue_positions_come_from_the_shared_timeline():
    bar, eighth = TIMELINE["cues"]["p3.enter"]
    assert cue_eighths("p3.enter") == (bar - 1) * 6 + eighth


def test_every_note_fits_inside_the_film(notes):
    end = total_eighths()
    for n in notes:
        assert 0 <= n.start < end, n
        assert n.start + n.length <= end + 1e-9, n


def test_every_note_is_playable_by_its_instrument(notes):
    for n in notes:
        low, high = INSTRUMENTS[n.instrument].range
        assert low <= n.pitch <= high, n
        assert 1 <= n.velocity <= 127, n


@pytest.mark.parametrize(
    "cue, instrument",
    [
        ("p1.slip", "piano"),
        ("p2.boatEnter", "harp"),
        ("p3.dock", "glock"),
        ("p4.record1", "glock"),
        ("p4.record5", "glock"),
        ("p5.move1", "harp"),
        ("p6.badge3", "glock"),
        ("p7.final", "piano"),
    ],
)
def test_picture_cues_are_hit(notes, cue, instrument):
    at = cue_eighths(cue)
    hits = [n for n in notes if n.instrument == instrument and abs(n.start - at) < 0.26]
    assert hits, f"no {instrument} note on {cue}"


def test_hotkey_pings_climb_the_scale_by_space_number(notes):
    pitches = []
    for i in range(1, 6):
        at = cue_eighths(f"p4.record{i}")
        pitches.append(next(n.pitch for n in notes if n.instrument == "glock" and abs(n.start - at) < 0.01))
    assert pitches == [space_pitch(s) for s in range(1, 6)]
    assert pitches == sorted(pitches)


def test_the_last_bar_lands_on_d_major(notes):
    last = cue_eighths("p7.final")
    final = {n.pitch % 12 for n in notes if abs(n.start - last) < 0.01}
    assert final <= {2, 6, 9, 4}  # D, F#, A (+ E as the added ninth)
    assert 2 in final


def test_each_ferry_arrival_rings_its_destination_space(notes):
    for cue, (_, to) in TIMELINE["moves"].items():
        arrival = arrival_eighths(cue)
        rings = [n.pitch for n in notes if n.instrument == "glock" and abs(n.start - arrival) < 0.01]
        assert space_pitch(to) in rings, cue


def test_hotkey_glissandos_run_the_way_the_spaces_slide(notes):
    for cue in ["p5.move1", "p5.move2", "p5.move3"]:
        start = cue_eighths(cue)
        harp = sorted((n for n in notes if n.instrument == "harp" and start <= n.start < start + 3), key=lambda n: n.start)
        source, destination = TIMELINE["moves"][cue]
        rising = harp[-1].pitch > harp[0].pitch
        assert rising == (destination > source), cue


def test_every_instrument_has_a_mix_channel():
    from render import MIX

    assert MIX.keys() == INSTRUMENTS.keys()
