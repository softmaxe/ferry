<p align="center">
  <img src="docs/assets/ferry-logo.png" alt="Ferry logo: a desktop window riding a boat" width="180">
</p>

<h1 align="center">ferry</h1>

<p align="center">
  <a href="README.md"><kbd>English</kbd></a>
  <a href="README.zh-CN.md"><kbd>简体中文</kbd></a>
</p>

Move the focused macOS window to another Space and follow it. ferry adapts the
code behind `yabai -m window --space N --focus` into a standalone command.
You do not need yabai installed.

```sh
ferry 3
```

https://github.com/user-attachments/assets/483781fc-7003-433a-9ea7-7cbea45ff641

- Runs once and exits, with no background service or configuration file.
- Requires no scripting addition or changes to System Integrity Protection.
- Includes Raycast Script Commands for Spaces 1 to 5.

I only used yabai to move a window and follow it to another Space. I wrote ferry
so I could keep that command without running the yabai service.

## Install

ferry supports macOS 26 Tahoe on Apple silicon only.

```sh
brew install softmaxe/tap/ferry
```

To install without Homebrew, use a [release archive](#install-from-a-release-archive)
or [build from source](#build-from-source).

## Set up

1. Open System Settings > Desktop & Dock > Mission Control and turn off
   **Automatically rearrange Spaces based on most recent use**. This keeps Space
   numbers stable while you switch between them.
2. Open System Settings > Privacy & Security > Accessibility and turn it on for
   the app that runs ferry, such as Raycast or your terminal. ferry does not
   prompt for permission. If it cannot read the focused window through
   Accessibility, it uses the frontmost app's topmost visible normal window.
   That may be a different window when the app has several open.
3. Make sure Space 2 exists and is not a native fullscreen Space, then run:

   ```sh
   ferry 2
   ```

   The terminal window moves to Space 2 and the screen follows it. The terminal
   has focus when you press Return. To move another window, bind ferry to a
   hotkey or pass `--window <id>`.

## Hotkeys with Raycast

Homebrew does not install the Raycast scripts. Clone this repository to a folder
you will keep, then add its [`raycast/`](raycast) directory to Raycast:

```sh
git clone https://github.com/softmaxe/ferry.git ~/ferry
```

1. In Raycast Settings > Extensions, choose **+** > **Add Script Directory**
   and pick `~/ferry/raycast`. If you already have a script directory, copy the
   five files into it instead.
2. Find **Ferry Window to Space 1** and assign a hotkey. Repeat for each Space
   you use, up to 5.

For Space 6 and up, copy a script and update `space=`, `@raycast.title`, and
`@raycast.description` to match the destination.

The scripts use `FERRY_BINARY` if set. Otherwise, they look for `ferry` on
`PATH`, then in `/opt/homebrew/bin`, `/usr/local/bin`, `$HOME/.local/bin`, and
`build/` next to the `raycast/` directory.

For a custom binary location, add this line to each script before the binary
lookup. Exporting it in a terminal only affects commands launched from that shell:

```sh
export FERRY_BINARY="/path/to/ferry"
```

## Usage

```sh
ferry 3                 # move the focused window to Space 3 and follow it
ferry --no-follow 3     # move it and stay on the current Space
ferry --verbose 3       # also print the window ID and timing
ferry --window 1234 3   # move window 1234 instead of the focused window
ferry --help            # print usage; -h also works
ferry --version         # print the version
```

Space numbers start at 1 and count all Spaces across all displays in Mission
Control order, including native fullscreen Spaces. They match the `index` field
of `yabai -m query --spaces`. The destination must already exist and must not be
a native fullscreen Space. ferry does not create Spaces.

`--window` takes a macOS window ID, not an app's process ID. If the window is
already on the destination Space, ferry skips the move and still requests focus
unless you pass `--no-follow`.

ferry prints nothing after a successful move unless `--verbose` is set.
Verbose output includes the window ID, how ferry selected it, the destination
Space ID, and move and total timing. These times cover work inside ferry. They
exclude launcher startup and do not measure the full Space switch animation.

`--verbose`, `--help`, and `--version` print to stdout. Errors go to stderr.
The exit status is `0` on success, `1` for runtime errors, and `2` for invalid
arguments. ferry verifies that the window is on the destination Space, but does
not verify that the focus change succeeded. Verbose output says `focus requested`
to distinguish the request from a confirmed Space switch.

Follow from a background app needs an Accessibility reference to the selected
window. ferry resolves explicit window IDs before moving them. Without
Accessibility, or when a window starts on an inactive Space and macOS omits it
from the app's Accessibility window list, the window may move without Follow.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `space N does not exist` | Create more Spaces in Mission Control, or pick a lower number. |
| `space N is a native fullscreen space` | Choose a non-fullscreen Space. ferry rejects fullscreen destinations. |
| `no focused window` | Click the window you want to move, then retry. |
| `window N not found` | The ID passed to `--window` may be stale. Use the focused window or a current window ID. |
| `window ... did not move` | ferry could not confirm the move within one second. Some windows, such as system panels and fullscreen windows, may refuse the move. |
| `unsupported macOS version` | ferry supports macOS 26 only. |
| ferry moves the wrong window | Turn on Accessibility for the app that runs ferry. See [Set up](#set-up). |
| Space numbers don't match what you see | Count Spaces across all displays, including fullscreen Spaces, and turn off automatic rearranging. See [Set up](#set-up). |
| A new binary or script starts slowly | Compare the first run with later runs. `--verbose` measures work inside ferry, so launcher and macOS startup checks can add time outside that measurement. |
| macOS cannot verify the developer | Browser downloads may trigger this warning. After trying to run ferry, open System Settings > Privacy & Security and choose Open Anyway. See [Apple's instructions](https://support.apple.com/en-us/102445). |

## Other ways to install

### Install from a release archive

Each [release](https://github.com/softmaxe/ferry/releases) has an archive for
Apple silicon, its SHA-256 checksum, and GitHub build provenance. Run these
commands in an empty directory with the [GitHub CLI](https://cli.github.com):

```sh
gh release download --repo softmaxe/ferry --pattern '*-aarch64-apple-darwin.tar.gz*'
shasum -a 256 -c ferry-*.tar.gz.sha256
gh attestation verify ferry-*.tar.gz --repo softmaxe/ferry
tar -xzf ferry-*.tar.gz ferry
mkdir -p ~/.local/bin && install -m 0755 ferry ~/.local/bin/ferry
```

Make sure `~/.local/bin` is on your `PATH`. After installation, you can delete the
downloaded archive, checksum, and extracted binary.

The binary has an ad hoc signature, without an Apple Developer ID signature or
notarization. Browser downloads may trigger a warning on the first run. See
[Troubleshooting](#troubleshooting).

### Build from source

Building requires the Xcode Command Line Tools with a macOS 26 SDK or newer.

```sh
git clone https://github.com/softmaxe/ferry.git
cd ferry
make
make test
make install PREFIX="$HOME/.local"
```

`make test` checks the command-line interface only. It does not move windows.
`make test-follow` runs the live desktop regression for background `--window`
commands. It requires Accessibility and two normal Spaces on the active display,
creates temporary test windows, and temporarily switches Spaces. It closes the
test windows and restores the original app afterward.

### Upgrade and uninstall

With Homebrew:

```sh
brew upgrade ferry
brew uninstall ferry
```

For the other methods, repeat the install to upgrade, or delete the installed
binary to uninstall. The commands above install it at `~/.local/bin/ferry`.
If you added Raycast scripts, remove them from your script directory too.
ferry creates no configuration or data files.

## How it works

ferry adapts yabai's Space lookup, window move, and focus code for macOS 26:

1. Maps the Space number to a Space ID with `SLSCopyManagedDisplaySpaces` and
   rejects fullscreen destinations.
2. Uses `--window` if supplied. Otherwise, it reads the frontmost app's focused
   window through Accessibility, with a fallback to that app's topmost visible
   normal window.
3. If the window is not already there, moves it with SkyLight's private
   `SLSBridgedMoveWindowsToManagedSpaceOperation` and sets the destination's front
   process with `SLSSpaceSetFrontPSN`. It waits up to one second for WindowServer
   to report the window on the destination Space.
4. Unless `--no-follow` is set, requests focus with
   `_SLPSSetFrontProcessWithOptions` and synthesized key-window events. It also
   calls `AXRaise` when the Accessibility lookup returned a window reference.
   Focusing the window asks macOS to switch to its Space.

The binary links AppKit even though it calls no AppKit API. Without AppKit
loaded, WindowServer ignores the move operation and reports no error.

These private macOS interfaces can change with an OS update. For upstream
changes, see `space_manager_move_window_to_space` in yabai's
[`src/space_manager.c`](https://github.com/asmvik/yabai/blob/master/src/space_manager.c)
and `window_manager_focus_window_with_raise` in
[`src/window_manager.c`](https://github.com/asmvik/yabai/blob/master/src/window_manager.c).

## License

[MIT](LICENSE). The window management code comes from
[yabai](https://github.com/asmvik/yabai) by Åsmund Vikane, also MIT.
