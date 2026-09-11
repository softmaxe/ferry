<h1 align="center">ferry</h1>

<p align="center">
  <a href="README.md"><kbd>English</kbd></a>
  <a href="README.zh-CN.md"><kbd>简体中文</kbd></a>
</p>

把 macOS 当前焦点窗口移到另一个 Space，并切换过去。相当于把
`yabai -m window --space N --focus` 单独做成一个 40 KB 的二进制文件。

```sh
ferry 3
```

- 每次调用运行一次就退出。没有常驻进程，没有 launchd 服务，没有配置文件。
- 不需要 scripting addition，系统完整性保护（SIP）保持开启。
- 在 Apple silicon Mac 上每次调用 30 到 45 ms。
- 附带 Space 1 到 5 的 Raycast Script Commands。

我写它是因为以前只知道 yabai 能做这件事，但我只用 yabai 几百条命令里的一条，却要跑它的整个服务。ferry 只保留这一条命令背后的代码，其余全部去掉。

## 安装

ferry 只支持 Apple silicon 上的 macOS 26（Tahoe）。

```sh
brew install softmaxe/tap/ferry
```

不用 Homebrew 的话，可以用 [Release 压缩包安装](#从-release-压缩包安装)，或者[从源码编译](#从源码编译)。

## 设置

1. 打开「系统设置 > 桌面与程序坞 > 调度中心」，关闭「根据最近的使用情况自动重新排列空间」。否则 macOS 会调整 Space 顺序，编号就对不上了。
2. 打开「系统设置 > 隐私与安全性 > 辅助功能」，给运行 ferry 的 App 打开权限，比如 Raycast 或终端。ferry 自己不会弹窗申请。有这个权限时，ferry 移动的是当前焦点窗口；没有的话，它移动该 App 最上层的窗口，App 开了多个窗口时可能不是你想要的那个。
3. 确认至少有两个 Space，然后在终端里运行：

   ```sh
   ferry 2
   ```

   终端窗口会移到 Space 2，屏幕也跟着切过去。在终端里运行时，移动的总是终端自己，因为按下回车时它就是焦点窗口。要移动其他窗口，请给 ferry 绑定快捷键。

## 用 Raycast 绑定快捷键

Homebrew 只安装二进制文件。Raycast 脚本在本仓库的 [`raycast/`](raycast) 目录里，所以要把仓库克隆到一个会长期保留的位置：

```sh
git clone https://github.com/softmaxe/ferry.git ~/ferry
```

1. 在「Raycast Settings > Extensions」中选择「+ > Add Script Directory」，选中 `~/ferry/raycast`。如果你已经有自己的脚本目录，也可以把这 5 个文件复制进去。
2. 找到 **Ferry Window to Space 1**，给它录一个快捷键。2 到 5 同理。

要支持 Space 6 及以后，复制一个脚本，同时修改 `space=` 和 `@raycast.title` 这一行。

脚本会依次在 `PATH`、`/opt/homebrew/bin`、`/usr/local/bin`、`$HOME/.local/bin` 和本项目的 `build/` 中查找 `ferry`。如果二进制文件在其他位置，可以指定路径：

```sh
export FERRY_BINARY="/path/to/ferry"
```

## 使用

```sh
ferry 3                 # 把焦点窗口移到 Space 3 并跟过去
ferry --no-follow 3     # 只移动窗口，停在当前 Space
ferry --verbose 3       # 同时输出窗口 ID 和耗时
ferry --window 1234 3   # 移动窗口 1234，而不是焦点窗口
```

Space 编号从 1 开始，按调度中心的顺序数所有显示器上的所有 Space，和 `yabai -m query --spaces` 输出的 `index` 字段一致。ferry 不会新建 Space，目标 Space 必须已经存在。

成功时 ferry 不输出任何内容，错误信息写到 stderr。退出码：成功为 `0`，移动失败为 `1`，参数错误为 `2`。

## 常见问题

| 问题 | 处理方法 |
| --- | --- |
| `space N does not exist` | 在调度中心新建更多 Space，或者换一个更小的编号。 |
| `space N is a native fullscreen space` | macOS 不允许把窗口移进全屏 Space。 |
| `no focused window` | 先点一下要移动的窗口，再重试。 |
| `window ... did not move` | 有些窗口不允许移动，比如系统面板和全屏窗口。 |
| `unsupported macOS version` | ferry 只支持 macOS 26。 |
| 移动的不是想要的窗口 | 给运行 ferry 的 App 打开辅助功能权限，见[设置](#设置)。 |
| Space 编号和看到的顺序不一致 | 关闭自动重新排列空间，见[设置](#设置)。 |
| 新二进制或新脚本第一次运行要半秒左右 | macOS 会对每个新的可执行文件扫描一次，之后就快了。 |
| macOS 阻止运行 | 用浏览器下载压缩包时会出现。打开「系统设置 > 隐私与安全性」，为 `ferry` 选择「仍要打开」。 |

## 其他安装方式

### 从 Release 压缩包安装

每个 [Release](https://github.com/softmaxe/ferry/releases) 都有 `arm64` 压缩包、SHA-256 校验值和 GitHub 构建来源证明（build provenance）。使用 [GitHub CLI](https://cli.github.com)：

```sh
gh release download --repo softmaxe/ferry --pattern '*.tar.gz*'
shasum -a 256 -c ferry-*.tar.gz.sha256
gh attestation verify ferry-*.tar.gz --repo softmaxe/ferry
tar -xzf ferry-*.tar.gz ferry
mkdir -p ~/.local/bin && install -m 0755 ferry ~/.local/bin/ferry
```

确认 `~/.local/bin` 在 `PATH` 里。二进制文件没有签名，也没有公证。如果改用浏览器下载压缩包，macOS 可能会阻止第一次运行，见[常见问题](#常见问题)。

### 从源码编译

需要 Xcode Command Line Tools。

```sh
make
make test
make install PREFIX="$HOME/.local"
```

`make test` 只检查命令行接口，不会移动窗口。

### 升级和卸载

Homebrew 安装的：

```sh
brew upgrade ferry
brew uninstall ferry
```

其他方式安装的，重新安装一遍就是升级，删掉 `~/.local/bin/ferry` 就是卸载。ferry 不会写入其他文件。

## 工作原理

ferry 重复了 yabai 在 macOS 26 上执行 `window --space N --focus` 的步骤：

1. 通过辅助功能 API 读取最前面 App 的焦点窗口。读不到时，改用该 App 最上层的可见窗口。
2. 用 `SLSCopyManagedDisplaySpaces` 把 Space 编号换算成 Space ID。
3. 用 SkyLight 的私有类 `SLSBridgedMoveWindowsToManagedSpaceOperation` 移动窗口，然后等 WindowServer 报告窗口已经到了新 Space。
4. 用 `_SLPSSetFrontProcessWithOptions`、一个合成的 key-window 事件和 `AXRaise` 聚焦窗口，macOS 随之切换到那个 Space。

这个二进制链接了 AppKit，但没有调用任何 AppKit API。不加载 AppKit 的话，WindowServer 会忽略移动操作，而且不报任何错误。

这些都是 macOS 的私有接口。macOS 更新可能让 ferry 失效，yabai 也一样。到时候可以去 yabai 的 `space_manager_move_window_to_space` 里找修复方法。

## 许可证

[MIT](LICENSE)。窗口管理相关代码来自 Åsmund Vikane 的 [yabai](https://github.com/asmvik/yabai)，同样是 MIT 许可证。
