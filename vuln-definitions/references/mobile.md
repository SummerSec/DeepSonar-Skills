# 移动端领域（Android App / iOS App）定级规则

本文件为 **移动端领域（Android App 与 iOS App 应用层）** 的定级规则。  
审计目标为 **Android / iOS 应用（APK / IPA / 应用内 WebView / 混合栈）** 时，优先以本文件条款定级；与全局 `severity-levels.md` / `<type>.md` 冲突时，**移动端语义以本文件为准**。系统层缺陷（内核 / 系统服务 / 框架）走 `openharmony.md` / `vuln-definitions-oh`。

> 语义基线：HackerOne 移动端赏金惯例 + OWASP Mobile Top 10（对照日 2026-08-30）。  
> 完整形态表、攻击面索引、门禁、历史模式库与**项目规则**（`google-android-devices-rules.md`）见插件 `vuln-definitions-mobile`。赏金表 **不** 改本文件档位。

---

## 1. 何时使用

- 目标是 Android / iOS **应用**（APK / IPA、应用内 WebView / React Native / Flutter 混合壳、第三方移动 SDK）
- finding 涉及：Deep Link / intent scheme、URL Scheme / Universal Links、WebView XSS·RCE·JS bridge、Intent 与组件导出、Content Provider、广播、文件与路径遍历、数据存储与密钥、SSL/TLS 证书与固定、OAuth 回调、认证与账户逻辑、任务 / 窗口
- 需要按 HackerOne 移动端惯例定档，或判断是否合格 / 排除
- 已授权参与移动端赏金项目时：范围 / 纪律 / `bounty_eligible` 见完整插件（本文件不定资格）

---

## 2. 术语（要点）

| 术语 | 定义 |
| ------ | ------ |
| 远程攻击者（`remote_link`） | 网页 / 深链接诱导，用户点击后触发 |
| 恶意 App（`malicious_app`） | 同设备已安装恶意应用主动发起 |
| 邻近网络（`nearby_mitm`） | WiFi / 网络路径 MITM |
| 本地已越狱（`local_rooted`） | 需已 root / 越狱设备——**降档前提，不是默认前提** |
| 应用沙箱 | Android per-UID / iOS 容器；越界读写 = 漏洞 |
| 应用层 vs 系统层 | 本文件只管应用层；系统层走 `vuln-definitions-oh` |
| 可接管级凭据 | OAuth token / session / API key / 私钥，泄露可直接接管 |

**不在威胁模型**：已越狱前提、物理设备访问、管理员自伤、**本地 DoS**（本地杀进程 / 本地纯崩溃 / 本地资源耗尽）。破坏性远程 DoS 按 H8。

---

## 3. 四档危害（领域条款）

> HackerOne 移动端赏金惯例 → `critical/high/medium/low` 四档。  
> 走 `vuln-definitions-mobile` 时 **官方四档均可写入正式 finding**。仓级「只报 C/H」不适用。排除条款与 Gate 不过仍不报，不要把低危写成 `none`。

| 档 | 本仓映射 | 一句话 |
| ---- | ---------- | -------- |
| 严重 | `critical` | 远程稳定 RCE；完整账户接管（授权码 / 令牌劫持） |
| 高危 | `high` | 需前提 RCE / 任意文件读写 / WebView XSS 打会话 / 可接管凭据泄露 / MITM 窃会话 |
| 中危 | `medium` | 有限信息泄露 / 本地明文存储（未提权）/ 需多前提的越权 |
| 低危 | `low` | 复杂前提低敏越权 / 自身账号轻微缺陷 |

### 严重（→ critical）

| # | 判定条件 |
| --- | ---------- |
| C1 | 远程稳定 RCE：诱导点击后，WebView `addJavascriptInterface` 反射执行、深链接路径遍历写 `.so` 覆盖库 |
| C2 | 完整账户接管：OAuth 授权码 / 令牌劫持（URL Scheme / Deep Link 回调）、深链接会话劫持、2FA 绕过 + 会话接管 |
| C3 | 恶意 App 触发的高权限应用越权（Confused Deputy / 组件导出 → 系统级操作） |
| C4 | 未认证可达且可稳定控制执行流的内存破坏（应用侧原生库） |

### 高危（→ high）

