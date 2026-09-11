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

## 系统要求

- Apple silicon 上的 macOS 26（Tahoe）
- 目标 Space 必须已经存在
- 启动 `ferry` 的 App 需要辅助功能权限，比如 Raycast 或终端。ferry 用它找到焦点窗口。

在「系统设置 > 桌面与程序坞 > 调度中心」里关闭「根据最近的使用情况自动重新排列空间」。否则 macOS 会调整 Space 顺序，编号就对不上了。

## 安装

Homebrew 软件包和 GitHub Release 压缩包只支持 Apple silicon（`arm64`）。发布的二进制文件没有签名，也没有公证，macOS 可能需要你在「系统设置 > 隐私与安全性」中允许运行。

```sh
brew install softmaxe/tap/ferry
ferry --version
```

升级或卸载：

```sh
brew upgrade ferry
brew uninstall ferry
```

## 使用

```sh
ferry 3                 # 把焦点窗口移到 Space 3 并跟过去
ferry --no-follow 3     # 只移动窗口，停在当前 Space
ferry --verbose 3       # 同时输出窗口 ID 和耗时
ferry --window 1234 3   # 移动窗口 1234，而不是焦点窗口
```

Space 编号从 1 开始，按调度中心的顺序数所有显示器上的所有 Space，和 `yabai -m query --spaces` 输出的 `index` 字段一致。

在终端里运行 `ferry` 会移动终端窗口本身，因为它就是焦点窗口。要移动其他窗口，请绑定快捷键。

成功时 ferry 不输出任何内容，错误信息写到 stderr。退出码：成功为 `0`，移动失败为 `1`，参数错误为 `2`。

## Raycast

[`raycast/`](raycast) 里有 5 个 Raycast Script Commands：**Ferry Window to Space 1** 到 **5**。在「Raycast Settings > Extensions > + > Add Script Directory」中添加本仓库的 `raycast` 目录，再给每个命令录一个快捷键。要支持更多 Space，复制一个脚本并修改 `space=`。

脚本会依次在 `PATH`、Homebrew 标准目录、`$HOME/.local/bin` 和本项目的 `build/` 中查找 `ferry`。如果二进制文件在其他位置，可以指定路径：

```sh
export FERRY_BINARY="/path/to/ferry"
```

## 从源码编译

需要 Xcode Command Line Tools。

```sh
make
make test
make install PREFIX="$HOME/.local"
```

`make test` 只检查命令行接口，不会移动窗口。

## 常见问题

| 问题 | 处理方法 |
| --- | --- |
| `space N does not exist` | 在调度中心新建更多 Space，或者换一个更小的编号。 |
| `space N is a native fullscreen space` | macOS 不允许把窗口移进全屏 Space。 |
| `no focused window` | 先点一下要移动的窗口，再重试。 |
| `window ... did not move` | 有些窗口不允许移动，比如系统面板和全屏窗口。 |
| `unsupported macOS version` | ferry 只支持 macOS 26。 |
| 新二进制或新脚本第一次运行要半秒左右 | macOS 会对每个新的可执行文件扫描一次，之后就快了。 |
| macOS 阻止运行 | 打开「系统设置 > 隐私与安全性」，为 `ferry` 选择「仍要打开」。 |

## 工作原理

ferry 重复了 yabai 在 macOS 26 上执行 `window --space N --focus` 的步骤：

1. 通过辅助功能 API 读取最前面 App 的焦点窗口。读不到时，改用该 App 最上层的可见窗口。
2. 用 `SLSCopyManagedDisplaySpaces` 把 Space 编号换算成 Space ID。
3. 用 SkyLight 的私有类 `SLSBridgedMoveWindowsToManagedSpaceOperation` 移动窗口，然后等 WindowServer 报告窗口已经到了新 Space。
4. 用 `_SLPSSetFrontProcessWithOptions`、一个合成的 key-window 事件和 `AXRaise` 聚焦窗口，macOS 随之切换到那个 Space。

这个二进制链接了 AppKit，但没有调用任何 AppKit API。不加载 AppKit 的话，WindowServer 会忽略移动操作，而且不报任何错误。

这些都是 macOS 的私有接口。macOS 更新可能让 ferry 失效，yabai 也一样。到时候可以去 yabai 的 `space_manager_move_window_to_space` 里找修复方法。

每个 Release 都会发布压缩包的 SHA-256 校验值和 GitHub 构建来源证明（build provenance）。详见 [releases](https://github.com/softmaxe/ferry/releases) 和 [发布流程](.github/workflows/release.yml)。

## 许可证

[MIT](LICENSE)。窗口管理相关代码来自 Åsmund Vikane 的 [yabai](https://github.com/asmvik/yabai)，同样是 MIT 许可证。
