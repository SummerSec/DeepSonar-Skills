---
name: vuln-definitions
description: "漏洞定义模块。定义 injection/rce/ssrf/authz/deserialization/file-access/xxe/secrets 八类通用机理，以及 client-side/logic-flaw/ai-agent/component/cloud-native/crypto 六类 Web 领域类型，并定义严重(Critical)、高危(High)、中危(Medium)、无危害(None) 的判定标准。白盒/黑盒审计、定级、争议裁决时必须加载。OpenHarmony 等系统类审计时加载 references/openharmony.md；Chrome / Chromium 浏览器审计时加载 references/chromium.md；数据库（ClickHouse 等 DBMS / 数据库云平台）审计时加载 references/database.md；移动端（Android / iOS App）审计时加载 references/mobile.md。"
---

# 漏洞定义模块

## 角色

你是 **漏洞语义与定级基线** 的唯一来源。  
白盒（`wb-*`）与黑盒（`bb-*`）在报告任何 finding 前，必须用本模块完成：

1. **归类**：属于哪一类漏洞（`vuln_type`）  
2. **定级**：Critical / High / Medium / None  
3. **裁决**：是否进入报告（本仓默认只报 Critical/High，但定级必须先做全）

本模块 **不执行扫描**，只提供定义与判定规则。

## 何时使用

- 审计/挖洞开始前：对齐「什么叫这类漏洞」  
- 发现可疑点后：对照该类的四级标准定级  
- 白盒与黑盒结论冲突：以本模块定义裁决  
- 用户问「这算高危还是中危」：直接引用对应 `references/*.md`
- 审计目标为 OpenHarmony / 类移动 OS 系统层、框架层、应用层：加载 `references/openharmony.md`（**摘要索引**，权威条款在 `vuln-definitions-oh`）对齐系统语义
- 审计目标为 Chrome / Chromium 浏览器：加载 `references/chromium.md`（**摘要索引**，权威条款在 `vuln-definitions-chrome`）对齐浏览器四档与非安全条款
- 审计目标为数据库引擎 / 数据库云平台（ClickHouse OSS / ClickHouse Cloud / Langfuse 等）：加载 `references/database.md`（**摘要索引**，权威条款在 `vuln-definitions-db`）对齐数据库四档与排除条款
- 审计目标为 Android / iOS 应用（移动端应用层，非系统层）：加载 `references/mobile.md`（**摘要索引**，权威条款在 `vuln-definitions-mobile`）对齐移动端四档与排除条款
- 目标含 AI / LLM / Agent（提示词、工具 / MCP、记忆、执行环境）→ 加载 `references/ai-agent.md`
- 缺陷根因在客户端渲染或跨窗口消息（XSS / `postMessage` / CORS / 开放重定向 / 点击劫持）→ 加载 `references/client-side.md`
- 缺陷是业务规则可绕或状态可重复消费（资金 / 权益 / 风控合规 / 并发）→ 加载 `references/logic-flaw.md`
- 缺陷根因在第三方组件或其默认配置 → 加载 `references/component.md`
- 缺陷根因在云资源策略或编排 / 运行时隔离 → 加载 `references/cloud-native.md`
- 缺陷是数据真实性 / 完整性可被伪造（签名、密文、传输层校验）→ 加载 `references/crypto.md`
- 目标为 **Web 应用 / 控制台 / API / 前端 + 移动 WebView**：先加载 `references/web-vuln-types.md` 定形态，再加载 `references/web-asset-scope.md` 判资产、`references/web-gates.md` 过五步门禁；目标自带程序规则时加载 `references/vendor-<program>.md`（模板见 `references/web-vendor-rules.md`）

## 全局等级定义

先读 **[references/severity-levels.md](references/severity-levels.md)**。

| 等级 | 代码 | 含义（一句话） |
|------|------|----------------|
| 严重 | `critical` | 可现实利用，导致系统/租户/身份/核心数据 **沦陷级** 后果 |
| 高危 | `high` | 可现实利用，导致 **重大** 数据/权限/链式沦陷，但未达全系统一键沦陷 |
| 中危 | `medium` | 真实弱点，影响 **有限** 或利用链不完整，单独不足以重大事故 |
| 无危害 | `none` | 不构成可利用安全漏洞，或仅理论/不可达/已有效防护 |

**定级规则（强制）**：

1. 先看 **实际可达的影响**，再看 **攻击者前提**（未认证 > 普通用户 > 管理员）。  
2. 同一技术缺陷，因前提与影响不同，可跨等级。  
3. 白盒「代码存在危险写法」≠ 漏洞；必须 source→sink 可达。  
4. 黑盒「扫描器告警」≠ 漏洞；必须可复现且影响成立。  
5. 拿不准时 **就低不就高**；不得为凑数抬级。

## 漏洞类型索引

每类一份完整定义（含四级判定）。审计某类时 **必须打开对应文件**：

