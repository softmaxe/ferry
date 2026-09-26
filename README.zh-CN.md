<p align="center">
  <img src="docs/assets/ferry-logo.png" alt="Ferry 标志：搭载桌面窗口的渡船" width="180">
</p>

<h1 align="center">ferry</h1>

<p align="center">
  <a href="README.md"><kbd>English</kbd></a>
  <a href="README.zh-CN.md"><kbd>简体中文</kbd></a>
</p>

把 macOS 焦点窗口移到另一个 Space，并跟随过去。ferry 将
`yabai -m window --space N --focus` 背后的代码改成一条独立命令，无需安装 yabai。

```sh
ferry 3
```

https://github.com/user-attachments/assets/b46ac753-cedb-400c-b556-9e2322936171

- 运行一次就退出，没有常驻服务或配置文件。
- 不需要 scripting addition，也不需要更改系统完整性保护 SIP 的设置。
- 附带 Space 1 到 5 的 Raycast Script Commands。

我只用 yabai 把窗口移到另一个 Space 并跟随过去。写 ferry 是为了保留这条命令，不必运行 yabai 服务。

## 安装

ferry 只支持 Apple silicon 上的 macOS 26 Tahoe。

```sh
brew install softmaxe/tap/ferry
```

不用 Homebrew 的话，可以[从 Release 压缩包安装](#从-release-压缩包安装)，或[从源码编译](#从源码编译)。

## 设置

1. 打开「系统设置 > 桌面与程序坞 > 调度中心」，关闭「根据最近的使用情况自动重新排列空间」，避免切换 Space 时编号变化。
2. 打开「系统设置 > 隐私与安全性 > 辅助功能」，给运行 ferry 的 App 授权，比如 Raycast 或终端。ferry 不会弹窗申请权限。如果无法通过辅助功能读取焦点窗口，它会改用最前面 App 的最上层可见普通窗口。App 开了多个窗口时，两者可能不同。
3. 确认 Space 2 已存在，且不是原生全屏 Space，然后在终端里运行：

   ```sh
   ferry 2
   ```

   终端窗口会移到 Space 2，屏幕也跟随过去，因为按下回车时终端拥有焦点。要移动其他窗口，请给 ferry 绑定快捷键，或传入 `--window <id>`。

## 用 Raycast 绑定快捷键

Homebrew 不会安装 Raycast 脚本。把仓库克隆到一个会长期保留的位置，再将其中的 [`raycast/`](raycast) 目录添加到 Raycast：

```sh
git clone https://github.com/softmaxe/ferry.git ~/ferry
```

1. 在「Raycast Settings > Extensions」中选择「+ > Add Script Directory」，选中 `~/ferry/raycast`。如果你已经有自己的脚本目录，也可以把这 5 个文件复制进去。
2. 找到 **Ferry Window to Space 1**，绑定快捷键。再为你用到的 Space 2 到 5 分别绑定。

要支持 Space 6 及以后，复制一个脚本，将 `space=`、`@raycast.title` 和 `@raycast.description` 改成对应的目标 Space。

脚本优先使用 `FERRY_BINARY`。未设置时，依次在 `PATH`、`/opt/homebrew/bin`、`/usr/local/bin`、`$HOME/.local/bin` 和 `raycast/` 同级的 `build/` 目录中查找 `ferry`。

如果二进制文件在其他位置，把下面这行加到每个脚本中，放在查找二进制文件的代码之前。在终端执行 export 只会影响从该 shell 启动的命令：

```sh
export FERRY_BINARY="/path/to/ferry"
```

## 使用

```sh
ferry 3                 # move the focused window to Space 3 and follow it
ferry --no-follow 3     # move it and stay on the current Space
ferry --verbose 3       # also print the window ID and timing
ferry --window 1234 3   # move window 1234 instead of the focused window
ferry --help            # print usage; -h also works
ferry --version         # print the version
```

Space 编号从 1 开始，按调度中心的顺序计算所有显示器上的所有 Space，包括原生全屏 Space，和 `yabai -m query --spaces` 输出的 `index` 字段一致。目标 Space 必须已经存在，且不能是原生全屏 Space。ferry 不会新建 Space。

`--window` 接受 macOS 窗口 ID，不是 App 的进程 ID。如果窗口已在目标 Space，ferry 会跳过移动，但仍会请求聚焦该窗口，除非传入 `--no-follow`。

移动成功后，ferry 默认不输出内容。加上 `--verbose` 会输出窗口 ID、窗口选择方式、目标 Space ID，以及移动和总运行耗时。这些时间只涵盖 ferry 内部执行，不包含启动器的启动耗时，也不代表完整的 Space 切换动画时长。

`--verbose`、`--help` 和 `--version` 输出到 stdout，错误信息写到 stderr。退出码为 `0` 表示成功，`1` 表示运行时错误，`2` 表示参数错误。ferry 会确认窗口已在目标 Space，但不会检查焦点是否切换成功。

## 常见问题

| 问题 | 处理方法 |
| --- | --- |
| `space N does not exist` | 在调度中心新建更多 Space，或者换一个更小的编号。 |
| `space N is a native fullscreen space` | 选择非全屏 Space。ferry 不接受全屏 Space 作为目标。 |
| `no focused window` | 先点一下要移动的窗口，再重试。 |
| `window N not found` | 传给 `--window` 的 ID 可能已失效。改用焦点窗口或有效的窗口 ID。 |
| `window ... did not move` | ferry 未能在一秒内确认移动完成。系统面板、全屏窗口等窗口可能拒绝移动。 |
| `unsupported macOS version` | ferry 只支持 macOS 26。 |
| 移动的不是想要的窗口 | 给运行 ferry 的 App 打开辅助功能权限，见[设置](#设置)。 |
| Space 编号和看到的顺序不一致 | 编号包括所有显示器上的全屏 Space；同时关闭自动重新排列，见[设置](#设置)。 |
| 新二进制或脚本启动慢 | 比较首次和后续运行的速度。`--verbose` 只测量 ferry 内部执行，启动器和 macOS 启动检查可能另有耗时。 |
| macOS 无法验证开发者 | 浏览器下载可能触发此提示。尝试运行 ferry 后，打开「系统设置 > 隐私与安全性」，选择「仍要打开」。参见 [Apple 的说明](https://support.apple.com/zh-cn/102445)。 |

## 其他安装方式

### 从 Release 压缩包安装

每个 [Release](https://github.com/softmaxe/ferry/releases) 都有 Apple silicon 压缩包、SHA-256 校验值和 GitHub 构建来源证明。安装 [GitHub CLI](https://cli.github.com) 后，在空目录里运行：

```sh
gh release download --repo softmaxe/ferry --pattern '*-aarch64-apple-darwin.tar.gz*'
shasum -a 256 -c ferry-*.tar.gz.sha256
gh attestation verify ferry-*.tar.gz --repo softmaxe/ferry
tar -xzf ferry-*.tar.gz ferry
mkdir -p ~/.local/bin && install -m 0755 ferry ~/.local/bin/ferry
```

确认 `~/.local/bin` 在 `PATH` 里。安装完成后，可以删除下载的压缩包、校验文件和解压出的二进制文件。

二进制文件使用 ad hoc 签名，没有 Apple Developer ID 签名，也没有公证。浏览器下载可能在首次运行时触发提示，见[常见问题](#常见问题)。

### 从源码编译

需要 Xcode Command Line Tools，以及 macOS 26 或更新版本的 SDK。

```sh
git clone https://github.com/softmaxe/ferry.git
cd ferry
make
make test
make install PREFIX="$HOME/.local"
```

`make test` 只检查命令行接口，不会移动窗口。

### 升级和卸载

通过 Homebrew 升级或卸载：

```sh
brew upgrade ferry
brew uninstall ferry
```

其他方式安装的，重复安装步骤即可升级，删除已安装的二进制文件即可卸载。上面的命令将它安装在 `~/.local/bin/ferry`。如果添加过 Raycast 脚本，也请从脚本目录中移除。ferry 不会创建配置或数据文件。

## 工作原理

ferry 改编了 yabai 的 Space 查询、窗口移动和聚焦代码，用于 macOS 26：

1. 用 `SLSCopyManagedDisplaySpaces` 把 Space 编号换算成 Space ID，并拒绝全屏目标。
2. 如果传入了 `--window`，就使用指定窗口。否则通过辅助功能读取最前面 App 的焦点窗口，读不到时改用该 App 最上层的可见普通窗口。
3. 如果窗口尚未在目标 Space，用 SkyLight 的私有类 `SLSBridgedMoveWindowsToManagedSpaceOperation` 移动窗口，再用 `SLSSpaceSetFrontPSN` 设置目标 Space 的前台进程。随后最多等待一秒，确认 WindowServer 报告窗口已在目标 Space。
4. 除非设置了 `--no-follow`，否则用 `_SLPSSetFrontProcessWithOptions` 和合成的 key-window 事件请求聚焦窗口。如果辅助功能查询返回了窗口引用，还会调用 `AXRaise`。聚焦窗口会请求 macOS 切换到它所在的 Space。

这个二进制链接了 AppKit，但没有调用任何 AppKit API。不加载 AppKit 的话，WindowServer 会忽略移动操作，而且不报任何错误。

这些 macOS 私有接口可能随系统更新而变化。查阅上游改动时，可查看 yabai
[`src/space_manager.c`](https://github.com/asmvik/yabai/blob/master/src/space_manager.c) 中的
`space_manager_move_window_to_space`，以及
[`src/window_manager.c`](https://github.com/asmvik/yabai/blob/master/src/window_manager.c) 中的
`window_manager_focus_window_with_raise`。

## 许可证

[MIT](LICENSE)。窗口管理相关代码来自 Åsmund Vikane 的 [yabai](https://github.com/asmvik/yabai)，同样是 MIT 许可证。
