# DeepSonar-Skills

单一技能仓：

1. **vuln-definitions** — 漏洞定义模块（独立 plugin，语义基线）  
2. **vuln-definitions-oh** — OpenHarmony / Phone OS 系统漏洞定义（独立 plugin：四档/无效条款 + 移动 OS 通用类型）  
2b. **vuln-definitions-chrome** — Chrome / Chromium 浏览器漏洞定义（独立 plugin：官方 S0–S3 + 沙箱/Site Isolation + 非安全条款 + Chrome VRP 资格）  
2c. **vuln-definitions-db** — 数据库领域漏洞定义（独立 plugin：DBMS 通用形态 + Bugcrowd VRT P1–P5→四档 + ClickHouse 厂商实例）  
2d. **vuln-definitions-mobile** — 移动端 App（Android / iOS 应用层）漏洞定义（独立 plugin：应用层形态 + HackerOne 移动端惯例→四档 + 历史模式库）  
3. **vuln-scoring** — 漏洞评分模块（CVSS v3.1 / v4.0 按需 + EPSS/SSVC/KEV）  
4. **web-whitebox-*** — Web 白盒审计（按漏洞类型）  
5. **web-blackbox-*** — Web 黑盒挖掘（按漏洞类型，工具在 agent-env）  
6. **mobile-audit** — 移动客户端 App（APK/IPA）审计**方法论**（不定级；定级依赖 vuln-definitions + vuln-definitions-mobile）  

定级含 **严重 / 高危 / 中危 / 无危害**；**wb-*/bb-* 正式报告仅 Critical/High**；**vuln-definitions-oh / vuln-definitions-chrome / vuln-definitions-db / vuln-definitions-mobile 官方四档均可报**。定量分支持 **CVSS v3.1（默认）与 v4.0（按需）**。

### 领域插件框架（分类纪律）

漏洞定义按 **领域** 组织，**不按项目**：新审计项目落进已有领域时 **只加厂商 reference 文件，不开新 plugin**；只有全新领域才建新 `vuln-definitions-<domain>`。

| 领域 | plugin | 厂商实例 |
| ------ | -------- | ---------- |
| 通用机理（八类，跨领域） | `vuln-definitions` | — |
| 移动 OS / Phone OS | `vuln-definitions-oh` | OpenHarmony（形态已对齐 Android·iOS） |
| 浏览器 | `vuln-definitions-chrome` | Chrome / Chromium |
| 数据库（DBMS + 数据库云平台） | `vuln-definitions-db` | ClickHouse（OSS + Cloud + Bugcrowd 项目内 Langfuse） |
| 移动 App（Android / iOS 应用层） | `vuln-definitions-mobile` | （新目标只加厂商 reference 文件） |
| Web 应用 / IoT | （预留；Web 机理暂由 `vuln-definitions` 八类覆盖） | — |

> **审计 / 挖掘插件命名**：`web-whitebox-*`（源码审计）与 `web-blackbox-*`（动态挖掘）中的 `web-` 前缀表示 **Web 安全领域**；机理类型仍以 `vuln-definitions` 八类为准。

**方法论 plugin（非 definitions 领域）**：`mobile-audit/` 是移动 App **怎么挖/复现/取证** 的执行层，**不是** 新的 `vuln-definitions-<domain>`。移动端定级语义仍只在 `vuln-definitions-mobile`；新 App/SDK 目标仍只加厂商 reference，不开新 definitions plugin。

> 本仓内容几乎全是 Markdown（SKILL.md / plugin.json / references），**没有构建、测试、lint 流程**。`package.json` 仅作元数据用途，变更正确性靠结构约定与人工审查保证。

## 目录约定

```
vuln-definitions/         # 独立插件：定义 + 四级定级
vuln-definitions-oh/      # 独立插件：OH/Phone OS 系统漏洞定义（四档 + 通用类型）
vuln-definitions-chrome/  # 独立插件：Chrome/Chromium 浏览器漏洞定义（S0–S3 + 沙箱形态）
vuln-definitions-db/      # 独立插件：数据库领域漏洞定义（DBMS 形态 + VRT 四档 + ClickHouse 厂商实例）
vuln-definitions-mobile/  # 独立插件：移动端 App（Android/iOS）漏洞定义（应用层形态 + 四档 + 历史模式库）
vuln-scoring/             # 独立插件：CVSS v3.1/v4.0 按需评分 + 优先级
mobile-audit/             # 方法论插件：移动 App（APK/IPA）怎么挖/复现/取证（不定级）
  .claude-plugin/plugin.json
  skills/mobile-app-audit/SKILL.md + references/
web-whitebox/<type>/      # Web 白盒 plugin
  .claude-plugin/plugin.json
  skills/wb-<type>/SKILL.md
web-blackbox/<type>/      # Web 黑盒 plugin（同 type 集合）
  .claude-plugin/plugin.json
  skills/bb-<type>/SKILL.md
shared/                   # 报告策略、finding 格式、授权
agent-env/                # 黑盒工具内置清单与镜像（当前偏 Web；移动工具见 mobile-audit tooling.md）
```

