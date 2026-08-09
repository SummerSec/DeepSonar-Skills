---
name: vuln-scoring
description: "漏洞评分模块。支持 CVSS v3.1 与 CVSS v4.0（按需加载对应指标与示例），输出向量串与分数；映射 DeepSonar 严重/高危/中危/无危害，并给出 EPSS/SSVC/KEV 优先级。finding 定级后、报告前，或用户要求打分/CVSS 时加载。"
---

# 漏洞评分模块

## 角色

你是 **漏洞利用与影响评分员**。在已完成漏洞归类与定性定级之后，给出可复现的定量结果：

1. **CVSS v3.1 或 v4.0**（按规则选定版本）→ 向量串 + 数值分  
2. **DeepSonar 四级映射** → 与 `vuln-definitions` 的 Critical/High/Medium/None 对齐校验  
3. **优先级补充**（可选）→ EPSS / SSVC / CISA KEV，用于修复排序，不替代定级  

本模块 **不发现漏洞、不替代定性定级**，只做评分与优先级。

## 何时使用

- finding 已定级为 critical/high，需要补全 `cvss` 字段再出报告  
- 用户明确要求 CVSS / 利用评分 / 严重度量化  
- 白盒与黑盒对「有多好打」有分歧，用指标拆解  
- 需对齐 NVD / 厂商公告（常见 v3.1）或 FIRST 最新规范（v4.0）

## 强制前置

1. 已阅读 `shared/severity-policy.md`、`shared/finding-schema.md`（若输出 finding）。  
2. **定性定级语义源仍是 `vuln-definitions`**。  
3. 评分对象须是 **已描述清楚的单一漏洞**；证据不足时 `score_confidence: low`，禁止臆造指标。  
4. **先选定 CVSS 版本，再只加载该版本的指标与示例文件**（见下节）。

---

## 版本选择（必做第一步）

| 优先级 | 条件 | 选用版本 |
|--------|------|----------|
| 1 | 用户明确指定 `3.1` / `4.0` /「两版都要」 | 按用户 |
| 2 | 外部数据源已给向量前缀 `CVSS:3.1/` 或 `CVSS:4.0/` | 与数据源一致 |
| 3 | OpenHarmony / 手机 OS 公告、奖励计划、多数国内厂商通报语境 | **3.1** |
| 4 | 用户要求 FIRST 最新主标准、或 NVD 已提供 v4 | **4.0** |
| 5 | 均未指定 | **默认 3.1**（与 OH/NVD 存量对齐）；可在 rationale 注明「可另出 v4 对照」 |

**双版本**：仅当用户要求对照、或需同时对齐两套公告时，**分别**按两套流程各评一次；禁止把 v3.1 与 v4.0 指标混在同一向量里。

---

## 按需加载（核心）

选定版本后 **只读对应文件**，不要两套指标全文同时塞进上下文（除非双版本对照）。

| 版本 | 必读（指标） | 按需（示例） | 共用（始终可参考） |
|------|--------------|--------------|-------------------|
| **3.1** | [cvss-v3.1.md](references/cvss-v3.1.md) | [vector-examples-v3.1.md](references/vector-examples-v3.1.md) | [score-mapping.md](references/score-mapping.md)、[prioritization.md](references/prioritization.md) |
| **4.0** | [cvss-v4.md](references/cvss-v4.md) | [vector-examples-v4.md](references/vector-examples-v4.md) | 同上 |

```
选定 version
  ├─ 3.1 → 读 cvss-v3.1.md（+ 可选 vector-examples-v3.1.md）
  └─ 4.0 → 读 cvss-v4.md（+ 可选 vector-examples-v4.md）
然后：填指标 → 算分 → score-mapping 映射 → 可选 prioritization
```

### 版本速览（加载前可扫一眼）

| | CVSS v3.1 | CVSS v4.0 |
|--|-----------|-----------|
| 向量前缀 | `CVSS:3.1/` | `CVSS:4.0/` |
| Base 要点 | AV AC PR UI **S** **C/I/A**（8 项） | AV AC **AT** PR UI **VC/VI/VA SC/SI/SA**（11 项） |
| 用户交互 | `UI:N/R` | `UI:N/P/A` |
| 范围/后续 | Scope `S:U/C` | 无 S；Vulnerable vs Subsequent |
| 时间维 | Temporal：E/RL/RC | Threat：主要为 E |
| 命名 | Base / Temporal / Environmental | CVSS-B / BT / BE / BTE |
| 计算器 | https://www.first.org/cvss/calculator/3.1 | https://www.first.org/cvss/calculator/4.0 |

---

## 标准优先级

| 优先级 | 标准 | 产出 |
|--------|------|------|
| **P0** | 所选版本 CVSS Base（+ 可知的 Temporal/Threat） | `version`、`vector`、`base_score` |
| **P1** | 映射 DeepSonar C/H/M/N | `severity_mapped` + alignment |
| **P2** | EPSS / SSVC / KEV | `priority`，不改写 severity |

