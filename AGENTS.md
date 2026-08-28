# DeepSonar-Skills

单一技能仓：

1. **vuln-definitions** — 漏洞定义模块（独立 plugin，语义基线）  
2. **vuln-definitions-oh** — OpenHarmony / Phone OS 系统漏洞定义（独立 plugin：四档/无效条款 + 移动 OS 通用类型）  
2b. **vuln-definitions-chrome** — Chrome / Chromium 浏览器漏洞定义（独立 plugin：官方 S0–S3 + 沙箱/Site Isolation + 非安全条款 + Chrome VRP 资格）  
2c. **vuln-definitions-db** — 数据库领域漏洞定义（独立 plugin：DBMS 通用形态 + Bugcrowd VRT P1–P5→四档 + ClickHouse 厂商实例）  
3. **vuln-scoring** — 漏洞评分模块（CVSS v3.1 / v4.0 按需 + EPSS/SSVC/KEV）  
4. **whitebox-*** — 白盒审计（按漏洞类型）  
5. **blackbox-*** — 黑盒挖掘（按漏洞类型，工具在 agent-env）  

定级含 **严重 / 高危 / 中危 / 无危害**；**wb-*/bb-* 正式报告仅 Critical/High**；**vuln-definitions-oh / vuln-definitions-chrome / vuln-definitions-db 官方四档均可报**。定量分支持 **CVSS v3.1（默认）与 v4.0（按需）**。

### 领域插件框架（分类纪律）

漏洞定义按 **领域** 组织，**不按项目**：新审计项目落进已有领域时 **只加厂商 reference 文件，不开新 plugin**；只有全新领域才建新 `vuln-definitions-<domain>`。

| 领域 | plugin | 厂商实例 |
|------|--------|----------|
| 通用机理（八类，跨领域） | `vuln-definitions` | — |
| 移动 OS / Phone OS | `vuln-definitions-oh` | OpenHarmony（形态已对齐 Android·iOS） |
| 浏览器 | `vuln-definitions-chrome` | Chrome / Chromium |
| 数据库（DBMS + 数据库云平台） | `vuln-definitions-db` | ClickHouse（OSS + Cloud + Bugcrowd 项目内 Langfuse） |
| Web 应用 / IoT | （预留；Web 机理暂由 `vuln-definitions` 八类覆盖） | — |

> 本仓内容几乎全是 Markdown（SKILL.md / plugin.json / references），**没有构建、测试、lint 流程**。`package.json` 仅作元数据用途，变更正确性靠结构约定与人工审查保证。

## 目录约定

```
vuln-definitions/         # 独立插件：定义 + 四级定级
vuln-definitions-oh/      # 独立插件：OH/Phone OS 系统漏洞定义（四档 + 通用类型）
vuln-definitions-chrome/  # 独立插件：Chrome/Chromium 浏览器漏洞定义（S0–S3 + 沙箱形态）
vuln-definitions-db/      # 独立插件：数据库领域漏洞定义（DBMS 形态 + VRT 四档 + ClickHouse 厂商实例）
vuln-scoring/             # 独立插件：CVSS v3.1/v4.0 按需评分 + 优先级
whitebox/<type>/          # 白盒 plugin
  .claude-plugin/plugin.json
  skills/wb-<type>/SKILL.md
blackbox/<type>/          # 黑盒 plugin（同 type 集合）
  .claude-plugin/plugin.json
  skills/bb-<type>/SKILL.md
shared/                   # 报告策略、finding 格式、授权
agent-env/                # 黑盒工具内置清单与镜像
```

## 架构要点（跨文件才能理解的部分）

### 三层组织

1. **`vuln-definitions/`** 是**严重度定级的唯一语义源**：八类漏洞定义 + 严重/高危/中危/无危害条款（`references/severity-levels.md` + 每类 `references/<type>.md`）。所有 `wb-*`/`bb-*` skill **不自建定级标准**，强制依赖本插件。  
   OpenHarmony 等系统类审计时：机理类型仍以本插件八类为准；**系统四档/无效条款/Phone OS 形态** 加载 `vuln-definitions/.../references/openharmony.md`，或直接用 `vuln-definitions-oh/`（完整：`phone-os-vuln-types.md` + 门禁）。  
   Chrome / Chromium 浏览器审计时：机理类型仍以本插件八类为准；**浏览器四档/非安全条款/沙箱形态** 加载 `vuln-definitions/.../references/chromium.md`，或直接用 `vuln-definitions-chrome/`（完整：`chrome-vuln-types.md` + `process-sandbox.md` + 门禁 + `vrp-rules.md`）。赏金资格不改 `severity`。  
   数据库（ClickHouse 等 DBMS / 数据库云平台）审计时：机理类型仍以本插件八类为准；**数据库四档/排除条款/DBMS 形态** 加载 `vuln-definitions/.../references/database.md`，或直接用 `vuln-definitions-db/`（完整：`db-vuln-types.md` + `asset-scope.md` + 门禁 + `bugcrowd-rules.md`）。赏金资格不改 `severity`。