| # | 判定条件 |
| --- | ---------- |
| H1 | 需前提的 RCE（多步交互 / 非最新版本 / 特定 WebView 配置） |
| H2 | 任意文件读写：Content Provider / 深链接路径遍历、符号链接攻击（未到代码执行） |
| H3 | WebView XSS / UXSS 打会话、越权访问他人账户 / 数据、组件导出认证绕过（须实际加载任意 URL / 进入认证后界面；仅入口面 / 打开官方登录页 → INV26） |
| H4 | 可接管级凭据泄露（硬编码 API key / token 直接接管） |
| H5 | MITM 窃取会话（证书验证缺失 / 固定绕过） |
| H6 | 认证 / 授权绕过（2FA / OTP 可暴力、账户覆盖、认证链缺陷） |
| H7 | 存储型 / 持久的 WebView XSS 打他人（self-XSS 被排除） |
| H8 | 破坏性远程 DoS：远程触发且需恢复出厂、永久删除用户 / Profile、无交互卸载 App、或干扰紧急呼叫。本地杀进程 / 纯崩溃走 INV1 |
| H9 | 权限绕过与保留：绕过系统 / signature / dangerous 权限取得敏感数据；Special App Access 未授权获取；一次过 / 使用时（WIU）权限跨进程死亡或重启后保留；后台非法启动 FGS 取得 WIU 权限 |
| H10 | UI 覆盖 / 点按劫持 / `FLAG_SECURE` 绕过：能捕获凭据或安全确认 |
| H11 | 跨用户 / Private Space 越界：跨用户读他人敏感数据；未用指定锁定因子解锁 Private Space |

### 中危（→ medium）

| # | 判定条件 |
| --- | ---------- |
| M1 | 有限信息泄露（低敏元数据、内部路径 / 堆栈） |
| M2 | 邻近网络下可读低敏流量（无令牌 / 凭据） |
| M3 | 不安全数据存储（本地未提权）：SharedPreferences / NSUserDefaults / 明文 SQLite |
| M4 | 广播劫持 / 隐式广播泄露低敏数据 |
| M5 | 需多前提的越权（需管理员误配置 + 特定交互） |
| M6 | 影响有限的会话 / 令牌缺陷 |
| M7 | 深链接 CSRF 的有限实害 |
| M8 | UI 覆盖 / 隐私指示器隐藏，无可演示的凭据捕获或跨用户越界 |
| M9 | 有限权限面：Special App Access 未授权获取 / 阻止撤销但未取得敏感数据；未授权移除企业 DPC |

### 低危（P4 → low）

| # | 判定条件 |
| --- | ---------- |
| L1 | 需受害者高度配合的低敏越权 |
| L2 | 自身账号内轻微安全含义的配置缺陷 |
| L3 | 轻微安全含义的 UI / 逻辑缺陷 |

---

## 4. 级别调整（命中即下调或不合格）

| # | 条款 | 对本模块含义 |
| --- | ------ | -------------- |
| ADJ1 | 需已越狱 / root 设备 | 降档（本地读取类通常不报） |
| ADJ2 | 仅非最新支持版本可复现 | 降档或排除 |
| ADJ3 | 受害者高度配合的交互链 | 降一档 |
| ADJ4 | 仅理论影响未演示 | L / 不报。入口面本身（exported / 自定义 scheme / 不校验调用方）走 INV26，不要写成 L |
| ADJ5 | 仅本地 OS 管理员 / 已控设备可达 | 不在威胁模型 |
| ADJ6 | 泄露仅为低敏元数据 | M1 / L |
| ADJ7 | 仅影响自己账号 / 自伤 | 不报 |
| ADJ9 | 利用链上的单环 | 看整链定档 |
| ADJ11 | WebView 历史缺陷（`addJavascriptInterface` 旧版族） | 平台已全局修复 → 降档或排除 |
| ADJ12 | 项目奖金规则缺项（如内存破坏缺补丁方案、占坑 shell 报告、违规披露） | **不改 `severity`**，只把 `bounty_eligible` 置 `false` |

## 5. 排除（命中即停）

| # | 条款 |
| --- | --- |
| INV1 | **本地 DoS 不报**：同设备杀进程 / 本地纯崩溃 / 本地资源耗尽 / crash-only。**不含远程。** 破坏性远程 DoS 按 H8 |
| INV2/3/4 | 缺限速（无实害）/ 缺安全头 / 版本披露 |
| INV7 | self-XSS / POST 反射 XSS |
| INV8 | 社工 / 物理攻击 / 需物理设备访问 |
| INV11 | 依赖清单无 PoC |
| INV12/13 | 静态分析原始输出 / 理论问题 |
| INV26 | **入口面本身不定漏洞**：exported launcher / MainActivity、自定义 scheme、不校验调用方是平台固有入口面，不是漏洞。须证明未授权敏感 sink（深链直接特权操作、URI/extra 当可信输入、OAuth 一次性码可截获、带登录态加载攻击者 URL）。仅唤起 / 打开默认页 / 官方登录 Custom Tab / 参数白名单 + 登录门控 → `reportable: false`。不要写成 M/L |
| INV15 | 已越狱 / root 后才能观察到的本地读取 |
| INV16 | 非 release / debug 构建、模拟器专用行为 |
| INV17 | 环境依赖（特定设备 / ROM / 系统版本行为） |
| INV19 | 系统层缺陷（走 `vuln-definitions-oh`）投到应用层 |
| INV22 | 非官方渠道（侧载 / 越狱商店）版本才可复现 |
| INV23–25 | Google 与 Google 设备项目范围除外（上游通用 Linux 无 Android/Pixel PoC、后端服务、设备 90 天内到 EOL） |