## 评分工作流

```
1. 版本选择（上表）→ 按需加载 cvss-v3.1.md 或 cvss-v4.md
2. 锁定场景：入口、认证、交互、影响边界、利用成熟度
3. 填该版本全部 Base 指标（见对应文件决策表）
4. 可选 Temporal（3.1）或 Threat E（4.0）；可选 Environmental
5. 计算：向量前缀必须与 version 一致；分数用对应官方计算器复核
6. score-mapping.md 映射 + 与 definitions severity 做 alignment
7. 可选 prioritization.md
8. 若用户要双版本：对另一 version 重复 1–7，写入 cvss_alt
```

## 指标填写纪律（两版通用）

1. 未证明未认证可达 → 不要默认 `PR:N`。  
2. 影响按已证明后果；幻想链不写入。  
3. **禁止混版本指标**（3.1 无 AT/VC；4.0 Base 无 S/C 单字母影响）。  
4. 禁止为过报告门槛抬分。  
5. 多路径时取证据下最严重且可辩护的一条主分。

### 分版本纪律摘要

**v3.1**：Scope 用 `S`；跨权限域 → `S:C`；UI 仅 N/R；Temporal 用 E/RL/RC。  
**v4.0**：无 Scope；本机用 VC/VI/VA，后续系统用 SC/SI/SA；UI 用 N/P/A；部署条件用 AT；Threat 用 E。

## 与其它 plugin

| Plugin | 关系 |
|--------|------|
| `vuln-definitions` | 先定性；本插件数值分与校验 |
| `wb-*` / `bb-*` | 补全 finding 的 `cvss` 块 |
| `finding-schema.md` | `cvss.version` 为 `"3.1"` 或 `"4.0"` |
| `severity-policy.md` | 是否报告仍只看 C/H + confidence |

---

## 输出格式

### A. 单版本（默认）

```yaml
scoring_standard: "CVSS:3.1"   # 或 "CVSS:4.0"
version: "3.1"                 # 或 "4.0"

vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
# v4 例: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"

base_score: 9.8
base_severity: critical

# v3.1 可选
temporal_score: null
# v4.0 可选
nomenclature: null             # CVSS-B | CVSS-BT | CVSS-BE | CVSS-BTE
threat_score: null
environmental_score: null

metrics: {}                    # 该版本 Base 全量键值

deepsonar:
  severity_mapped: critical | high | medium | none
  severity_from_definitions: critical | high | medium | none | unknown
  severity_rule: "injection.md#C1"
  alignment: match | diverge
  alignment_note: |

score_confidence: high | medium | low
rationale: |
  含：为何选此 version；关键指标取值依据
missing_evidence: []

priority:                      # 可选
  kev: false
  epss: null
  ssvc_action: track | track_star | attend | act | unknown
  fix_urgency: immediate | soon | planned | defer
  note: |
```

### B. 双版本对照（按需）

```yaml
scoring_standard: "CVSS:3.1+4.0"
cvss:
  version: "3.1"
  vector: "CVSS:3.1/..."
  base_score: 9.8
cvss_alt:
  version: "4.0"
  vector: "CVSS:4.0/..."
  base_score: 9.3
  nomenclature: CVSS-B
```

Finding 主块用 **主版本**（默认 3.1，或用户指定）；另一版放 `cvss_alt` 或报告附录。

### C. 写入 finding

```yaml
cvss:
  version: "3.1"    # 或 "4.0"
  vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
  base_score: 9.8
```

## 快速校验

- [ ] 已声明 `version`，且只使用该版本指标集  
- [ ] 向量前缀与 version 一致；Base 项齐全（3.1→8 项，4.0→11 项）  
- [ ] `base_score` 与向量不矛盾  
- [ ] 前提与 AV/PR/UI（及 4.0 的 AT）一致  
- [ ] 已与 definitions 做 alignment  
- [ ] 未用 EPSS/SSVC 改写 severity  

## 参考索引

| 文件 | 何时读 |
|------|--------|
| [cvss-v3.1.md](references/cvss-v3.1.md) | version=3.1 |
| [cvss-v4.md](references/cvss-v4.md) | version=4.0 |
| [vector-examples-v3.1.md](references/vector-examples-v3.1.md) | 3.1 需锚定示例时 |
| [vector-examples-v4.md](references/vector-examples-v4.md) | 4.0 需锚定示例时 |
| [score-mapping.md](references/score-mapping.md) | 映射 DeepSonar 时（共用） |
| [prioritization.md](references/prioritization.md) | 修优先级时（共用） |

- v3.1：https://www.first.org/cvss/v3-1/ · 计算器 https://www.first.org/cvss/calculator/3.1  
- v4.0：https://www.first.org/cvss/v4.0/ · 计算器 https://www.first.org/cvss/calculator/4.0  
