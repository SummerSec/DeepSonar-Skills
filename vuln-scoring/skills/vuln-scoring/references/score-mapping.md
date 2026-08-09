# CVSS（v3.1 / v4.0）↔ DeepSonar 四级映射

本仓 **报告门槛** 由 `vuln-definitions` + `shared/severity-policy.md` 决定（默认只报 Critical/High）。  
CVSS 用于 **量化与外部对齐**，不能单独推翻「无危害/中危」的证据结论。  
**分数档映射与版本无关**；指标含义见按需加载的 `cvss-v3.1.md` 或 `cvss-v4.md`。

---

## 1. 两套体系对照

| 维度 | DeepSonar（vuln-definitions） | CVSS v3.1 / v4.0 |
|------|-------------------------------|------------------|
| 本质 | 业务/沦陷语义 + 前提 × 影响 | 标准化技术指标 → 0–10 分 |
| 等级 | critical / high / medium / none | Critical / High / Medium / Low / None |
| 用途 | 是否报告、`severity_rule` | 向量、跨团队沟通、修复排序辅助 |
| 证据 | source→sink 或可复现利用 | 指标必须能被同一证据解释 |

---

## 2. 分数 → DeepSonar 映射（两版共用）

| CVSS Base（或已评估的 Temporal/Threat 分） | `severity_mapped` | 说明 |
|--------------------------------------------|-------------------|------|
| **9.0 – 10.0** | `critical` | 与 CVSS Critical 对齐 |
| **7.0 – 8.9** | `high` | 与 CVSS High 对齐 |
| **4.0 – 6.9** | `medium` | 默认 **不写正式 finding** |
| **0.1 – 3.9** | `none` 或 `medium` | 有限影响；无安全意义则 none |
| **0.0** | `none` | 无影响 |

### 2.1 允许的「语义覆盖」例外

| 情况 | 处理 |
|------|------|
| 分数 ≥9.0，但前提为 **已是管理员** 且管理面仅内网 | DeepSonar 可按条款降为 `high`；向量保持真实 `PR:H` |
| 分数 7.0–8.9，但已证明 **租户隔离崩溃 / 未认证 RCE** | 可按条款升为 `critical`；复查是否漏评影响/权限 |
| 分数中等，但 **KEV + 核心资产** | severity 仍按定义；`fix_urgency` → immediate |
| 理论满分但 **部署不可达** | DeepSonar → `none`；条件分须标注假设 |

**冲突裁决顺序**：

1. 证据是否成立  
2. `vuln-definitions` 类型条款  
3. 是否填错指标（优先改指标）  
4. 仍分歧 → `alignment: diverge`，正式报告以 definitions 为准  

---

## 3. 指标组合直觉（版本无关表述）

| 利用前提 | 影响摘要 | 常见 CVSS 档 | 常见 DeepSonar |
|----------|----------|--------------|----------------|
| 网络 + 未认证 + 稳定 | RCE / 整库 / 任意接管 | Critical | critical |
| 网络 + 普通用户 | RCE / 跨租户数据 | Critical 或 High | critical 或 high |
| 网络 + 未认证/低权 | 大量敏感数据/管理越权 | High～Critical | high 或 critical |
| 仅管理员 | RCE 或高影响 | High 或更低 | high 或 medium |
| 任意权限 | 单对象低价值越权 | Medium 或 Low | medium 或 none |
| 不可达 / 有效防护 | — | 不评或 0 | none |

---

## 4. 与 finding 字段对齐

```yaml
severity: critical | high
severity_rule: "ssrf.md#C2"
cvss:
  version: "3.1"   # 或 "4.0"
  vector: "CVSS:3.1/..."   # 或 CVSS:4.0/...
  base_score: 9.8
  # v4 可选 nomenclature: CVSS-B | CVSS-BT | ...
```

可选双版本：

```yaml
cvss:
  version: "3.1"
  vector: "CVSS:3.1/..."
  base_score: 9.8
cvss_alt:                    # 可选对照
  version: "4.0"
  vector: "CVSS:4.0/..."
  base_score: 9.3
  nomenclature: CVSS-B
```

| 检查 | 要求 |
|------|------|
| `severity` vs `severity_mapped` | 正式 finding 应 match，或 diverge 有理由 |
| `base_score` ≥ 9.0 但 `severity: high` | 允许，须在前提/影响体现 |
| `base_score` < 7.0 但 `severity: critical` | 高可疑，复查两侧 |
| 向量前缀与 `version` | 必须一致（3.1↔`CVSS:3.1/`，4.0↔`CVSS:4.0/`） |
| 混用指标 | **禁止**（不可把 AT 写进 3.1，不可把 S 写进 4.0 Base） |

---

## 5. 置信度

| `score_confidence` | 条件 |
|--------------------|------|
| high | 证据充分；Base 指标齐全可辩护；分数经计算器或可靠锚点确认 |
| medium | 部分指标两可，或分数为估算 |
| low | 关键前提未验证 |

---

## 6. 工作示例

### 一致

- 未认证 RCE → definitions critical + CVSS Base ≥ 9.0（任选版本正确填指标）→ `alignment: match`

### 修正指标

- 初评未认证，后发现强制登录 → 改 `PR:L`（两版同理），更新向量与分数  

### 定性否决

- 扫描器模板 9.8，但不可达 → definitions `none`，不写正式 finding  
