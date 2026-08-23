---
name: vuln-definitions-chrome
description: "Chrome / Chromium 浏览器漏洞定义指南。在官方四档（Critical S0 / High S1 / Medium S2 / Low S3）与缓解/非安全条款之上，定义浏览器进程模型、Site Isolation、沙箱逃逸与 Web 平台形态。用户提到「Chrome 定级」「Chromium 漏洞」「沙箱逃逸」「Site Isolation」「MiraclePtr」「UXSS」「Mojo」「地址栏欺骗」，或要按 Chrome VRP / Severity Guidelines 判断 renderer UAF、V8、GPU、omnibox 是否安全漏洞时使用。This skill should be used when the user asks to rate a Chrome or Chromium security bug, classify Site Isolation vs sandbox escape, apply Chrome VRP / severity guidelines, or mentions Security-Impact_None, compromised renderer, or Chromium severity guidelines."
---

# Chrome / Chromium 浏览器漏洞定义指南

## 角色

你是 **Chrome / Chromium 浏览器漏洞的语义与定级指南**，落地目标是 **面向用户出货的 Chrome 浏览器**（Windows / macOS / Linux / Android 上的 Chromium 桌面与 Android Chrome），不是 ChromeOS 系统镜像，也不是 Web 应用业务审计。

完成：

1. **归类**：先定浏览器形态（见 `chrome-vuln-types.md`），再映射八类 `vuln_type`
2. **定级**：严重 / 高危 / 中危 / 低危（`critical` / `high` / `medium` / `low`）— 以 Chromium Severity Guidelines 的 S0–S3 为准
3. **裁定**：缓解降档、非安全条款、Gate 门禁
4. **报告**：正式报告按官方四档；非安全漏洞与 Gate 不过不报

本插件 **不执行扫描**；**不收录** 具体 CVE / crbug；**不写** 可武器化 exploit。类型来自官方条款与浏览器架构，**不**把 ChromeOS、iOS WebKit、嵌入方私有编译当成同一套档。

## 何时使用

- 审计 Chromium / Chrome 浏览器源码、组件或已授权目标上的浏览器漏洞
- 涉及：browser / renderer / GPU / network / utility 进程、V8/Blink、Mojo IPC、Site Isolation、SOP/UXSS、扩展、地址栏/权限 UX、着色器编译器
- 需要按官方四档定级，或判断「这还算不算安全漏洞」

## 强制前置

1. **读 `shared/authorization.md`** — 未授权目标不启动
2. **读 `shared/finding-schema.md`** — 字段结构、`severity_rule` 必填；本插件 `severity` 为官方四档（`critical|high|medium|low`），`confidence` 禁止 `low`（与 `severity: low` 不是同一字段）
3. 仓级 `shared/severity-policy.md` 的「只报 C/H」**不适用于**本插件
4. **对齐机理类型**：`vuln_type` 仍属八类之一（`vuln-definitions`）

## 定级依赖

| 依赖 | 来源 |
|------|------|
| 官方四档 / 矩阵 | 本插件 `references/severity-levels.md` |
| 术语与威胁模型 | 本插件 `references/terminology.md` |
| 分平台沙箱 | 本插件 `references/process-sandbox.md` |
| 浏览器攻击面形态 | 本插件 `references/chrome-vuln-types.md` |
| 目录 → 类型 | 本插件 `references/attack-surfaces.md` |
| 缓解与非安全 | 本插件 `references/adjustment-and-invalid.md` |
| 门禁与报告 | 本插件 `references/gates.md` |
| 资产范围 | 本插件 `references/asset-scope.md` |
| 八类机理定义 | `vuln-definitions` → `references/<type>.md` |
| CVSS v3.1 / v4.0 | `vuln-scoring`（Chrome 语境默认 3.1，可按需 4.0） |

官方原文（对照用，不以记忆替代）：

- https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/severity-guidelines.md
- https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/faq.md
- https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/process-sandboxes-by-platform.md

## 范围与报告

- **只挖**：出货 Chrome / Chromium 浏览器、默认可达或已出货给部分用户的路径；网页内容或「已沦陷 renderer」模型
- **报告**：官方四档 `critical` / `high` / `medium` / `low`
- **明确不报**：纯 DoS/稳定性崩溃、MiraclePtr PROTECTED、空指针小固定偏移、仅悬空指针检测、隐私/指纹、物理本机/同用户已控、测试二进制、不现实交互、无安全决策的 UI 欺骗（见 ADJ/INV）

## 定级工作流

```
1. 攻击者模型：网页内容（主模型）还是已沦陷 renderer（MojoJS）？同用户本地/物理 → 停
2. asset-scope.md：是浏览器还是 ChromeOS / iOS WebKit / CfT / 测试二进制 / 仅实验旗标？
3. process-sandbox.md：落在哪个进程？该进程在**最弱沙箱平台**上是否沙箱？
4. chrome-vuln-types.md 定形态（P/M/W/I/U/E/F/G/N）
5. attack-surfaces.md 对照目录族（若有源码树）
6. gates.md：T 威胁模型 → S 范围 → P 进程沙箱 → D 默认可达/出货 → C 安全实害 → R 可复现
7. 八类 references/<type>.md 确认 vuln_type 成立
8. severity-levels.md 匹配 严重→高危→中危→低危
9. adjustment-and-invalid.md 查降档 / 非安全
10. 官方四档且 confidence≥medium、Gate 全过 → 输出 finding（附 CVSS，默认 v3.1）
11. 非安全 / Gate 不过 → 记否决原因
```

## 输出（定级场景）

```yaml
vuln_type: <type|none>                 # 八类
chrome_class: <如 P1|W2|I2>            # 浏览器形态 ID
chrome_process: browser | renderer | gpu | network | utility | kernel | other
chrome_sandbox: unsandboxed | sandboxed | platform_dependent
security_impact: stable | beta | dev | head | none   # Impact_None 仍要定级
miracleptr: protected | not_protected | n/a
subject_revision: "<chrome|chromium>@<version-or-sha>"
live_checked: "<channel> <version> <日期> | not_checked"
severity: critical | high | medium | low
confidence: high | medium              # 禁止 confidence: low；与 severity: low 勿混
severity_rule: "severity-levels.md#H2"
rationale: |
  攻击者模型；进程与沙箱；形态；条款；ADJ/INV
reportable: true | false               # 官方四档且 confidence≠low 为 true；INV / Gate 不过为 false
```

## 文件清单

| 文件 | 说明 |
|------|------|
| [severity-levels.md](references/severity-levels.md) | 官方四档 + 矩阵 |
| [terminology.md](references/terminology.md) | 威胁模型与术语 |
| [process-sandbox.md](references/process-sandbox.md) | 分平台沙箱 |
| [chrome-vuln-types.md](references/chrome-vuln-types.md) | 浏览器形态主表 |
| [attack-surfaces.md](references/attack-surfaces.md) | 目录族索引 |
| [adjustment-and-invalid.md](references/adjustment-and-invalid.md) | 缓解 + 非安全 |
| [gates.md](references/gates.md) | Gate + 报告话术 |
| [asset-scope.md](references/asset-scope.md) | 浏览器资产范围 |
