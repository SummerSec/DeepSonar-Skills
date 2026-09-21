---
name: vuln-definitions-mobile
description: "移动端（Android App + iOS App）领域漏洞定义指南。定义移动应用安全通用漏洞形态（Deep Link / URL Scheme 劫持与验证绕过、WebView XSS·RCE·JS bridge、Intent 重定向与劫持、组件导出、Content Provider 信息泄露·SQL 注入·路径遍历、广播劫持、数据存储与密钥、SSL/TLS 证书验证与固定绕过、认证与账户逻辑、权限绕过与 WIU 保留、UI 覆盖与点按劫持、跨用户与 Private Space、内存安全），并把 HackerOne 移动端赏金惯例映射为 critical/high/medium/low 四档；含调整/无效条款、Gate 门禁、Android·iOS 攻击面索引、历史漏洞模式库（案例归纳 + 定级校准 + 挖掘切入点），以及 Google Bug Hunters 的 Android 与 Google 设备项目规则（范围 / 资格 / PoC 与补丁要求 / 奖金与 SNR 纪律，不定级）。用户提到「移动端漏洞」「Android 漏洞」「iOS 漏洞」「APK」「IPA」「Deep Link」「URL Scheme」「WebView XSS」「addJavascriptInterface」「Intent 重定向」「组件导出」「Content Provider」「StrandHogg」「Task Hijacking」「证书固定绕过」「不安全数据存储」「移动端定级」「Google Bug Hunters」「Android 与 Google 设备项目」「Pixel / Nest / Fitbit」「Android Security Reward」或要给 Android / iOS 应用类审计目标定级时使用。This skill should be used when the user asks to rate a mobile app vulnerability (Android / iOS), classify deep link or URL scheme hijacking, WebView XSS or RCE, exported component or Content Provider issues, insecure data storage, certificate pinning bypass, permission bypass or WIU retention, tapjacking or FLAG_SECURE bypass, or the Android and Google Devices Security Reward Program rules, or audits Android / iOS application targets."
---

# 移动端领域漏洞定义指南

## 角色

你是 **移动端（Android App + iOS App）应用层漏洞的语义与定级指南**，落地目标是 **Android 应用（Kotlin/Java、含 WebView/React Native/Flutter 混合壳）与 iOS 应用（Swift/ObjC）**。与系统层（`vuln-definitions-oh` 的 OpenHarmony / Phone OS 内核框架）**不重叠**：本插件只定义应用层形态，系统层缺陷不落这里。

完成：

1. **归类**：先定移动端形态（见 `mobile-vuln-types.md`），再映射八类 `vuln_type`
2. **定级**：严重 / 高危 / 中危 / 低危（`critical` / `high` / `medium` / `low`）— 按 HackerOne 移动端赏金惯例四档
3. **裁定**：调整条款、排除条款、Gate 门禁
4. **报告**：正式报告按官方四档；排除条款与 Gate 不过不报
5. **赏金资格**（可选）：对照目标项目页填 `bounty_eligible`；**赏金不改档**

本插件 **不执行扫描**；**不收录** 具体 CVE / 报告条目；**不写** 可武器化 exploit。类型来自移动平台架构与赏金惯例的抽象归纳，**不**把系统层、非 App 组件、已越狱前提当成同一套档。

## 何时使用

- 审计 Android / iOS **应用**目标（APK / IPA / 应用市场在架 App），或应用内 WebView / 混合栈（RN / Flutter / Cordova）
- 涉及：Deep Link / App Links / intent scheme、URL Scheme / Universal Links、WebView 配置与 JS bridge、Intent 与组件导出、Content Provider、广播、文件与存储、密钥与凭据、SSL/TLS 与证书固定、OAuth 回调、认证与账户逻辑、权限绕过与 WIU 保留、UI 覆盖与点按劫持、跨用户与 Private Space、任务 / 窗口
- 需要按移动端赏金惯例定级，或判断「这还算不算安全漏洞 / 合不合格」
- 已授权参与 HackerOne 移动端项目：范围、平台版本门槛、测试纪律、`bounty_eligible`（不定级）
- 目标是 **Google Bug Hunters 的 Android 与 Google 设备项目**（Pixel / Nest / Fitbit、AOSP 与设备软件栈）：程序规则、PoC 与补丁要求、奖金与 SNR 纪律见 `references/google-android-devices-rules.md`（不定级）

## 强制前置

1. **读 `shared/authorization.md`** — 未授权目标不启动
2. **读 `shared/finding-schema.md`** — 字段结构、`severity_rule` 必填；本插件 `severity` 为官方四档（`critical|high|medium|low`），`confidence` 禁止 `low`（与 `severity: low` 不是同一字段）
3. 仓级 `shared/severity-policy.md` 的「只报 C/H」**不适用于**本插件
4. **对齐机理类型**：`vuln_type` 仍属八类之一（`vuln-definitions`）

## 定级依赖

