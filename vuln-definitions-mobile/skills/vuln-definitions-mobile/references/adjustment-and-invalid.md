# 级别调整（ADJ）与排除条款（INV）

命中 ADJ → 降档或改非安全；命中 INV → **直接不报**（`reportable: false`）。条款来自 HackerOne 移动端赏金项目公开惯例 + OWASP 移动安全，移动端领域通用条款保留抽象形态。目标项目页有明文的排除项时，以项目页为准并写进 `rationale`。

---

## 1. 级别调整（ADJ，命中即下调）

| # | 条款 | 对本模块含义 |
| --- | ------ | -------------- |
| ADJ1 | 需已越狱 / root 设备 | 降档（本地读取类通常不报；需已 root 才能读的本地存储不构成漏洞） |
| ADJ2 | 仅非最新支持版本可复现 | 降档或排除（INV7）；须在目标项目支持的最新版本确认 |
| ADJ3 | 需受害者高度配合的交互链 | 降一档（如多步深链接诱导、需登录态） |
| ADJ4 | 仅理论影响未演示 | 降到 L / 不报（理论问题被排除） |
| ADJ5 | 仅本地 OS 管理员 / 已控设备可达 | 不在威胁模型，不报 |
| ADJ6 | 泄露仅为低敏元数据 | 降到 M1 / L |
| ADJ7 | 仅影响自己账号 / 自伤 | 不报 |
| ADJ8 | 利用链上的单环 | 定档看整链，不要每环都标 C 档 |
| ADJ9 | 野外利用 / 已公开 | 只提优先级，不改档 |
| ADJ10 | 影响仅限排除目标（官方测试域、非发货构建等） | 不报 |
| ADJ11 | WebView 历史缺陷（`addJavascriptInterface` 旧版族） | 平台已全局修复 / 默认配置不可达 → 降档或排除；须证明目标当前版本仍暴露 |
| ADJ12 | 目标项目奖金规则缺项（如内存破坏缺补丁方案、占坑 shell 报告、违规披露） | **不改 `severity`**，只把 `bounty_eligible` 置 `false`（见 `google-android-devices-rules.md` §5/§9） |

---

## 2. 排除条款（INV，命中即停）

### 通用排除（移动端赏金惯例）

| # | 条款 |
| --- | --- |
| INV1 | **全部 DoS 不报**（无例外）：远程 / 本地 / 邻近；DDoS；资源耗尽；纯崩溃；crash-only 内存破坏；同设备恶意 App 拉导出组件 / `startForegroundService` 超时杀进程等**本地 DoS**；需恢复出厂、永久删除用户 / Profile、无交互卸载 App、干扰紧急呼叫的**破坏性远程 DoS**（原 H8 / AP4，已废止，不再可报） |
| INV2 | 缺限速且无具体安全实害 |
| INV3 | 缺安全头（CSP / X-Frame-Options / cookie flag 等）且无利用展示 |
| INV4 | 版本披露 / 软件指纹（`App-Version` 头、版本号泄露） |
| INV5 | EXIF 地理位置 |
| INV6 | 邮件安全记录缺失（SPF / DKIM / DMARC） |
| INV7 | self-XSS / POST 反射 XSS（无跨用户实害） |
| INV8 | 社工 / 物理攻击 / 需物理设备访问 |
| INV9 | 支付处理（三方处理方职责） |
| INV10 | 第三方系统（目标员工在用的非目标资产） |
| INV11 | 依赖清单（过时依赖列表）；除非有 PoC 证明在目标 App 实现下严重且可利用 |
| INV12 | 静态分析器原始输出，无人工验证 / PoC |
| INV13 | 理论安全问题 |
| INV14 | 已发表 / 他人已报（重复） |

### 移动端领域排除（官方焦点外的杂音）

