# 术语与威胁模型（terminology.md）

本文件定义移动端定级所需的**攻击者位置**、**平台边界**、**组件语义**与**前提术语**。先读懂这里再走形态与条款，避免把不同前提的缺陷混为一档。

---

## 1. 攻击者位置（`attacker` 字段）

| 值 | 含义 | 能力边界 | 典型可达形态 |
|----|------|----------|--------------|
| `remote_link` | 远程：攻击者控制网页 / 深链接，**诱导用户点击**后触发 | 无设备访问；需用户交互 | Deep Link、WebView、URL Scheme、CSRF、Intent scheme |
| `malicious_app` | 恶意 App：同设备已安装的恶意应用主动发起 | 同机应用进程；无用户点击；受平台沙箱约束 | Intent 劫持、组件导出、广播、Content Provider、Task Hijacking |
| `nearby_mitm` | 邻近网络：WiFi / 网关 / 网络路径中间人 | 控制网络路径；不能改设备 | SSL/TLS 证书验证缺失、固定绕过、任意重定向 |
| `local_rooted` | 本地已越狱 / root：设备已被攻击者完全控制 | 可读任何本地数据、可 hook | 本地存储读取、内存分析——**通常是降档前提（ADJ1），不是默认前提** |

**纪律**：
- 深链接 / URL Scheme / WebView 类 **默认 `remote_link`**；CSRF 若由同机 App 触发则 `malicious_app`
- `local_rooted` 不是漏洞的前提：默认用户设备**未越狱**
- 「同一缺陷，不同攻击者位置 → 不同档位」是移动端定级的首要规则

---

## 2. 平台边界（platform 语义）

| 边界 | Android | iOS | 说明 |
|------|---------|-----|------|
| 应用沙箱 | per-UID + SELinux；私有目录 `/data/data/<pkg>`、`/data/user/<uid>/` | 应用容器；`Library/`、`Documents/`、`tmp/` | 越出沙箱读写 = 漏洞；同 UID / 同组共享不算 |
| WebView 进程 | 独立渲染进程（多进程 WebView）；JS ↔ Java 经 `addJavascriptInterface` | WKWebView 独立进程；UIWebView（已废弃）同进程 | JS 侧能力边界决定 RCE / XSS 语义 |
| IPC | Binder / AIDL；Intent（显式 / 隐式） | XPC / URL Scheme / App Groups | 组件间通信是攻击入口 |
| 系统服务 | System Server / Binder 服务 | SpringBoard / 守护进程 | **系统层缺陷走 `vuln-definitions-oh`** |
| 应用商店渠道 | Play / 侧载 APK | App Store / 企业分发 | 侧载 / 非官方渠道前提按 ADJ |

**应用层 vs 系统层**：
- 应用层（本插件）：App 内逻辑、WebView、Deep Link、组件、本地存储、网络栈
- 系统层（`vuln-definitions-oh`）：内核、系统服务、框架、驱动
- 一条链同时涉及两者时：**应用层缺陷** 由本插件定，链到系统层抬档须证明且写清前提

---

## 3. Android 组件语义

| 组件 | 语义 | 攻击面 |
|------|------|--------|
| **显式 Intent** | 指定 `component`，仅本 App 或指定目标可达 | 组件间数据传递污染 |
| **隐式 Intent** | 只声明 action / data，系统匹配目标 | 可被恶意 App 拦截（Intent 劫持） |
| **exported 组件** | `android:exported="true"` 或含 intent-filter，外部可达 | 未授权启动 / 认证绕过。**入口面本身不是漏洞**（INV26）；须证明未授权敏感 sink（进入认证后界面 / 任意 URL / 凭据或越权操作） |
| **Deep Link** | App Links（`https` + verify）与 intent scheme（`<scheme>://`） | 路径遍历、参数注入、WebView 加载 |
| **Content Provider** | `content://` 数据共享，可声明权限 | 信息泄露、SQL 注入、路径遍历、权限重委托 |
| **Broadcast** | 全局 / 显式 / 粘性广播 | 广播劫持、未受保护隐式广播 |
| **Fragment** | 动态加载的 UI 单元 | Fragment Injection（类名未校验） |
| **Task** | 返回栈 / 任务栈 | Task Hijacking / StrandHogg |

**exported 判定**：`android:exported` 显式值优先；否则含 intent-filter 的组件默认对系统（部分版本）可导出——以目标 SDK 版本行为为准。导出是入口条件，不是实害。

## 4. iOS 组件语义

| 组件 | 语义 | 攻击面 |
|------|------|--------|
| **URL Scheme** | `CFBundleURLTypes` 注册的自定义 scheme，任意 App / Safari 可唤起 | 劫持、不当授权、CSRF、信息泄露。**仅唤起 / 打开默认页、无未授权敏感 sink → INV26** |
| **Universal Links** | `https://` + associated domains，系统校验 entitlement | 校验绕过 → 同 URL Scheme 形态 |
| **AppDelegate / SceneDelegate** | `application:openURL:options:` / `scene(_:openURLContexts:)` | URL 处理来源验证 |
| **ASWebAuthenticationSession** | OAuth 浏览器回调会话 | Redirection URI 劫持、state 验证 |
| **WKWebView / UIWebView** | 应用内 Web 渲染 | XSS、Stored XSS、任意 URL 加载 |
| **Keychain** | `kSecClass*` 加密存储 | `kSecAttrAccessible` 误用、同组共享 |

## 5. WebView 语义（两平台通用）

| 术语 | 含义 | 安全含义 |
|------|------|----------|
| JS 启用 | `setJavaScriptEnabled(true)` | XSS 可执行 |
| JS bridge | `addJavascriptInterface`（Android）/ JSContext 注入（iOS） | JS → 原生代码面；反射可达 = RCE 原语 |
| 任意 URL 加载 | `loadUrl` / `loadRequest` 输入未校验 | UXSS / 钓鱼 / 本地文件加载 |
| file:// 访问 | WebView 加载本地文件 | 越权读应用私有文件 |
| Cookie 边界 | WebView cookie 与 App 会话隔离 | CookieStore 泄露、跨 WebView 会话污染 |

**判定**：JS 未启用时，XSS 类缺陷**不成立**（无执行语义），最多算反射内容注入（M/L 或排除）。

## 6. 前提术语（`prereq` 字段）

| 值 | 含义 | 档位影响 |
|----|------|----------|
| `none` | 无额外前提 | 按矩阵最高档 |
| `user_click` | 需用户点击深链接 / URL（远程默认） | 已计入「远程」列 |
| `non_latest_version` | 仅非最新支持版本可复现 | ADJ 降档或排除（INV） |
| `rooted` / `jailbroken` | 需已越狱设备 | ADJ1 降档 |
| `specific_config` | 需特定配置（如 WebView 选项、debug 构建） | ADJ 降档 |
| `multi_step` | 需受害者多步交互 | ADJ3 降档 |

## 7. 数据语义（敏感 vs 低敏）

| 级别 | 数据 | 泄露档位倾向 |
|------|------|--------------|
| 可接管级 | 可接管账户 / 服务的凭据（OAuth token、session、API key、私钥） | H4 / H5 / C2 |
| 敏感 | PII、聊天记录、支付信息、私人文件 | H3（越权）/ M3（本地存储） |
| 低敏 | 设备型号、版本号、非敏感元数据、公共配置 | M1 / 排除 |

**判定**：先问「泄露后能否直接接管或越权」，能 → 可接管级；不能 → 敏感或低敏。含可接管级凭据的本地存储 = H4，不是 M3。
