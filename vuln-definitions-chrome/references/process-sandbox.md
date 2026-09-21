# 分平台进程沙箱

定级按 **该缺陷出现的、沙箱最弱的出货平台**。  
某进程「含重要凭据或跨源数据」但已沙箱时，仍按**已沙箱**计（官方表注）。

上游对照：[process-sandboxes-by-platform.md](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/process-sandboxes-by-platform.md)（表更新至 **M128**；现场审计以当时 Stable 默认配置为准）。

utility 进程的沙箱看其主 mojo 服务上的 `ServiceSandbox` 属性，不要一律当 browser。

---

## 1. 部分平台未沙箱（定级最敏感）

| 进程 / 服务 | 未沙箱的平台 | 定级含义 |
|-------------|--------------|----------|
| **Browser** | 全部 | 永远未沙箱。网页直达内存破坏 / 任意本地文件 → **Critical** |
| **Network** | Android、Windows、Linux | 这些平台上，网页直达其内存破坏 → **Critical**；仅已沦陷 renderer 触发 → **High**。Fuchsia / Mac 上已沙箱 |
| **GPU** | Android | Android 上网页直达 GPU 内存破坏（无需先沦陷 renderer）→ **Critical**。Fuchsia / Mac / Windows / ChromeOS 上 GPU 已沙箱 → 其内 RCE 为 **High** |
| **On Device Model Execution** | Android、非 ChromeOS 的 Linux | 这些平台未沙箱，按高权进程 |
| **Video Capture** | 非 Fuchsia | 多数桌面/Android 未沙箱 |
| **kNoSandbox** | 全部 | 未沙箱 |
| **kNoSandboxAndElevatedPrivileges** | Windows | **提升权限**；标准安装下无前提的系统提权 → **High**（见 H 档 Other） |

现场不要背死上表：先查当前 Stable 该进程在目标 OS 是否沙箱，再定档。

---

## 2. 已沙箱（常见）

以下在官方表中视为沙箱（或仅在括号平台沙箱）：

- `kRenderer`（renderer、扩展页、PDF renderer）
- `kUtility` / `kService` / `kServiceWithJit`
- `kAudio` / `kCdm` / `kPrintCompositor` / `kSpeechRecognition` / `kScreenAI` / `kPrintBackend`
- `kOnDeviceModelExecution`（已沙箱的平台）
- Windows：`kIconReader`、`kMediaFoundationCdm`、`kPdfConversion`、`kXrCompositing`、`kProxyResolver`
- Linux & Ash：硬解/硬编视频
- Ash：`kIme`、`kTts`、`kLibassistant`、`kNearby`
- Mac：`kMirroring`
- Fuchsia：`kVideoCapture`；以及 Network / GPU 在该 OS 上的沙箱形态

**已沙箱进程内的任意代码执行 = High**，不是 Critical。  
**削弱沙箱但未逃出 = Low**（L 档「降低沙箱有效性」）。

---

## 3. 着色器编译器特例

若 GPU **着色器编译器**跑在 GPU 进程外的独立沙箱进程里：

- 它能打回 GPU 进程的 IPC 面远小于 renderer→browser
- 其内代码执行大致等于「能写任意着色器」，威胁低于 GPU 进程本体 RCE

**当前**：仅 **Metal 着色器编译器**（macOS）满足此条件。  
本应 High 的、且**只存在于该编译器**的洞 → **降为 Medium**。  
堆栈通常出现 `MTLCompiler`，PoC 只在 macOS 上复现。

其它着色器编译器仍按其所在 GPU 进程的沙箱状态定级。

---

## 4. 怎么填 finding

```yaml
chrome_process: browser | renderer | gpu | network | utility | kernel | other
chrome_sandbox: unsandboxed | sandboxed | platform_dependent
```

- 多平台都中、且至少一平台未沙箱 → `platform_dependent`，**按未沙箱平台**定档，rationale 写清 OS
- 内核内存破坏且可作逃逸 → `chrome_process: kernel`，条款走 High（已沦陷 renderer 前提）