| # | 条款 |
| --- | ------ |
| INV15 | 已越狱 / root 后才能观察到的本地读取、内存分析、文件系统访问 |
| INV16 | 非 release / debug 构建、带 `android:debuggable` 的测试包、模拟器专用行为 |
| INV17 | 环境依赖问题（特定设备型号、特定系统版本行为、特定厂商 ROM） |
| INV18 | 第三方 SDK 在出货路径不可达 / 目标项目不覆盖 SDK 缺陷 |
| INV19 | 系统层缺陷（走 `vuln-definitions-oh`）被投到应用层 |
| INV20 | 对真实用户数据 / 账户的破坏性验证 |
| INV21 | 需要用户先安装恶意 App（若恶意 App 前提本身超范围） |
| INV22 | 非官方渠道（侧载 / 越狱商店）版本才可复现 |

### 目标项目范围排除（Google 与 Google 设备项目口径）

> 仅当目标项目为 Google Bug Hunters 的 Android 与 Google 设备项目时适用；条款口径见 `google-android-devices-rules.md`。命中即 `reportable: false`。

| # | 条款 |
| --- | --- |
| INV23 | 上游 Linux 内核 / 通用 Linux 组件缺陷，未给出在 Android 或 Pixel 维护模块上直接可利用的功能性 PoC |
| INV24 | Google 后端 / 服务端（基础设施、后端 API、与设备交互的服务端服务）——走 Google and Alphabet VRP |
| INV25 | 设备将在 90 天内到达保证安全更新窗口结束（资格判定同此，`bounty_eligible: false`） |

> 注：INV 编号如有冲突，以「排除语义」为准；写 finding 否决理由时引用条款文字。

---

## 3. 常见误判纠正

| 误判 | 纠正 |
| ------ | ------ |
| 「WebView 可加载任意 URL = critical」 | 无会话 / 无 UXSS 实害时按 H3 / M；只有能打会话、读本地文件或 JS bridge 反射才抬档 |
| 「深链接路径遍历 = critical」 | 写 `.so` / 覆盖代码文件才 C1；仅写非执行文件 → H1/H2 |
| 「URL Scheme 劫持 = critical」 | 需用户点击（远程诱导）时按「远程」列；能偷授权码换完整账户才 C2 |
| 「证书验证缺失 = critical」 | MITM 前提，窃取可接管级会话才 H5；无实际可窃取数据 → M2 或排除 |
| 「不安全数据存储 = high」 | 本地未提权访问，默认 M3；只有含可接管级凭据（API key / token 直接接管）才 H4 |
| 「StrandHogg / Task Hijacking = high」 | 历史型漏洞，多数大厂已修；须确认目标最新版本仍受影响（K7），否则排除 |
| 「addJavascriptInterface RCE = critical」 | 平台已修复旧版；须证明目标当前版本 + 当前 WebView 配置仍可达（K3），否则 ADJ11 |
| 「导出 Activity = critical」 | 只有能越权进入认证后界面 / 触发高权限操作才 H6；纯可启动无敏感面 → M/L |
| 「破坏性远程 DoS / 本地杀进程还能报」 | **不能。** INV1 覆盖全部可用性攻击，含本地 App 崩溃与原 H8；同一入口若另有机密性 / 完整性实害（越权 API、会话、文件读写），按那条实害定档，**不得**用崩溃撑档或当独立 finding |
| 「Tapjacking / 覆盖界面 = low」 | 能覆盖敏感界面并捕获凭据或安全确认 → H10；无可演示捕获才 M8 |
| 「能截屏 / `FLAG_SECURE` 失效 = 无危害」 | 敏感界面可截屏且内容可外流 → H10；仅演示截屏无外流 → M8 |
| 「拿不到系统权限就不算提权」 | WIU / 一次性权限跨进程死亡或重启保留、Special App Access 未授权取得均算：取得敏感数据 → H9，有限面 → M9 |
| 「系统层缺陷没处报」 | INV19 只管 **档位来源**；Google 设备项目里系统层目标在范围内，定级走 `vuln-definitions-oh`（`google-android-devices-rules.md` §10） |