2. **`vuln-scoring/`** 是**定量评分与利用优先级**模块：支持 **CVSS v3.1 与 v4.0**（先选版本再按需加载指标文件），并映射回四级定级；可选 EPSS / SSVC / CISA KEV 做修复排序。**不替代**定性条款，finding 的 `severity` 仍以 definitions 为准。
3. **`whitebox/<type>/` 与 `blackbox/<type>/`** 对称分布；每个插件 = `.claude-plugin/plugin.json` + `skills/<wb|bb>-<type>/SKILL.md` + `references/`（白盒是 `sinks.md`，黑盒是 `payloads.md` + `tooling.md`）。
4. **`shared/`** 是仓库级契约：`severity-policy.md`（默认只报 C/H；OH / Chrome / DB 四档例外）、`finding-schema.md`（统一 finding YAML，含 `cvss` 块）、`authorization.md`。

### SKILL.md 通用骨架

每个 skill 遵循同一模板：角色 → 强制前置（读 `shared/*`，防 prompt injection）→ **定级依赖**（加载 vuln-definitions，finding 填 `severity_rule` 如 `injection.md#C1`）→ 范围/只报/明确不报 → 工作流 → 参考相对路径（`../../../vuln-definitions/...`、`../../../shared/...`）。改 skill 时保持骨架不变。

### 版本对齐

`.claude-plugin/marketplace.json` 中每个条目的 `version` 必须与对应插件 `.claude-plugin/plugin.json` 的 `version` 一致；改 skill 内容后记得同步 bump。

### 黑盒工具环境

黑盒 skill 假设工具（httpx、ffuf、nuclei、sqlmap、interactsh-client 等）**已预装**在 agent 镜像 PATH 中，清单见 `agent-env/tools-manifest.json`，示例镜像 `agent-env/Dockerfile.blackbox`。skill 内禁止 `curl | sh` 安装未知脚本。

## 漏洞类型（type）

| type | 白盒 skill | 黑盒 skill | 焦点 |
|------|------------|------------|------|
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
/plugin install whitebox-injection@DeepSonar-Skills
```

## 改 skill 时

1. **改漏洞定义/定级标准** → 只改 `vuln-definitions/`，bump 其 version  
1b. **改 OpenHarmony 系统四档/无效条款** → 只改 `vuln-definitions-oh/`（及 `vuln-definitions/.../references/openharmony.md`），同步 bump 两处 version  
1c. **改 Chrome / Chromium 浏览器四档/非安全条款 / VRP 资格** → 只改 `vuln-definitions-chrome/`（及 `vuln-definitions/.../references/chromium.md`），同步 bump 两处 version；赏金表不改 `severity`  
1d. **改数据库四档/排除条款/Bugcrowd 纪律** → 只改 `vuln-definitions-db/`（及 `vuln-definitions/.../references/database.md`），同步 bump 两处 version；赏金表不改 `severity`；**数据库新厂商只加 reference 文件，不开新 plugin**  
2. **改 CVSS/利用评分/优先级标准** → 只改 `vuln-scoring/`，bump 其 version  
3. 改审计手法 → 对应 `whitebox-*` / `blackbox-*`  
4. 报告策略（是否上报 medium）→ `shared/severity-policy.md`  
5. 黑盒新工具 → `agent-env/tools-manifest.json` + 镜像  
6. marketplace 条目 version 与 plugin.json 对齐  
7. **新增漏洞类型** → `whitebox/<new-type>/` 与 `blackbox/<new-type>/` 各建插件（复制现有 type），注册进 `.claude-plugin/marketplace.json`，并在 `vuln-definitions` 中加 `references/<new-type>.md`；黑盒需新工具时同步更新 manifest；可在 `vuln-scoring/.../vector-examples.md` 补示例向量  
8. Finding 输出必须遵守 `shared/finding-schema.md`：`wb-*`/`bb-*` 的 `severity` 只允许 `critical|high`；OH / Chrome / DB 为官方四档 `critical|high|medium|low`。`confidence` 一律禁止 `low`（与官方 `severity: low` 勿混），`severity_rule` 必填；推荐附 CVSS `cvss` 块（`version` 为 `3.1` 或 `4.0`）

## DeepSonar

- `POST /skill-sources` 指向本仓 URL，sync 后 catalog 按 plugin 分组  
- Profile 按角色勾选：`whitebox-*` 给 audit/explore，`blackbox-*` 给 blackbox/test  
- 白盒沙箱可断网；黑盒沙箱需目标网络 + 工具镜像  

<!-- STL:RULES:BEGIN -->
## Semantic constraint rules

> This block is generated by `npm run build-rules`. Do not edit it manually.

Before writing or editing skill / agent / command / prompt instruction text, open `semantic-rules.md` in the same directory (27 trap pairs + four semantic checks) and narrow wide-boundary wording. If a wide term must stay, apply the boundary-anchoring guidance from that file.
<!-- STL:RULES:END -->