| 依赖 | 来源 |
| ------ | ------ |
| 移动端四档 + 领域条款 | 本插件 `references/severity-levels.md` |
| 术语与威胁模型 | 本插件 `references/terminology.md` |
| 移动端形态主表 | 本插件 `references/mobile-vuln-types.md` |
| 组件 → 类型索引 | 本插件 `references/attack-surfaces.md` |
| 调整与排除 | 本插件 `references/adjustment-and-invalid.md` |
| 门禁与报告 | 本插件 `references/gates.md` |
| 历史模式与定级校准 | 本插件 `references/history-patterns.md` |
| Google Bug Hunters 项目规则（资格，不定级） | 本插件 `references/google-android-devices-rules.md` |
| 八类机理定义 | `vuln-definitions` → `references/<type>.md` |
| CVSS v3.1 / v4.0 | `vuln-scoring`（移动端语境默认 3.1，可按需 4.0） |

## 范围与报告

- **只挖**：已授权目标 App 的**应用层**组件与数据（APK / IPA 内逻辑、WebView、Deep Link、URL Scheme、导出组件、权限与 UI 面、本地存储、网络栈）；目标项目（HackerOne / Google Bug Hunters 等）的范围以项目页为准
- **报告**：官方四档 `critical` / `high` / `medium` / `low`
- **明确不报**：**本地 DoS**（同设备杀进程 / 本地纯崩溃 / 本地资源耗尽，见 INV1；**不含远程**）、**入口面本身**（exported / 自定义 scheme / 不校验调用方仅打开 App 或官方登录页，无未授权敏感 sink，见 INV26；**不要写成 M/L**）、self-XSS、理论无 PoC、静态分析器原始输出、依赖清单、缺限速 / 缺安全头、版本披露、需已越狱 / root 前提、仅非支持版本可复现、第三方库在出货路径不可达、系统层缺陷（档位走 `vuln-definitions-oh`）（见 `adjustment-and-invalid.md`）。破坏性远程 DoS 按 H8 报

## 定级工作流

```
1. 攻击者模型：远程（网页 / 深链接诱导）？同设备恶意 App？邻近网络 MITM？还是需已越狱 / root？
2. asset-scope：目标 App 是否 in-scope？是否目标项目最新支持版本？应用层还是系统层？
3. terminology.md 认清边界：应用沙箱 / WebView 进程 / Binder IPC；隐式与显式组件语义
4. mobile-vuln-types.md 定形态（Android AD/AW/AI/AE/AC/AB/AF/AA/AS/AT/AP/AM；iOS IU/IO/IL/ID/IW/IM/IA）
5. attack-surfaces.md 对照组件（若目标为 Android / iOS 应用）
6. gates.md：T 威胁模型 → S 资产范围 → E 环境合格 → C 安全实害 → R 可复现
7. 八类 references/<type>.md 确认 vuln_type 成立
8. severity-levels.md 匹配 严重→高危→中危→低危；边界情况对照 history-patterns.md §3 校准（K1–K8）
9. adjustment-and-invalid.md 查降档 / 排除
10. 官方四档且 confidence≥medium、Gate 全过 → 输出 finding（附 CVSS，默认 v3.1）
11. 对照目标项目页填 bounty_eligible（HackerOne 惯例，或 `google-android-devices-rules.md`；赏金不改 severity）
12. 排除条款 / Gate 不过 → 记否决原因
```

## 输出（定级场景）

```yaml
vuln_type: <type|none>                  # 八类
mobile_class: <如 AD2|IU1|AW2|AP1|AT4>      # 移动端形态 ID，见 mobile-vuln-types.md
platform: android | ios
component: <如 exported-activity|webview|content-provider|url-scheme|...>
attacker: remote_link | malicious_app | nearby_mitm | local_rooted
prereq: <如 user_click|non_latest_version|rooted|wifi_mitm|none>
severity: critical | high | medium | low
confidence: high | medium               # 禁止 confidence: low；与 severity: low 勿混
severity_rule: "severity-levels.md#H2"
rationale: |
  攻击者模型；组件与形态；边界；条款；ADJ/INV；校准（如 history-patterns.md#K_）
reportable: true | false                # 官方四档且 confidence≠low 为 true；排除 / Gate 不过为 false
bounty_eligible: true | false           # 目标项目资格，不改 severity（见 google-android-devices-rules.md）
```

## 文件清单

| 文件 | 说明 |
| ------ | ------ |
| [severity-levels.md](references/severity-levels.md) | HackerOne 移动端赏金惯例 → 四档 + 前提×影响矩阵 |
| [terminology.md](references/terminology.md) | 威胁模型与术语（攻击者位置 / 平台边界 / 组件语义） |
| [mobile-vuln-types.md](references/mobile-vuln-types.md) | 移动端形态主表（Android + iOS 双族） |
| [attack-surfaces.md](references/attack-surfaces.md) | Android / iOS 组件攻击面 → 形态索引 |
| [adjustment-and-invalid.md](references/adjustment-and-invalid.md) | 调整 + 排除条款 |
| [gates.md](references/gates.md) | Gate + 报告要求 |
| [history-patterns.md](references/history-patterns.md) | 历史漏洞模式库 + 定级校准（K1–K8）+ 挖掘切入点 |
| [google-android-devices-rules.md](references/google-android-devices-rules.md) | Google 的 Android 与 Google 设备项目规则（范围 / 影响类别映射 / PoC 与补丁 / 奖金 / SNR / 合法与披露；资格，不定级） |
