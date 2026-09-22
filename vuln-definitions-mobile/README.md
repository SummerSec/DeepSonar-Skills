# 移动端领域漏洞定义指南（vuln-definitions-mobile）

独立 plugin：面向 **Android App 与 iOS App 应用层** 的定级语义源。
定义移动应用通用漏洞形态（Android：Deep Link / WebView / Intent / 组件导出 / Content Provider / 广播 / 文件路径 / 认证逻辑 / 数据存储密钥 / 任务窗口 / 内存安全；iOS：URL Scheme / OAuth 流程 / SSL-TLS 证书 / 数据存储隐私 / WebView / 内存内核 / 其他），并把 **HackerOne 移动端赏金惯例** 映射为四档；收录历史漏洞模式库（来自 [s7safe/android-h1](https://github.com/s7safe/android-h1) 的 android.md / IOS.md 案例归纳）。

**领域化原则**：新移动端目标（某 App / SDK / 移动端框架）进本领域时 **只加厂商 reference 文件**，不开新 plugin。已收录的厂商 / 项目规则：Google Bug Hunters 的 Android 与 Google 设备项目（`google-android-devices-rules.md`，资格，不定级）。

**不是** `wb-*`/`bb-*` 的 Web 应用八类细则；**不是** 浏览器 / 数据库 / 移动 OS 系统层领域定级（系统层走 `vuln-definitions-oh`）。

## 安装

```text
/plugin install vuln-definitions-mobile@DeepSonar-Skills
```

## 内容

| 文件 | 说明 |
| ------ | ------ |
| `SKILL.md` | 入口：角色、工作流、输出 |
| `references/severity-levels.md` | HackerOne 移动端赏金惯例 → 四档 + 前提×影响矩阵 |
| `references/terminology.md` | 威胁模型：恶意 App / 远程网页 / 邻近网络 / 已越狱；组件语义 |
| `references/mobile-vuln-types.md` | 移动端形态主表（Android AD/AW/AI/AE/AC/AB/AF/AA/AS/AT/AM + iOS IU/IO/IL/ID/IW/IM/IA） |
| `references/attack-surfaces.md` | Android / iOS 组件攻击面 → 形态索引 |
| `references/adjustment-and-invalid.md` | 调整条款 + 排除条款 |
| `references/gates.md` | Gate T/S/E/C/R + HackerOne 报告要求 |
| `references/history-patterns.md` | 历史漏洞模式库（android.md / IOS.md 案例归纳）+ 定级校准 + 挖掘切入点 |
| `references/google-android-devices-rules.md` | Google 的 Android 与 Google 设备项目规则：范围 / 影响类别映射 / PoC 与补丁要求 / 奖金结构 / 重复判定 / SNR 与披露纪律（**资格，不定级**） |

## 规则

- **官方四档均可报**：正式报告含 `critical`/`high`/`medium`/`low`；排除条款与 Gate 不过不报
- **无效即停**：**本地 DoS**（含本地杀进程 / 本地纯崩溃 / 本地资源耗尽，INV1；**不含远程**）、**入口面本身**（exported / 自定义 scheme / 不校验调用方仅打开 App，无未授权敏感 sink，INV26）、self-XSS、理论问题、无 PoC 的静态分析、依赖清单、缺限速 / 缺安全头 → `reportable: false`（不要写成低危 / 中危）。破坏性远程 DoS 按 H8 报
- **定性定量分离**：本插件定性；CVSS（默认 v3.1，可按需 v4.0）由 `vuln-scoring` 负责
- **前提改变档位**：未认证远程 / 恶意 App / 邻近网络 MITM / 需用户点击 / 已越狱——同一缺陷前提不同档位不同
- **平台版本门槛**：非最新支持版本上才可复现的 WebView 历史 RCE（如 `addJavascriptInterface` 旧版缺陷）须按 ADJ 降档；`critical` 要求主路径可稳定控制
- **不收录具体 case**：无 CVE、无报告清单；类型来自移动平台架构与赏金惯例的抽象归纳
- **赏金 ≠ 定级**：`bounty_eligible` 只回答能不能按目标项目的 HackerOne 赏金拿；金额以项目页为准，不抬 / 压 `severity`
- **厂商项目规则不改档**：目标项目为 Google Bug Hunters 的 Android 与 Google 设备项目时，范围 / PoC 与补丁要求 / 奖金 / SNR 纪律见 `google-android-devices-rules.md`，只写 `bounty_eligible`

## 与 vuln-definitions 的关系

- **机理**（injection/rce/ssrf/authz/…）→ `vuln-definitions`（八类）
- **移动端四档 + 形态** → 本插件（精简镜像为 `vuln-definitions/references/mobile.md`）

## 语义基线

- 案例知识库：[s7safe/android-h1](https://github.com/s7safe/android-h1) 的 [android.md](https://github.com/s7safe/android-h1/blob/main/android.md) 与 [IOS.md](https://github.com/s7safe/android-h1/blob/main/IOS.md)（100+ 份 HackerOne 公开报告归纳，对照日 2026-08-30）
- 定级口径：HackerOne 移动端赏金项目惯例 + [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- 项目规则（资格口径，不定级，对照日 2026-09-13）：[Android and Google Devices Security Reward Program Rules](https://bughunters.google.com/about/rules/android-friends/android-and-google-devices-security-reward-program-rules)
- 平台文档：Android Security（manifest 组件、WebView、Content Provider）、iOS Security（URL Scheme、ATS、Keychain、WKWebView）
