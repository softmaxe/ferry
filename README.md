<h1 align="center">ferry</h1>

<p align="center">
  <a href="README.md"><kbd>English</kbd></a>
  <a href="README.zh-CN.md"><kbd>简体中文</kbd></a>
</p>

Move the focused macOS window to another Space and switch to it. This is
`yabai -m window --space N --focus` as a standalone 40 KB binary.

```sh
ferry 3
```

- Runs once per call and exits. No daemon, no launchd service, no config file.
- Needs no scripting addition, so System Integrity Protection stays enabled.
- Takes 30 to 45 ms per call on an Apple silicon Mac.
- Ships Raycast Script Commands for Spaces 1 to 5.

I wrote it because yabai was the only way I knew to do this, and I used one
yabai command out of hundreds while running its whole service. ferry keeps the
code behind that one command and drops the rest.

## Requirements

- macOS 26 (Tahoe) on Apple silicon
- The destination Space must already exist
- Accessibility permission for the app that launches `ferry`, such as Raycast
  or your terminal. ferry uses it to find the focused window.

Turn off **Automatically rearrange Spaces based on most recent use** in
System Settings > Desktop & Dock > Mission Control. Otherwise macOS reorders
Spaces and the numbers stop matching.

## Install

The Homebrew package and GitHub release archive support Apple silicon (`arm64`)
only. The release binaries are unsigned and not notarized, so macOS may require
approval in System Settings > Privacy & Security.

```sh
brew install softmaxe/tap/ferry
ferry --version
```

Upgrade or uninstall it with:

```sh
brew upgrade ferry
brew uninstall ferry
```

## Use

```sh
ferry 3                 # move the focused window to Space 3 and follow it
ferry --no-follow 3     # move it and stay on the current Space
ferry --verbose 3       # also print the window id and timing
ferry --window 1234 3   # move window 1234 instead of the focused window
```

Space numbers start at 1 and count every Space on every display, in Mission
Control order. They match the `index` field of `yabai -m query --spaces`.

Running `ferry` in a terminal moves the terminal window, since that is the
focused window. Bind it to a hotkey to move other windows.

ferry prints nothing on success. Errors go to stderr. The exit status is `0` on
success, `1` when the move fails, and `2` for invalid arguments.

## Raycast

[`raycast/`](raycast) has five Raycast Script Commands, **Ferry Window to Space
1** through **5**. Add this repository's `raycast` directory in Raycast Settings >
Extensions > + > Add Script Directory, then record a hotkey for each command.
Copy a script and change `space=` to target more Spaces.

The scripts find `ferry` on `PATH`, in the standard Homebrew directories, in
`$HOME/.local/bin`, or in this project's `build/`. To use a binary elsewhere,
set its path:

```sh
export FERRY_BINARY="/path/to/ferry"
```

## Build from source

Building requires the Xcode Command Line Tools.

```sh
make
make test
make install PREFIX="$HOME/.local"
```

`make test` checks the command-line interface only. It does not move windows.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `space N does not exist` | Create more Spaces in Mission Control, or pick a lower number. |
| `space N is a native fullscreen space` | macOS does not allow moving windows into a fullscreen Space. |
| `no focused window` | Click the window you want to move, then retry. |
| `window ... did not move` | Some windows refuse to move, such as system panels and fullscreen windows. |
| `unsupported macOS version` | ferry supports macOS 26 only. |
| The first run of a new binary or script takes about half a second | macOS scans each new executable once. Later runs are fast. |
| macOS blocks the binary | Open System Settings > Privacy & Security and choose Open Anyway for `ferry`. |

## How it works

ferry repeats what yabai does for `window --space N --focus` on macOS 26:

1. Reads the frontmost app's focused window through the Accessibility API. If
   that fails, it uses the app's frontmost on-screen window instead.
2. Maps the Space number to a Space id with `SLSCopyManagedDisplaySpaces`.
3. Moves the window with SkyLight's private
   `SLSBridgedMoveWindowsToManagedSpaceOperation`, then waits until the window
   server reports the window on the new Space.
4. Focuses the window with `_SLPSSetFrontProcessWithOptions`, a synthesized
   key-window event, and `AXRaise`. macOS switches to the Space as a result.

The binary links AppKit even though it calls no AppKit API. Without AppKit
loaded, the window server ignores the move operation and reports no error.

These are private macOS interfaces. A macOS update can break ferry the same
way it can break yabai. When that happens, yabai's
`space_manager_move_window_to_space` is the place to look for the fix.

Each release publishes a SHA-256 checksum and GitHub build provenance for its
archive. See the [releases](https://github.com/softmaxe/ferry/releases) and the
[release workflow](.github/workflows/release.yml).

## License

[MIT](LICENSE). The window management code comes from
[yabai](https://github.com/asmvik/yabai) by Åsmund Vikane, also MIT.
