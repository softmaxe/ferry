# ferry

ferry moves one macOS window to another Space and, by default, switches the screen to it. This
glossary fixes the words used in docs, scripts, and the demo video in both English and Chinese.

## Language

**Space**:
One macOS desktop in Mission Control, numbered from 1 across all displays in Mission Control order.
Chinese copy also writes "Space".
_Avoid_: desktop, workspace, 桌面, 空间

**Focused window**:
The window that has keyboard focus when ferry runs; the one ferry moves unless told otherwise.
Chinese: 焦点窗口.
_Avoid_: active window, current window, 当前窗口

**Destination Space**:
The Space number passed to ferry; it must already exist and must not be a native fullscreen Space.
Chinese: 目标 Space.
_Avoid_: target desktop

**Follow**:
Switching the screen to the Destination Space after the move; the default, turned off by `--no-follow`.
Chinese: 跟随.
_Avoid_: jump, focus switch

**Ferry command**:
One Raycast Script Command named "Ferry Window to Space N" that runs ferry with Follow for Space N.
Its name stays in English in Chinese copy, matching what Raycast shows.
_Avoid_: shortcut, extension, 快捷指令

## Demo video

**Trip**:
One window carried by the ferry boat from its Space to the Destination Space, from the keystroke
or Enter that sends it until its Landing.
Chinese: 行程.
_Avoid_: hop, move, voyage

**Arrival**:
The musical moment a Trip reaches the Destination Space, where the score rings that Space's note.
Chinese: 到达.
_Avoid_: landing, dock

**Landing**:
The moment the window comes to rest on the Destination Space, whether or not the screen shows that
Space; it may fall after the Arrival.
Chinese: 落地.
_Avoid_: arrival, unload
