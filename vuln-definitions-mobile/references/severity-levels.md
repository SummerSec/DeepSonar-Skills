# 定级条款：HackerOne 移动端赏金惯例 → 四档 + 移动端领域条款

本文件为 **移动端领域（Android App + iOS App 应用层）** 的定级规则。
按 HackerOne 移动端赏金项目惯例定官方档（Uber / Twitter / Nextcloud / Grab / Evernote 等公开口径 + [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)），映射为本仓四档，并给出移动端语境的判定条款。

> 语义基线：HackerOne 移动端公开报告惯例 + OWASP MASVS / Mobile Top 10（对照日 2026-08-30）；厂商项目规则另见 `google-android-devices-rules.md`（资格，不定级）。
> 与全局 `severity-levels.md` / `<type>.md` 冲突时，**移动端语义以本文件为准**。赏金表 **不** 改档。

---

## 1. 攻击者模型（前提）简介

四档之前先定 **攻击者位置**（详见 `terminology.md`）：

| 前提 | 含义 | 典型形态 |
| ------ | ------ | ---------- |
| 远程（`remote_link`） | 网页 / 深链接诱导，用户点击后触发 | Deep Link、WebView、URL Scheme、CSRF |
| 恶意 App（`malicious_app`） | 同设备已安装的恶意 App 主动发起 | Intent 劫持、组件导出、广播、Content Provider |
| 邻近网络（`nearby_mitm`） | WiFi / 网络路径 MITM | SSL/TLS、证书固定绕过 |
| 本地已越狱（`local_rooted`） | 需已 root / 越狱设备 | 本地存储读取、内存分析 |

**纪律**：同一缺陷前提不同档位不同。`已越狱 / root` 是降档前提，不是默认前提。

---

## 2. 前提 × 影响矩阵

| 影响 \ 前提 | 远程（诱导点击） | 恶意 App | 邻近网络 MITM | 已越狱 / root |
| ------------- | ------------------ | ---------- | --------------- | ---------------- |
| RCE / 完整账户接管 | **C1** / **C2** | **C3**（高权限应用）/ H1 | H5（窃会话后接管） | 降档（ADJ1） |
| 任意文件读写（应用数据） | **H1** | **H2** | — | 降档 |
| 越权访问他人账户 / 数据 | **H3** | **H3** | — | 降档 |
| 权限绕过 / WIU 保留 / 跨用户与 Private Space 越界 | **H9** / **H11** | **H9** / **H11** | — | 降档 |
| UI 覆盖 / 点按劫持（捕获凭据或安全确认） | **H10** | **H10** | — | 降档 |
| 可接管级凭据泄露 | **H4** | **H4** | **H5** | 降档 |
| 有限信息泄露 | M1 | M1 | M2 | 降档 |
| 仅资源耗尽 / 崩溃 / 本地杀进程 | 排除（INV1，本地） | 排除（INV1） | — | 排除 |
| 破坏性远程 DoS（恢复出厂级） | **H8** | — | — | 排除 |

- **列（前提）比行（影响）先看**：同一技术缺陷，前提不同档位不同
- **本地 DoS 不报**（INV1）：本地纯崩溃、资源耗尽、杀进程（含导出 Service + FGS 5s 超时）→ `reportable: false`，不要写成 M/L。同一入口另有 C/I 实害时按那条定档，不以本地崩溃撑档
- **破坏性远程 DoS 按 H8**：远程触发且需恢复出厂、永久删除用户 / Profile、无交互卸载 App、或干扰紧急呼叫。INV1 **不含**远程
- **入口面本身不定漏洞**（INV26）：exported launcher / MainActivity、自定义 scheme、不校验调用方是平台固有入口面，不是漏洞。须证明未授权敏感 sink（深链直接特权操作、URI/extra 当可信输入、OAuth 一次性码可截获、带登录态加载攻击者 URL）。仅唤起 / 打开默认页 / 官方登录 Custom Tab / 参数白名单 + 登录门控 → `reportable: false`，**不要写成 M/L**
- 「已越狱后可读 Keychain」不是漏洞；「普通用户路径可读明文凭据」才是
- 深链接 / URL Scheme 类 **默认算「远程诱导点击」**，除非需要额外本地能力

---

## 3. 严重（→ critical）

| # | 判定条件 |
| --- | ---------- |
| C1 | 远程稳定 RCE：诱导点击后，WebView `addJavascriptInterface` 反射执行、深链接路径遍历写 `.so` 覆盖库等，主路径可稳定控制应用进程代码执行 |
| C2 | 完整账户接管：OAuth 授权码 / 令牌劫持（URL Scheme / Deep Link 回调）、深链接会话劫持、2FA 绕过 + 会话接管——无需受害者输入即可换得完整账户 |
| C3 | 恶意 App 触发的高权限应用越权：持有高权限（系统权限 / 支付）的应用被 Confused Deputy / 组件导出触发到系统级操作 |
| C4 | 未认证可达的稳定内存破坏（应用侧原生库）：默认 / 常见配置下不可信输入可稳定控制执行流 |

---

## 4. 高危（→ high）