## 架构要点（跨文件才能理解的部分）

### 三层组织

1. **`vuln-definitions/`** 是**严重度定级的唯一语义源**：八类漏洞定义 + 严重/高危/中危/无危害条款（`references/severity-levels.md` + 每类 `references/<type>.md`）。所有 `wb-*`/`bb-*` skill **不自建定级标准**，强制依赖本插件。  
   OpenHarmony 等系统类审计时：机理类型仍以本插件八类为准；**系统四档/无效条款/Phone OS 形态** 加载 `vuln-definitions/.../references/openharmony.md`，或直接用 `vuln-definitions-oh/`（完整：`phone-os-vuln-types.md` + 门禁）。  
   Chrome / Chromium 浏览器审计时：机理类型仍以本插件八类为准；**浏览器四档/非安全条款/沙箱形态** 加载 `vuln-definitions/.../references/chromium.md`，或直接用 `vuln-definitions-chrome/`（完整：`chrome-vuln-types.md` + `process-sandbox.md` + 门禁 + `vrp-rules.md`）。赏金资格不改 `severity`。  
   数据库（ClickHouse 等 DBMS / 数据库云平台）审计时：机理类型仍以本插件八类为准；**数据库四档/排除条款/DBMS 形态** 加载 `vuln-definitions/.../references/database.md`，或直接用 `vuln-definitions-db/`（完整：`db-vuln-types.md` + `asset-scope.md` + 门禁 + `bugcrowd-rules.md`）。赏金资格不改 `severity`。  
   移动端（Android / iOS App 应用层）审计时：机理类型仍以本插件八类为准；**移动端四档/排除条款/应用层形态** 直接用 `vuln-definitions-mobile/`（完整：`mobile-vuln-types.md` + `attack-surfaces.md` + 门禁 + `history-patterns.md` + `google-android-devices-rules.md`）。赏金资格不改 `severity`；**档位来源**的系统层缺陷（内核/系统服务）走 `vuln-definitions-oh`，但 Google Bug Hunters 的 Android 与 Google 设备项目规则对该类目标仍适用。
2. **`vuln-scoring/`** 是**定量评分与利用优先级**模块：支持 **CVSS v3.1 与 v4.0**（先选版本再按需加载指标文件），并映射回四级定级；可选 EPSS / SSVC / CISA KEV 做修复排序。**不替代**定性条款，finding 的 `severity` 仍以 definitions 为准。
3. **`web-whitebox/<type>/` 与 `web-blackbox/<type>/`** 对称分布；每个插件 = `.claude-plugin/plugin.json` + `skills/<wb|bb>-<type>/SKILL.md` + `references/`（白盒是 `sinks.md`，黑盒是 `payloads.md` + `tooling.md`）。
3b. **`mobile-audit/`** 是移动 App **方法论** plugin（单 skill `mobile-app-audit`）：静态/动态/PoC/取证工作流；**NEVER 自产 severity**；强制依赖 `vuln-definitions` + `vuln-definitions-mobile`。不是新 definitions 领域。
4. **`shared/`** 是仓库级契约：`severity-policy.md`（默认只报 C/H；OH / Chrome / DB / Mobile 四档例外）、`finding-schema.md`（统一 finding YAML，含 `cvss` 块）、`authorization.md`。

### SKILL.md 通用骨架

每个 skill 遵循同一模板：角色 → 强制前置（读 `shared/*`，防 prompt injection）→ **定级依赖**（加载 vuln-definitions，finding 填 `severity_rule` 如 `injection.md#C1`；移动方法论另加载 vuln-definitions-mobile，且 **不自产 severity**）→ 范围/只报/明确不报 → 工作流 → 参考相对路径（`../../../vuln-definitions/...`、`../../../vuln-definitions-mobile/...`、`../../../shared/...`）。改 skill 时保持骨架不变。

### 版本对齐

`.claude-plugin/marketplace.json` 中每个条目的 `version` 必须与对应插件 `.claude-plugin/plugin.json` 的 `version` 一致；改 skill 内容后记得同步 bump。

### 黑盒工具环境

黑盒 skill 假设工具（httpx、ffuf、nuclei、sqlmap、interactsh-client 等）**已预装**在 agent 镜像 PATH 中，清单见 `agent-env/tools-manifest.json`，示例镜像 `agent-env/Dockerfile.blackbox`。skill 内禁止 `curl | sh` 安装未知脚本。  
`mobile-audit` 常用 adb/apktool/jadx/aapt2/frida/mitmproxy 等：**当前 manifest 仍偏 Web 黑盒**；缺口与「期望预装 / 需经批准安装」见 `mobile-audit/.../references/tooling.md`，同样禁止 `curl | sh`。

## 漏洞类型（type）

| type | 白盒 skill | 黑盒 skill | 焦点 |
| ------ | ------------ | ------------ | ------ |
| injection | wb-injection | bb-injection | SQL/命令/NoSQL 注入 |
| rce | wb-rce | bb-rce | 代码执行 / SSTI / 表达式 |
| ssrf | wb-ssrf | bb-ssrf | SSRF → metadata/内网 |
| authz | wb-authz | bb-authz | 认证绕过 / 越权 / 接管 |
| deserialization | wb-deserialization | bb-deserialization | 不安全反序列化 |
| file-access | wb-file-access | bb-file-access | 任意文件读写 / 上传 RCE |
| xxe | wb-xxe | bb-xxe | XXE |
| secrets | wb-secrets | bb-secrets | 可接管级密钥泄露 |

