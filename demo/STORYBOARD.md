# Hand-drawn demo storyboard

The English and Chinese films implement [specification #12](https://github.com/softmaxe/ferry/issues/12).
Both pictures and synthesised audio use one timeline in 6/8 at dotted quarter = 66.
The film follows six Beats over about 40 bars, from 08:30 to 19:30.

| Beat | Picture |
| --- | --- |
| Opening | Ferri tries to drag the API docs window in Mission Control. It slips back; red pen circles the failure. |
| Title | The logo boat draws itself over the sea. The name and three-part tagline enter on the beat. |
| One keystroke | Raycast runs `Ferry Window to Space 2`. Ferri carries the window from Pier 1 to Pier 2. |
| A hotkey per Space | Five sticky notes map to Piers. Three moves to Spaces 3, 1, and 5 demonstrate Follow. |
| Send and stay | `--no-follow` sends a terminal to Space 4 while the call stays in view. Verbose output and three guarantees follow. |
| Close | At sunset, the laptop closes and the boat leaves. The install command and repository link fade to blank paper. |

## Implementation dependencies

The foundation is [#13](https://github.com/softmaxe/ferry/issues/13). It enables the mascot (#14),
title (#16), and full score (#21). The opening (#15) also needs the mascot. The opening and title
enable the crossing (#17) and close (#20). The crossing enables the hotkey montage (#18) and
send-and-stay scene (#19). Cleanup and documentation (#22) follow all completed scenes and audio.

## Delivery checks

Check timeline coverage, caption duration and width, bilingual glyph coverage, cue order and audio
coverage, and the existing window uniqueness and menu-state regressions. Render both films and
review stills. Check the WAV and MP4 duration, streams, resolution, frame rate, and final fade.
The demo remains outside CI. The ferry binary, Raycast scripts, release, and README video uploads
are outside this change.
