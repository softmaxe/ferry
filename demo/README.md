# ferry demo video

A hand-drawn paper explainer in English and Chinese, built with
[Remotion](https://www.remotion.dev/) and a numpy-synthesised barcarolle. Ferri carries the
Focused window between numbered Piers. The six Beats follow a day from 08:30 to 19:30.

The film is 4364 frames at 60 fps, or 72.733 seconds, at 1920 by 1080. Pictures, music and
sound effects are generated in code. This directory is separate from the ferry binary and release.

## Layout

| Path | Purpose |
| --- | --- |
| `src/handdrawn/timeline.json` | The only authored timeline: 40 bars in 6/8, Beat ranges, captions and cues. Both picture and audio read it. |
| `src/handdrawn/beats/B1.tsx` through `B6.tsx` | Opening, title, Raycast crossing, hotkeys, send-and-stay, and close. |
| `src/handdrawn/components/` | Ferri, the boat, Piers, reusable window crossing, hand-drawn UI and red-pen marks. |
| `src/handdrawn/Paper.tsx`, `DayWash.tsx` | One static paper texture and the morning-to-sunset wash. |
| `src/handdrawn/copy.ts` | Bilingual copy following [the glossary](../CONTEXT.md). Command names and program output stay in English. |
| `public/fonts/` | Bundled LXGW WenKai subset, charset manifest, provenance and OFL license. |
| `audio/ferry_audio/` | The D-major score, instrument synthesis, one module per cue type, and WAV mixdown. |
| `audio/BRIEF.md` | [Music brief and cue guide](audio/BRIEF.md). |
| `scripts/build-film.mjs` | Timeline export, audio, both films, review PNGs, contact sheet and validation. |
| `scripts/check-film.mjs` | Stream, timing, final fade and stale-output checks. |

See [STORYBOARD.md](STORYBOARD.md) for the six-Beat story.

## Requirements

- Node.js 22 or later and npm.
- [uv](https://docs.astral.sh/uv/) for the local Python environment. The audio package requires Python 3.11 or later.
- FFmpeg and ffprobe, available with `brew install ffmpeg`.

Run `npm ci` in this directory. uv installs the audio package's declared dependencies locally.
A first Remotion render may download its browser runtime. The score uses no samples or media
downloads. Font loading uses the bundled webfont; UI text uses macOS system fonts.

## Build and review

From `demo`:

```sh
npm ci
npm run build
```

The build exports the timeline, synthesises the WAV, renders `ferry-en` and `ferry-zh`, writes
review stills and a contact sheet, records source/output hashes, and runs the complete film check.

| Output | Contents |
| --- | --- |
| `public/handdrawn.wav` | Stereo 48 kHz, 16-bit PCM soundtrack. |
| `out/timeline.json` | Generated export of the authored timeline. |
| `out/ferry-en.mp4`, `out/ferry-zh.mp4` | H.264 video and AAC audio. |
| `out/review/ferry-en-B1.png` through `B6.png` | Six English review stills. |
| `out/review/ferry-zh-B1.png` through `B6.png` | Six Chinese review stills. |
| `out/review/paper.png` | Blank-paper reference for the final fade. |
| `out/review/contact-sheet.png` | Paired English and Chinese stills. |
| `out/build-manifest.json` | Source and output hashes used by the film check. |

For individual steps:

```sh
npm run music       # Generate the soundtrack
npm run render:en   # Regenerate audio and render the English film
npm run render:zh   # Regenerate audio and render the Chinese film
npm run studio      # Scrub ferry-en, ferry-zh or the ferri-preview pose sheet
npm run stills -- ferry-en B1 B6 b3.dock+30 1945
```

Still targets can be a Beat midpoint, a cue plus frame offset, or an absolute frame. They are
written to `out/stills/`. To tile selected images:

```sh
scripts/sheet.sh out/sheet.png out/stills/ferry-en-B1.png out/stills/ferry-en-B6.png
```

The complete build is required before `test:film`: individual renders do not refresh the manifest
or every review output. Compression for README uploads and replacement of the root README embeds
remain a separate follow-up; the retained `readme` cut script needs retiming for this film.

## Local checks

```sh
npm run typecheck
npm test
npm run test:audio
npm run test:film   # After npm run build
```

- Timeline tests check continuous Beat coverage, caption duration and overlap, cue order, and cue-to-synthesis coverage.
- Copy tests enforce nonempty bilingual text and the glossary. Font tests inspect the actual WenKai cmap and advance widths for glyph coverage and caption fit.
- B4 and B5 render tests preserve the window-uniqueness and menu-state regressions for Follow and `--no-follow`.
- pytest renders WAV files and checks duration, cue energy with and without music, Space-note frequencies, the final D major add9 chord and trailing silence.
- The film check rejects stale or changed outputs. It verifies duration, frame count, resolution, frame rate, one video stream and one audio stream, the final blank-paper image, and last-second mean and peak audio levels below -40 dBFS in both films.

These checks run locally. The demo remains outside CI. Review the PNGs and movies for drawing,
composition, motion and musical choices; tests do not score the appearance.

## Sources and licenses

The upstream-first review inspected [yabai at `dd84572341`](https://github.com/asmvik/yabai/tree/dd84572341).
Its tree has no comparable explainer renderer or audio pipeline, so this demo uses a local implementation.

Drawing and build techniques were adapted from the owner's `softmaxe/animate-test` at
[`965b4fe293eb891531c6258a13cf2c9ce76cacba`](https://github.com/softmaxe/animate-test/tree/965b4fe293eb891531c6258a13cf2c9ce76cacba):

- [RoughDrawing](https://github.com/softmaxe/animate-test/blob/965b4fe293eb891531c6258a13cf2c9ce76cacba/video/rough/RoughDrawing.tsx), [Paper](https://github.com/softmaxe/animate-test/blob/965b4fe293eb891531c6258a13cf2c9ce76cacba/video/components/Paper.tsx), and [animation helpers](https://github.com/softmaxe/animate-test/blob/965b4fe293eb891531c6258a13cf2c9ce76cacba/video/anim.ts).
- [Red-pen circle](https://github.com/softmaxe/animate-test/blob/965b4fe293eb891531c6258a13cf2c9ce76cacba/video/beats/beat1/RedPenCircle.tsx) and [tick geometry](https://github.com/softmaxe/animate-test/blob/965b4fe293eb891531c6258a13cf2c9ce76cacba/video/beats/beat3/FlawCallout.tsx).
- [Clawd's pose and pencil-fill methods](https://github.com/softmaxe/animate-test/blob/965b4fe293eb891531c6258a13cf2c9ce76cacba/video/characters/Clawd.tsx). Ferri has its own square navy body and coral chest window; the boat follows ferry's logo geometry.
- [Sample-free DSP](https://github.com/softmaxe/animate-test/blob/965b4fe293eb891531c6258a13cf2c9ce76cacba/audio/pelican_audio/dsp.py) and [film checks](https://github.com/softmaxe/animate-test/blob/965b4fe293eb891531c6258a13cf2c9ce76cacba/tests/film/film.test.ts) informed the local audio and validation tools.

The reference repository has no declared license at that revision; the source links record its
provenance. [Rough.js](https://github.com/rough-stuff/rough/blob/master/LICENSE) is MIT licensed.
[Remotion](https://www.remotion.dev/license) has its own license terms. The bundled
[LXGW WenKai subset](public/fonts/README.md) retains its [SIL OFL 1.1 license](public/fonts/OFL.txt).
The static paper texture uses fixed seeds; only pencil strokes receive deterministic frame-based jitter.