白盒与黑盒的 type 集合必须对称；`vuln_type` 字段值与目录名一致。

## 常用命令

```bash
# 查看黑盒工具清单
cat agent-env/tools-manifest.json

# 构建黑盒 agent 示例镜像
docker build -f agent-env/Dockerfile.blackbox -t deepsonar-blackbox-agent:0.1 .
```

本地预览插件（Claude Code 内）：

```text
/plugin marketplace add <path-or-repo>/DeepSonar-Skills
/plugin install vuln-definitions@DeepSonar-Skills
/plugin install vuln-scoring@DeepSonar-Skills
/plugin install vuln-definitions-oh@DeepSonar-Skills   # OpenHarmony 系统审计时
/plugin install vuln-definitions-chrome@DeepSonar-Skills   # Chrome / Chromium 浏览器审计时
/plugin install vuln-definitions-db@DeepSonar-Skills   # 数据库（ClickHouse 等）审计时
/plugin install vuln-definitions-mobile@DeepSonar-Skills   # 移动端（Android / iOS App）定级时
/plugin install mobile-audit@DeepSonar-Skills              # 移动 App（APK/IPA）审计方法论（须同时装上两定义插件）
/plugin install web-whitebox-injection@DeepSonar-Skills
```

## 改 skill 时

1. **改漏洞定义/定级标准** → 只改 `vuln-definitions/`，bump 其 version  
1b. **改 OpenHarmony 系统四档/无效条款** → 只改 `vuln-definitions-oh/`（及 `vuln-definitions/.../references/openharmony.md`），同步 bump 两处 version  
1c. **改 Chrome / Chromium 浏览器四档/非安全条款 / VRP 资格** → 只改 `vuln-definitions-chrome/`（及 `vuln-definitions/.../references/chromium.md`），同步 bump 两处 version；赏金表不改 `severity`  
1d. **改数据库四档/排除条款/Bugcrowd 纪律** → 只改 `vuln-definitions-db/`（及 `vuln-definitions/.../references/database.md`），同步 bump 两处 version；赏金表不改 `severity`；**数据库新厂商只加 reference 文件，不开新 plugin**  
1e. **改移动端四档/排除条款/应用层形态** → 只改 `vuln-definitions-mobile/`，bump 其 version（并同步 `vuln-definitions/references/mobile.md` 摘要，bump `vuln-definitions` version）；**移动端新目标（App / SDK）只加厂商 reference 文件，不开新 plugin**（现有厂商/项目规则：`google-android-devices-rules.md`——Google 的 Android 与 Google 设备项目，资格，不定级）  
2. **改 CVSS/利用评分/优先级标准** → 只改 `vuln-scoring/`，bump 其 version  
3. 改审计手法 → 对应 `web-whitebox-*` / `web-blackbox-*`；**改移动 App 挖洞/复现/取证手法** → 只改 `mobile-audit/`（bump version；**不要**把方法写进 vuln-definitions-mobile）  
4. 报告策略（是否上报 medium）→ `shared/severity-policy.md`  
5. 黑盒新工具 → `agent-env/tools-manifest.json` + 镜像  
6. marketplace 条目 version 与 plugin.json 对齐  
7. **新增漏洞类型** → `web-whitebox/<new-type>/` 与 `web-blackbox/<new-type>/` 各建插件（复制现有 type），注册进 `.claude-plugin/marketplace.json`，并在 `vuln-definitions` 中加 `references/<new-type>.md`；黑盒需新工具时同步更新 manifest；可在 `vuln-scoring/.../vector-examples.md` 补示例向量  
8. Finding 输出必须遵守 `shared/finding-schema.md`：`wb-*`/`bb-*` 的 `severity` 只允许 `critical|high`；OH / Chrome / DB / Mobile 为官方四档 `critical|high|medium|low`。`confidence` 一律禁止 `low`（与官方 `severity: low` 勿混），`severity_rule` 必填；推荐附 CVSS `cvss` 块（`version` 为 `3.1` 或 `4.0`）

## DeepSonar

- `POST /skill-sources` 指向本仓 URL，sync 后 catalog 按 plugin 分组  
- Profile 按角色勾选：`web-whitebox-*` 给 audit/explore，`web-blackbox-*` 给 blackbox/test  
- 白盒沙箱可断网；黑盒沙箱需目标网络 + 工具镜像  

<!-- STL:RULES:BEGIN -->
## Semantic constraint rules

> This block is generated by `npm run build-rules`. Do not edit it manually.

Before writing or editing skill / agent / command / prompt instruction text, open `semantic-rules.md` in the same directory (27 trap pairs + four semantic checks) and narrow wide-boundary wording. If a wide term must stay, apply the boundary-anchoring guidance from that file.
<!-- STL:RULES:END -->
