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

## Install

ferry runs on macOS 26 (Tahoe) on Apple silicon only.

```sh
brew install softmaxe/tap/ferry
```

To install without Homebrew, use a [release archive](#install-from-a-release-archive)
or [build from source](#build-from-source).

## Set up

1. Open System Settings > Desktop & Dock > Mission Control and turn off
   **Automatically rearrange Spaces based on most recent use**. Otherwise macOS
   reorders Spaces and the numbers stop matching.
2. Open System Settings > Privacy & Security > Accessibility and turn it on for
   the app that runs ferry, such as Raycast or your terminal. ferry never asks
   for this itself. With it, ferry moves the window that has focus. Without it,
   ferry moves the app's frontmost window, which can be a different one when
   the app has several windows open.
3. Make sure you have at least two Spaces, then run this in a terminal:

   ```sh
   ferry 2
   ```

   The terminal window moves to Space 2 and the screen follows it. A terminal
   always moves itself, because it has focus when you press Return. To move
   other windows, bind ferry to a hotkey.

## Hotkeys with Raycast

The Homebrew package installs only the binary. The Raycast scripts live in this
repository's [`raycast/`](raycast) directory, so clone it to a folder you will
keep:

```sh
git clone https://github.com/softmaxe/ferry.git ~/ferry
```

1. In Raycast Settings > Extensions, choose **+** > **Add Script Directory**
   and pick `~/ferry/raycast`. If you already have a script directory, copy the
   five files into it instead.
2. Find **Ferry Window to Space 1** and record a hotkey for it. Repeat for 2
   to 5.

For Space 6 and up, copy a script and change both `space=` and the
`@raycast.title` line.

The scripts look for `ferry` on `PATH`, then in `/opt/homebrew/bin`,
`/usr/local/bin`, `$HOME/.local/bin`, and this project's `build/`. For a binary
anywhere else, set its path:

```sh
export FERRY_BINARY="/path/to/ferry"
```

## Usage

```sh
ferry 3                 # move the focused window to Space 3 and follow it
ferry --no-follow 3     # move it and stay on the current Space
ferry --verbose 3       # also print the window id and timing
ferry --window 1234 3   # move window 1234 instead of the focused window
```

Space numbers start at 1 and count every Space on every display, in Mission
Control order. They match the `index` field of `yabai -m query --spaces`.
ferry does not create Spaces, so the destination must already exist.

ferry prints nothing on success. Errors go to stderr. The exit status is `0` on
success, `1` when the move fails, and `2` for invalid arguments.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `space N does not exist` | Create more Spaces in Mission Control, or pick a lower number. |
| `space N is a native fullscreen space` | macOS does not allow moving windows into a fullscreen Space. |
| `no focused window` | Click the window you want to move, then retry. |
| `window ... did not move` | Some windows refuse to move, such as system panels and fullscreen windows. |
| `unsupported macOS version` | ferry supports macOS 26 only. |
| ferry moves the wrong window | Turn on Accessibility for the app that runs ferry. See [Set up](#set-up). |
| Space numbers don't match what you see | Turn off automatic Space rearranging. See [Set up](#set-up). |
| The first run of a new binary or script takes about half a second | macOS scans each new executable once. Later runs are fast. |
| macOS blocks the binary | This happens with archives downloaded in a browser. Open System Settings > Privacy & Security and choose Open Anyway for `ferry`. |

## Other ways to install

### Install from a release archive

Each [release](https://github.com/softmaxe/ferry/releases) has an `arm64`
archive, its SHA-256 checksum, and GitHub build provenance. With the
[GitHub CLI](https://cli.github.com):

```sh
gh release download --repo softmaxe/ferry --pattern '*.tar.gz*'
shasum -a 256 -c ferry-*.tar.gz.sha256
gh attestation verify ferry-*.tar.gz --repo softmaxe/ferry
tar -xzf ferry-*.tar.gz ferry
mkdir -p ~/.local/bin && install -m 0755 ferry ~/.local/bin/ferry
```

Make sure `~/.local/bin` is on your `PATH`. The binary is unsigned and not
notarized. If you download the archive in a browser instead, macOS may block
the first run. See [Troubleshooting](#troubleshooting).

### Build from source

Building requires the Xcode Command Line Tools.

```sh
make
make test
make install PREFIX="$HOME/.local"
```

`make test` checks the command-line interface only. It does not move windows.

### Upgrade and uninstall

With Homebrew:

```sh
brew upgrade ferry
brew uninstall ferry
```

For the other methods, repeat the install to upgrade, or delete
`~/.local/bin/ferry` to uninstall. ferry writes no other files.

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

## License

[MIT](LICENSE). The window management code comes from
[yabai](https://github.com/asmvik/yabai) by Åsmund Vikane, also MIT.
