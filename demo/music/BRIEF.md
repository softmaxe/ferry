# Music brief: ferry barcarolle

The demo's score is composed in `score.py` and rendered by `render.py`. Use this brief to replace
it with a recorded or generated track without touching the picture: keep the tempo map and hit
the cues below.

## Character

- A barcarolle, the boat song of Venetian gondoliers: 6/8 with a rocking left hand.
- Classical and elegant, with a modern, minimal texture (think Max Richter, Ólafur Arnalds).
- Instruments: grand piano, harp, pizzicato strings, soft string pad, glockenspiel.
- No drums and no vocals.

## Tempo map

- Meter 6/8, dotted quarter = 66 (eighth note = 0.303 s, bar = 1.818 s).
- Key D major. The last chord is D major with an added ninth.
- 28 bars (50.91 s) plus 1.6 s of ring-out. The file is 52.51 s long.
- Loudness: −16 LUFS integrated, −1 dBTP.

| Phrase | Bars | Seconds | Picture | Music |
| --- | --- | --- | --- | --- |
| P1 | 1–4 | 0.00–7.27 | Café, dragging in Mission Control fails | Solo piano, sparse; chromatic slip; sigh |
| P2 | 5–8 | 7.27–14.55 | Title and tagline | Theme enters with harp and pizzicato bass |
| P3 | 9–12 | 14.55–21.82 | Raycast, harbor crossing | Plucks on each typed letter; harp glissando for the crossing |
| P4 | 13–16 | 21.82–29.09 | Recording hotkeys | Pizzicato ostinato; a glockenspiel note per hotkey |
| P5 | 17–20 | 29.09–36.36 | Hotkey montage | Fullest texture; a glissando per move |
| P6 | 21–24 | 36.36–43.64 | `--no-follow` and the reveal | Tension (Em7 to A7), a glockenspiel note per badge |
| P7 | 25–28 | 43.64–50.91 | Sunset, end card | Theme returns and resolves to D |

## Cues to hit

A Space's note is its degree of the D major scale (Space 1 = D, 2 = E, 3 = F♯, 4 = G, 5 = A).

| Time (s) | Bar.eighth | Event | Current score |
| --- | --- | --- | --- |
| 4.55 | 3.4 | Window slips out of the cursor | Piano D–C♯–C, staccato |
| 5.15 | 3.6 | "?!" | Low pizzicato bass |
| 7.27 | 5.1 | Wave wipe; the ferry sails in | Harp glissando up; theme starts |
| 10.91 / 11.82 / 12.73 | 7.1 / 7.4 / 8.1 | Tagline, three parts | Glockenspiel D, F♯, A |
| 15.45–16.67 | 9.4–10.2 | Typing "ferry" | Five violin plucks |
| 17.58 | 10.5 | Return runs the command | Glockenspiel A |
| 19.09–20.30 | 11.4–12.2 | Boat crosses from Space 1 to Space 2 | Harp glissando |
| 20.30 | 12.2 | Docks at Space 2 | Glockenspiel E (Space 2) |
| 21.82 | 13.1 | Wave wipe | Harp glissando down |
| 23.64–27.27 | 14.1–16.1 | Hotkeys for Spaces 1–5 | Glockenspiel D E F♯ G A |
| 29.09 / 30.91 / 32.73 | 17.1 / 18.1 / 19.1 | Moves to Spaces 3, 1, 5 | Harp glissando in the direction of travel |
| +1.21 s after each | 17.5 / 18.5 / 19.5 | Arrival | Glockenspiel F♯, D, A |
| 36.36 | 21.1 | Wave wipe | Harp glissando down |
| 38.18 | 22.1 | Return; the terminal leaves without follow | Piano chord and harp glissando |
| 39.39 | 22.5 | Space 4 inset | Glockenspiel G (Space 4) |
| 40.91 / 41.82 / 42.73 | 23.4 / 24.1 / 24.4 | Badges | Glockenspiel G, A, B |
| 43.64 | 25.1 | Resolution to D at sunset | Theme returns |
| 47.27 | 27.1 | End card | Harp roll |
| 49.09 | 28.1 | Final chord | D major add 9, held |

`src/timeline.json` has the full cue list; the picture and `score.py` both read it.