| # | 判定条件 |
| --- | ---------- |
| H1 | 需前提的 RCE：需用户多步操作、非最新版本、需特定 WebView 配置才可达的代码执行 |
| H2 | 任意文件读写：Content Provider 路径遍历、深链接路径遍历、符号链接攻击——越出应用沙箱读写文件（未到代码执行） |
| H3 | WebView XSS / UXSS 打会话、越权访问他人账户 / 数据：深链接验证绕过**实际加载**任意 URL、Intent 劫持换数据、组件导出认证绕过（进入认证后界面）。仅入口面（exported / 自定义 scheme / 不校验调用方）/ 打开官方登录页不够（INV26） |
| H4 | 可接管级凭据泄露：硬编码 API key / token 可直接接管服务或账户（secrets 类） |
| H5 | MITM 窃取会话：证书验证缺失 / 固定绕过，邻近网络窃取 OAuth 令牌 / 会话 |
| H6 | 认证 / 授权绕过：2FA / OTP 可暴力破解、账户覆盖（邮箱大小写）、认证链缺陷 |
| H7 | 存储型 / 持久的 WebView XSS 打他人：可窃取其他用户会话（POST 反射 / self-XSS 被排除） |
| H8 | 破坏性远程 DoS：远程触发且需恢复出厂设置、永久删除用户 / Profile 状态、无交互卸载 App，或反复呼出 / 阻止呼出紧急呼叫（项目口径见 `google-android-devices-rules.md` §3）。本地杀进程 / 纯崩溃走 INV1，不落本条 |
| H9 | 权限绕过与保留：绕过系统 / signature / dangerous 权限取得敏感数据或阻止其撤销；Special App Access 未授权获取；一次过 / 使用时（WIU）权限跨进程死亡或重启后保留；后台非法启动 FGS 取得 WIU 权限 |
| H10 | UI 覆盖 / 点按劫持 / `FLAG_SECURE` 绕过：覆盖隐私与安全敏感界面、伪造 UI 真实性、隐藏隐私敏感系统指示器，且能捕获凭据或安全确认 |
| H11 | 跨用户 / Private Space 越界：跨用户读取他人敏感数据；未用指定锁定因子解锁 Private Space |

---

## 5. 中危（→ medium）

| # | 判定条件 |
| --- | ---------- |
| M1 | 有限信息泄露：低敏元数据、内部路径 / 堆栈、不可利用的缓存数据 |
| M2 | 邻近网络下的低敏信息：可读低敏流量（无令牌 / 凭据） |
| M3 | 不安全数据存储（本地，未提权）：SharedPreferences / NSUserDefaults / 明文 SQLite 存敏感但非直接接管级数据 |
| M4 | 广播劫持 / 隐式广播泄露低敏数据 |
| M5 | 需多项前提的越权：需管理员主动误配置 + 特定交互 |
| M6 | 会话 / 令牌缺陷：可利用但影响有限（仅延长有效期、登出后残留） |
| M7 | 深链接 CSRF 的有限实害：触发非敏感操作 |
| M8 | UI 覆盖 / 隐私指示器隐藏，无可演示的凭据捕获或跨用户越界 |
| M9 | 有限权限面：Special App Access 未授权获取或阻止撤销但未取得敏感数据；未授权移除企业 DPC |

---

## 6. 低危（→ low）

| # | 判定条件 |
| --- | ---------- |
| L1 | 复杂前提的低敏越权：需受害者高度配合（多次交互 / 异常操作序列） |
| L2 | 自身账号内配置缺陷：无跨用户影响但有轻微安全含义 |
| L3 | 有限 UI / 逻辑缺陷：带轻微安全含义（注意：纯「缺安全头 / 版本披露 / 缺限速」已被排除，不是低危） |

> 项目排除项（缺限速、缺安全头、版本披露、self-XSS、**本地 DoS / 纯崩溃 / 本地杀进程**、**入口面本身**）**不落在低危 / 中危**，直接 `reportable: false`——见 `adjustment-and-invalid.md` INV1、INV26。破坏性远程 DoS 按 H8，不要写成排除。

---

## 7. 定级纪律

- 先走 `gates.md`：**威胁模型 → 资产范围 → 环境合格 → 安全实害 → 可复现**
- `severity_rule` 填本文件锚点，如 `severity-levels.md#H2`。另填 `mobile_class`、`platform`、`component`、`attacker`、`prereq`
- 与 CVSS：本文件定性；量化用 `vuln-scoring`（默认 v3.1）。CVSS **不得**单独抬档
- **边界情况对照 `history-patterns.md` §3 定级校准**：深链接 → WebView 任意 URL 加载按 H3（K1）；URL Scheme 劫持需用户点击按降档（K2）；`addJavascriptInterface` 旧版 RCE 按版本校准（K3）；SSL/TLS 缺失按 MITM 前提 H5（K4）；不安全数据存储默认 M、含接管凭据才 H（K5）；需已越狱按降档（K6）；StrandHogg 类已修复历史型需确认最新版本仍受影响（K7）；入口面本身按 INV26 不报（K8）。命中校准点在 `rationale` 写 `history-patterns.md#K_`
- **不收录具体 case**：无 CVE / 报告清单
- **厂商项目规则不改档**：目标项目为 Google Bug Hunters 的 Android 与 Google 设备项目时，范围、PoC 与补丁要求、奖金与 SNR 纪律见 `google-android-devices-rules.md`；其判定写 `bounty_eligible`，**不写** `severity`
