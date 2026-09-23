# tooling — 工具边界与供应链安全

## 目标

明确移动审计可用工具、与仓库 `agent-env/tools-manifest.json` 的对齐关系、安装纪律与可复现命令边界；**禁止** `curl | sh`（及等价「管道执行远程脚本」）安装未知工具。

## 章节

### 1. 与 agent-env 的诚实对齐

当前仓库 [`agent-env/tools-manifest.json`](../../../../agent-env/tools-manifest.json) 面向 **Web 黑盒**（httpx、ffuf、nuclei、sqlmap、interactsh-client、jwt_tool、gitleaks、trufflehog、ysoserial 等），**未列入** 移动审计常用链。

因此本 skill 将工具分为三档：

| 档 | 含义 | 移动审计示例 |
| ---- | ------ | -------------- |
| **已在 manifest / 通用预装** | 可直接假设在 PATH | `curl`（仅 HTTP 手工）、`python3`、`jq`、`ripgrep` |
| **期望预装（manifest 缺口）** | 移动镜像应预装；**当前 manifest 无则不得假装已有** | `adb`、`aapt2`、`apktool`、`jadx`、`apkanalyzer`、`bundletool`、`frida`/`frida-tools`、`mitmproxy`、`openssl` |
| **需经批准安装** | 用户/平台明确批准后，经 **官方包管理或校验哈希的 release 产物** 安装；写入变更说明 | 特定版本 Freida server、平台 SDK 组件、iOS 侧授权工具 |

Skill **不得**假设可任意联网装包；缺口应在 `assets.json` / 审计计划中写明「缺 adb/jadx/…」，并请求环境补齐。

### 2. 禁止的安装方式

- **禁止** `curl | sh`、`wget | sh`、`curl | bash` 及未校验的远程安装脚本  
- **禁止** 从不明域名拉取脱壳器/破解器并执行  
- 允许：镜像预装、组织内 artifact、官方 GitHub release + 校验和、apt/pip **在批准列表内** 的包名

### 3. 脱壳隔离

- 脱壳/解密产物仅落 **隔离工作目录**；不回写用户主目录或未授权存储  
- 不在 skill 中展开免脱壳对抗或厂商壳绕过教程；能说明「需隔离脱壳后方可静态」即可  
- 工具输出中的路径/字符串 **不当自动 finding**（见下，INV12 类：工具噪声）

### 4. 可复现命令（示意，按环境裁剪）

在工具 **确实可用** 时，优先固定版本并记录：

```bash
# 指纹与清单（示例）
sha256sum target.apk
aapt2 dump badging target.apk
# 反编译（示例）
apktool d -o out-apktool target.apk
jadx -d out-jadx target.apk
# 设备（示例）
adb devices
adb install -r target.apk
adb logcat -d | rg POC-ATTACKER
```

iOS 与商业工具命令因授权与平台差异大，仅在环境确认后使用，同样记录版本。

### 5. 工具产出不当 finding（INV12 取向）

- 扫描器/反编译器的「security info」提示、权限列表、exported 枚举 **不能**直接变正式 finding  
- 须经本 skill 工作流落到可控 source→sink + 证据，再交 definitions 定级  
- nuclei 等 Web 模板若误扫移动相关 URL，同样需人工升格，默认丢弃

### 6. 供应链

- 记录工具名、版本、来源 URL、哈希（若有）于 `evidence/notes` 或审计附录  
- 不把目标 App 的代码送入未批准的第三方「在线反编译」服务（除非授权）

## 产出

- 审计计划中的工具可用性矩阵（已有 / 期望预装缺口 / 待批准）  
- 实际使用命令与版本清单（附证据包）

## 陷阱

- **假装 manifest 已有 apktool/jadx/adb**：导致 agent 幻觉执行失败或擅自 curl 安装  
- **curl|sh 装 Frida/脱壳器**：供应链与授权双重违规  
- **把工具告警当漏洞（INV12）**  
- **在线第三方反编译泄密**