| vuln_type | 文件 | 一句话 |
|-----------|------|--------|
| injection | [injection.md](references/injection.md) | 不可信输入进入解释/查询/命令语义 |
| rce | [rce.md](references/rce.md) | 攻击者导致服务端执行任意代码/命令 |
| ssrf | [ssrf.md](references/ssrf.md) | 服务端被诱导向攻击者指定目标发起请求 |
| authz | [authz.md](references/authz.md) | 认证/授权失效导致越权或身份伪造 |
| deserialization | [deserialization.md](references/deserialization.md) | 不可信数据被反序列化为对象/逻辑 |
| file-access | [file-access.md](references/file-access.md) | 路径/上传失控导致任意文件读写或执行 |
| xxe | [xxe.md](references/xxe.md) | XML 外部实体/危险解析导致读文件或 SSRF |
| secrets | [secrets.md](references/secrets.md) | 敏感凭据暴露且可被滥用 |

### Web 领域类型（六类）

下列六类定义在本插件内（与通用机理八类同级使用）：**只有定义与定级，暂无 `wb-*` / `bb-*` 执行插件**；`severity_rule` 直接填 `<type>.md#<等级>`。归类边界见 `references/classification.md`。

| vuln_type | 文件 | 一句话 |
|-----------|------|--------|
| client-side | [client-side.md](references/client-side.md) | 浏览器 / WebView 内脚本执行或跨域信任缺校验 |
| logic-flaw | [logic-flaw.md](references/logic-flaw.md) | 业务规则可绕或状态可重复消费 |
| ai-agent | [ai-agent.md](references/ai-agent.md) | 模型上下文或工具通道越过会话 / 租户边界 |
| component | [component.md](references/component.md) | 第三方组件 CVE 或框架默认配置缺陷 |
| cloud-native | [cloud-native.md](references/cloud-native.md) | 云资源策略或编排 / 运行时隔离暴露 |
| crypto | [crypto.md](references/crypto.md) | 签名 / 密文 / 传输层完整性可被伪造 |

### 系统专项（OpenHarmony / 类移动 OS）

审计目标为 **OpenHarmony 标准/小型/轻量系统**（系统服务层、框架层、应用层）时，加载：

**[references/openharmony.md](references/openharmony.md)** — 官方四档（`#C1…H1…M1…L1…`）、术语、ADJ/INV、Phone OS 类型摘要。完整 **Phone OS 通用漏洞类型**、**bounty 资产范围**与门禁见插件 `vuln-definitions-oh`（`phone-os-vuln-types.md`、`asset-scope.md`、`gates.md`）。

系统语义与本文件全局条款冲突时，**以 `openharmony.md` 为准**。

### 浏览器专项（Chrome / Chromium）

审计目标为 **出货 Chrome / Chromium 浏览器**（进程沙箱、V8/Blink、Site Isolation、Mojo、地址栏 UX）时，加载：

**[references/chromium.md](references/chromium.md)** — 官方四档（`#C1…H1…M1…L1…`）、缓解/非安全、浏览器类型摘要。完整 **进程沙箱**、**形态表**、门禁与 **VRP 资格**见插件 `vuln-definitions-chrome`（`process-sandbox.md`、`chrome-vuln-types.md`、`gates.md`、`vrp-rules.md`）。

浏览器语义与本文件全局条款冲突时，**以 `chromium.md` 为准**。  
ChromeOS 系统镜像、iOS WebKit 壳不当本专项。

### 数据库专项（DBMS / 数据库云平台）

审计目标为 **数据库引擎或数据库云平台**（当前厂商实例 ClickHouse：OSS 引擎 / ClickHouse Cloud / Langfuse Cloud）时，加载：

**[references/database.md](references/database.md)** — Bugcrowd VRT P1–P5 → 四档（`#C1…H1…M1…L1…`）、降档/排除条款、数据库类型摘要。完整 **形态表**、**资产范围**、门禁与 **Bugcrowd 纪律**见插件 `vuln-definitions-db`（`db-vuln-types.md`、`asset-scope.md`、`gates.md`、`bugcrowd-rules.md`）。

数据库语义与本文件全局条款冲突时，**以 `database.md` 为准**。  
数据库领域新目标（MySQL / PostgreSQL / MongoDB / Redis / …）进 `vuln-definitions-db` 加厂商文件，**不开新 plugin**。

跨类型边界与「优先归哪类」见 **[references/classification.md](references/classification.md)**。

### Web 领域专项（Web 应用 / 控制台 / API）

审计目标为 **Web 应用、管理控制台、对外 API、前端包与 App 内 WebView 承载的 Web 资产** 时，加载：

| 文件 | 作用 |
|------|------|
| **[references/web-vuln-types.md](references/web-vuln-types.md)** | Web 形态主表 W1–W14：形态 → 主类型 → 条款锚点倾向 |
| **[references/web-asset-scope.md](references/web-asset-scope.md)** | 资产分桶（`web_asset`）与合格判定（`web_scope`）、悬空资源、多域与多租户边界 |
| **[references/web-gates.md](references/web-gates.md)** | 五步门禁 Gate T / S / E / C / R 与门禁结论 |
| **[references/web-vendor-rules.md](references/web-vendor-rules.md)** | 目标程序规则模板与约定（`vendor-<program>.md` 只加文件不开 plugin） |