完整 ADJ/INV 表见 `vuln-definitions-mobile` 的 `adjustment-and-invalid.md`。

---

## 6. 移动端类型与攻击面（摘要）

完整定义见 `vuln-definitions-mobile` 的 **`mobile-vuln-types.md`**。组件索引见 `attack-surfaces.md`。

### Android

| 类型簇 | 形态 | 条款倾向 |
| -------- | ------ | ---------- |
| Deep Link | 路径遍历→文件写 / RCE、验证绕过→WebView、会话劫持、CSRF | C1 / C2 / H2 / H3 |
| WebView | `addJavascriptInterface` RCE、XSS / UXSS、JS bridge、Cookie 泄露 | C1 / H3 |
| Intent | Redirection、劫持、重放、URI 注入、Scheme 认证绕过 | H |
| 组件导出 | Activity 认证绕过、Service 越权、Provider 导出 | H |
| Content Provider | 信息泄露、SQL 注入、路径遍历、权限重委托 | H3 / H2 |
| 广播 | 广播劫持、隐式广播泄露、导出 Receiver | M / H |
| 文件路径 | 路径遍历、符号链接、目录遍历 RCE、任意上传 | C1 / H2 |
| 认证逻辑 | 2FA / OTP 绕过、短信重发缺陷、账户覆盖、令牌泄露 | H |
| 数据存储密钥 | 明文存储、硬编码密钥、SSL 配置、日志泄露 | M3 / H4 |
| 任务窗口 | StrandHogg、Fragment 注入、Confused Deputy、UI 覆盖 / 点按劫持、`FLAG_SECURE` 绕过 | H（按版本）/ H10 / M8 |
| 权限与访问控制 | 权限绕过 / WIU 保留、Special App Access、跨用户与 Private Space、企业 DPC 绕过、破坏性远程 DoS（H8） | H8–H11 / M9 |
| 内存安全 | UAF / 堆溢出 / 越界读（JNI / 原生库） | C4 / H1 |

### iOS

| 类型簇 | 形态 | 条款倾向 |
| -------- | ------ | ---------- |
| URL Scheme / Deep Link | 劫持（授权码 / 令牌）、不当授权、CSRF、信息泄露、应用内 XSS | C2 / H |
| OAuth 流程 | 令牌伪造（callback 缺陷）、redirection URI 劫持 | H |
| SSL/TLS 证书 | 验证缺失 / 绕过 / 固定绕过 / 任意重定向 | H5 |
| 数据存储隐私 | 明文存储、Keychain 误用、信息泄露 / 隐私侵犯 | M3 / H4 |
| WebView | XSS、Stored XSS、信息泄露（深链接） | H |
| 内存内核 | 内存破坏 / UAF / 内核损坏（偏系统层） | C / 系统层 |
| 其他 | 不当认证、CARA、路径遍历、私有 API 滥用 | H / M |

**归类纪律**：深链接 / URL Scheme 默认 `remote_link` 前提；WebView 优先 RCE；本地存储默认 M、含接管凭据才 H；系统层剥离到 `vuln-definitions-oh`。**入口面本身（INV26 / K8）不定档、不报。**

> 目标项目为 **Google Bug Hunters 的 Android 与 Google 设备项目** 时：范围与资格（Pixel / Nest / Fitbit、90 天 EOL、AOSP/TEE/bootloader/固件、在范围内影响类别映射、PoC 与补丁要求、奖金与 SNR 纪律、兜底读规则页）见 `vuln-definitions-mobile` 的 **`google-android-devices-rules.md`**（不定级）。系统层目标仍在范围内，只是档位来源换 `vuln-definitions-oh`。

---

## 7. 报告与定级纪律

- 定级前先跑 Gate：**威胁模型 → 资产范围 → 环境合格 → 安全实害 → 可复现**（完整见 `gates.md`）
- `severity_rule` 填本文件锚点，如 `mobile.md#H2`、`mobile.md#INV7`（完整插件亦可用 `severity-levels.md#H2`）。另填 `mobile_class`、`platform`、`component`、`attacker`、`prereq`；可选 `bounty_eligible`（见 `shared/finding-schema.md`）
- 与 CVSS：本文件定性；量化用 `vuln-scoring`（默认 v3.1）。CVSS **不得**单独抬档
- **边界情况对照 `vuln-definitions-mobile` 的 `history-patterns.md` §3 定级校准**（K1–K8：深链接→WebView 按 H3、URL Scheme 按远程前提、WebView 旧版 RCE 按版本、SSL 缺失按 MITM、明文存储默认 M、越狱前提降档、StrandHogg 按版本、入口面本身按 INV26 不报）
- **不收录具体 case**：无 CVE / 报告清单
