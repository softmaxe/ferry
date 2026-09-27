# Music brief: ferry barcarolle

The soundtrack is synthesised by `ferry_audio/` with numpy. It is a warm D-major barcarolle for
the hand-drawn ferry film, with no vocals or drums. The picture and audio use
[`../src/handdrawn/timeline.json`](../src/handdrawn/timeline.json) as their timing source.

## Grid and ending

- Meter: 6/8, dotted quarter = 66. One eighth is 60 / 66 / 3 seconds; one bar is 120 / 66 seconds.
- Length: 40 bars. Video rounds up to 4364 frames at 60 fps, or 72.733 seconds; the WAV matches that duration.
- Key: D major. The closing chord at `b6.resolve`, bar 39, is D major add9, voiced with D2 in the bass and D, F#, A and E above it.
- The master fades over two seconds and reaches exact silence 1.1 seconds before the film ends. This leaves margin for AAC encoding.

Bar numbers begin at 1; an `at` position's eighth offset begins at 0. Musical attacks and picture
cues use the same grid. Keep the final fade and resolution if retiming the film.

## Voices and arrangement

The low root and fifth alternate on the two dotted-quarter pulses. Karplus-Strong strings use a
damped feedback delay with adjacent-sample averaging and fractional-delay tuning. Wooden plucks
carry the melody; longer string decays provide harp-like eighth-note arpeggios. The music-box
voice combines a struck fundamental with short inharmonic partials. Filtered seeded noise adds a
quiet paper-rustle bed. Short stereo reflections and soft saturation finish the mix.

| Beat | Bars | Picture | Arrangement |
| --- | --- | --- | --- |
| B1 | 1-6 | Mission Control drag fails | Quiet bass, sparse arpeggios and a hesitant opening phrase; the melody leaves room for the failed drag and red pen. |
| B2 | 7-10 | Boat, name and tagline | The plucked theme enters over fuller arpeggios, with light music-box accents. |
| B3 | 11-18 | Raycast and the first crossing | The melody waits through typing, then returns as the boat sails. A harp figure marks departure. |
| B4 | 19-26 | Hotkeys and three Follow moves | The fullest dynamics, a higher melody, and one ascending music-box note for each Space's sticky note. |
| B5 | 27-34 | Send and stay, verbose output and guarantees | A quieter B minor opening leads through G, E minor and suspended A harmony toward the close. |
| B6 | 35-40 | Sunset and install card | The title theme returns. Arpeggios settle into the final D major add9 chord and fade to silence. |

Dynamics follow the Beat ranges in the timeline. The mixer caps peaks at 0.89 after soft
saturation. There is no fixed LUFS target. Avoid raising the paper bed or effects enough to hide
the melody or the two-pulse bass.

## Cues and Space notes

A Space arrival sounds its degree of D major: 1 = D5, 2 = E5, 3 = F#5, 4 = G5, 5 = A5.
The five sticky notes use the same degrees an octave higher. The exact cue list lives in the
timeline; this guide names the main synchronization points without duplicating their timing.

| Cue group | Sound |
| --- | --- |
| `b1.missionControl`, `b1.grab`, `b3.type`, hotkey moves and terminal typing | Short key clicks. |
| `b3.enter`, `b5.enter` | Return-key attack. |
| `b3.sail`, `b5.sail`, `b6.sail` | Soft boat horn on D. The first two departures also trigger a harp figure. |
| `b3.dock`, `b5.dock`, `b6.closeLid` | A low, short thud. |
| `b1.mark`, `b2.boat`, `b6.link` | Dry pen friction. |
| `b2.tagline1` through `b2.tagline3`, `b3.tick`, `b5.badge1` through `b5.badge3` | Tick chime. |
| `b3.arrival`, `b4.arrival1` through `b4.arrival3`, `b5.arrival` | Destination notes E5, F#5, D5, A5 and G5. |
| `b6.resolve` | D5 arrival tone with the final D major add9 voicing. |

Every cue type has its own module under `ferry_audio/sfx/`: `key_click`, `return`, `horn`,
`dock`, `pen`, `tick`, `pop` and `arrival`. Seeds keep noise and string excitation reproducible.
No samples, external media, MIDI renderer or effects plugin is required.

## Build and checks

From `demo`:

```sh
npm run music
npm run test:audio
npm run build
```

The audio command writes `public/handdrawn.wav` as stereo 48 kHz, 16-bit PCM. pytest inspects
rendered WAV data for duration, energy at every cue, isolated cue coverage, arrival frequencies,
the final chord and trailing silence. `npm run build` embeds the WAV in both movies and runs the
film check, including last-second mean and peak levels below -40 dBFS. Rebuild audio after any
timeline change; review the movies to judge the musical phrasing with the picture.