程序规则文件与通用语义冲突时，**以程序规则为准**（仅限资产范围 / 环境口径 / 档位表 / 方式纪律；类型定义与档位语义不回退）。

## 定级工作流（每次 finding 必走）

```
1. 确认现象是否符合某一类「漏洞定义」→ 否则 none
2. 写清：攻击者是谁、需要什么前提、能造成什么影响
3. 打开该类 references/<type>.md，从上到下匹配 Critical → High → Medium → None
4. 系统类目标（OpenHarmony 等）→ 先过资产范围（`vuln-definitions-oh` / `asset-scope.md`），再对齐 `references/openharmony.md` 的系统条款与无效条款，再回到类型细则
4b. 浏览器类目标（Chrome / Chromium）→ 先过资产范围（`vuln-definitions-chrome` / `asset-scope.md`），再对齐 `references/chromium.md` 的浏览器条款与非安全条款，再回到类型细则
4c. 数据库类目标（DBMS / 数据库云平台）→ 先过资产范围（`vuln-definitions-db` / `asset-scope.md`），再对齐 `references/database.md` 的数据库条款与排除条款，再回到类型细则
4d. 客户端 / AI / 逻辑 / 组件 / 云资源 / 密码学类目标 → 打开 `references/<type>.md`（`client-side` / `logic-flaw` / `ai-agent` / `component` / `cloud-native` / `crypto`）之一；**不得**把这几类笼统塞进 `authz`
4e. Web 应用 / 控制台 / API 目标 → 先过 `references/web-asset-scope.md`（`web_asset` / `web_scope`）与 `references/web-gates.md`（T/S/E/C/R），再按 `references/web-vuln-types.md` 的形态簇定主类型；有 `vendor-<program>.md` 时先按其资产范围与环境口径复判
5. 命中最高且证据充分的一级；证据不足则降级或标 none
5b. 数据面 finding：先按 `references/severity-levels.md` §7 的规模 × 敏感度矩阵定档，再与类型条款 **取较高者**；预发 / 灰度 / DEV 环境按 §8.1 的 ADJ-E1–E3 判定
5c. 链路与复报：链路类按 ADJ-C1 取终态可达的最高档；修复绕过按 ADJ-B1 重新定档；打包按 ADJ-C2 拆条
6. 若最终为 critical/high 且 confidence≥medium → 可交由对应 wb-*/bb-* 输出 finding
7. 若为 medium/none → **默认**不写入 findings（可在进度文件记一句否决原因）
   例外：系统类已走 openharmony.md / vuln-definitions-oh，浏览器类已走 chromium.md / vuln-definitions-chrome，或数据库类已走 database.md / vuln-definitions-db → 官方四档可写正式 finding（低危为 `low`，不是 `none`）
```

## 与其它 plugin 的关系

| Plugin | 关系 |
|--------|------|
| `vuln-definitions`（本插件） | **定义与定级** 语义源（八类通用机理 + 六类 Web 领域类型 + 全局四级） |
| `vuln-definitions-oh` | OpenHarmony / Phone OS 官方四档与系统形态 |
| `vuln-definitions-chrome` | Chrome / Chromium 官方四档与浏览器形态 |
| `vuln-definitions-db` | 数据库领域（ClickHouse 等）四档与 DBMS / 云控制面形态 |
| `vuln-scoring` | 定性定级后做 **CVSS v3.1/v4.0** 定量分与优先级；不替代本插件条款 |
| `web-whitebox-*` | 用本定义做 Web 源码审计；只产出 critical/high finding |
| `web-blackbox-*` | 用本定义做 Web 动态验证；只产出 critical/high finding |
| `shared/severity-policy.md` | 仓库报告策略（默认只报 C/H；OH / Chrome / DB / Mobile 官方四档例外；`report_policy` 开关） |

**Web 领域类型**（`client-side` / `logic-flaw` / `ai-agent` / `component` / `cloud-native` / `crypto`）定义在本插件内，当前无配套执行插件；需要审计执行层时按 `AGENTS.md` 的插件流程后补（新增 `web-whitebox/<type>` + `web-blackbox/<type>`）。

**依赖约束**：凡启用任一 `wb-*` / `bb-*`，必须同时启用本插件；需要向量 / 分数时再启用 `vuln-scoring`。

## 输出（仅定级场景）

当用户只要定级结论时，输出：

```yaml
vuln_type: <type|none>
severity: critical | high | medium | none   # 系统类 / 浏览器类 / 数据库类走 openharmony.md / chromium.md / database.md 时第四档为 low，不是 none；report_policy: program_table 时 medium/low 可写
confidence: high | medium | low
rationale: |
  引用了哪条定义；前提与影响如何匹配；数据面另写规模与敏感度
matched_rule: "见 references/<type>.md 的 <等级> 条款 x"
reportable: true | false   # 本仓默认：仅 critical/high 且 confidence≠low 为 true；OH / Chrome / DB 官方四档均可 true；report_policy: program_table 时 medium/low 也可 true
```
