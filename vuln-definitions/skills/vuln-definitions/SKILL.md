---
name: vuln-definitions
description: "漏洞定义模块。定义 injection/rce/ssrf/authz/deserialization/file-access/xxe/secrets 等漏洞类型的含义，以及严重(Critical)、高危(High)、中危(Medium)、无危害(None) 的判定标准。白盒/黑盒审计、定级、争议裁决时必须加载。OpenHarmony 等系统类审计时加载 references/openharmony.md 对齐系统语义。"
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
- 审计目标为 OpenHarmony / 类移动 OS 系统层、框架层、应用层：加载 `references/openharmony.md` 对齐系统语义

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

### 系统专项（OpenHarmony / 类移动 OS）

审计目标为 **OpenHarmony 标准/小型/轻量系统**（系统服务层、框架层、应用层）时，加载：

**[references/openharmony.md](references/openharmony.md)** — 官方四档（`#C1…H1…M1…L1…`）、术语、ADJ/INV、Phone OS 类型摘要。完整 **Phone OS 通用漏洞类型** 与门禁见插件 `vuln-definitions-oh`（`phone-os-vuln-types.md`）。

系统语义与本文件全局条款冲突时，**以 `openharmony.md` 为准**。

跨类型边界与「优先归哪类」见 **[references/classification.md](references/classification.md)**。

## 定级工作流（每次 finding 必走）

```
1. 确认现象是否符合某一类「漏洞定义」→ 否则 none
2. 写清：攻击者是谁、需要什么前提、能造成什么影响
3. 打开该类 references/<type>.md，从上到下匹配 Critical → High → Medium → None
4. 系统类目标（OpenHarmony 等）→ 先对齐 `references/openharmony.md` 的系统条款与无效条款，再回到类型细则
5. 命中最高且证据充分的一级；证据不足则降级或标 none
6. 若最终为 critical/high 且 confidence≥medium → 可交由对应 wb-*/bb-* 输出 finding
7. 若为 medium/none → 本仓默认不写入 findings（可在进度文件记一句否决原因）
```

## 与其它 plugin 的关系

| Plugin | 关系 |
|--------|------|
| `vuln-definitions`（本插件） | **定义与定级** 唯一语义源 |
| `vuln-scoring` | 定性定级后做 **CVSS v4.0** 定量分与优先级；不替代本插件条款 |
| `whitebox-*` | 用本定义做源码审计；只产出 critical/high finding |
| `blackbox-*` | 用本定义做动态验证；只产出 critical/high finding |
| `shared/severity-policy.md` | 仓库报告策略（只报 C/H）；细节以本插件为准 |

Profile 配置：**凡启用任一 wb-*/bb-*，必须同时启用本插件**；需要向量/分数时再启用 `vuln-scoring`。

## 输出（仅定级场景）

当用户只要定级结论时，输出：

```yaml
vuln_type: <type|none>
severity: critical | high | medium | none
confidence: high | medium | low
rationale: |
  引用了哪条定义；前提与影响如何匹配
matched_rule: "见 references/<type>.md 的 <等级> 条款 x"
reportable: true | false   # 本仓：仅 critical/high 且 confidence≠low 为 true
```
