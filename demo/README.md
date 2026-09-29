# ferry demo video

The source of the README demo: a 52-second animated short, in English and Chinese, drawn
entirely in code with [Remotion](https://www.remotion.dev) (React + SVG) and scored with
an original barcarolle rendered from sampled instruments.

Nothing here is part of the ferry binary or its release.

## Layout

| Path | What it is |
| --- | --- |
| `src/timeline.json` | Tempo map and every picture cue. Both the animation and the score read it. |
| `src/scenes/P1.tsx` … `P7.tsx` | The seven four-bar phrases of the film. |
| `src/components/` | Characters, rooms, the macOS desktop, Raycast, the harbor, the ferry. |
| `src/copy.ts` | On-screen text in English and Chinese. Terms follow `../CONTEXT.md`. |
| `music/score.py` | The score, as notes in eighth-note time. |
| `music/render.py` | FluidSynth stems, pedalboard mix, loudness normalization → `public/music.wav`. |
| `music/BRIEF.md` | The music brief and cue sheet, for replacing the score with another track. |

## Requirements

- [mise](https://mise.jdx.dev) for the Node.js and pnpm versions pinned in `mise.toml`: run
  `mise install`, then `pnpm install` in this directory.
- For the music: [uv](https://docs.astral.sh/uv/), `brew install fluid-synth ffmpeg`, and these
  SoundFonts in `~/.cache/ferry-demo/sf2` (or set `FERRY_DEMO_SOUNDFONTS`):
  - `SalamanderGrandPiano-V3+20200602.sf2` from
    [FreePats](https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html) (CC BY 3.0)
  - `Concert Harp.sf2`, `Percussion - Glockenspiel.sf2`, and the six
    `Strings - …` files named in `music/score.py`, from the
    [Sonatina Symphonic Orchestra](https://github.com/peastman/sso) (CC Sampling Plus 1.0)

## Build

```sh
pnpm run music       # compose and mix public/music.wav
pnpm run render:en   # out/ferry-en.mp4, 1920×1080, 60 fps
pnpm run render:zh   # out/ferry-zh.mp4
pnpm run readme      # out/ferry-*-readme.mp4, re-encoded under GitHub's 10 MB attachment limit
pnpm run studio      # scrub the film in the browser
```

Check frames without rendering the film, and tile them into a contact sheet:

```sh
pnpm run stills ferry-en p3.sail+40 p6.reveal
scripts/sheet.sh out/sheet.png out/stills/ferry-en-p3.sail+40.png out/stills/ferry-en-p6.reveal.png
```

## Tests

```sh
pnpm run typecheck
pnpm test                            # timeline consistency, copy content, font subsets
uv run --project music pytest music  # score fits the film and hits its cues
```

CI ignores `demo/`. Run only the checks relevant to the change: typecheck for TypeScript,
`pnpm test` for timeline, copy, or font logic, and pytest for the score, mix, or shared timeline.
Review wording and musical choices in the preview.
