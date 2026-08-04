# CVSS v4.0 ↔ DeepSonar 四级映射

本仓 **报告门槛** 由 `vuln-definitions` + `shared/severity-policy.md` 决定（默认只报 Critical/High）。  
CVSS 用于 **量化与外部对齐**，不能单独推翻「无危害/中危」的证据结论。

---

## 1. 两套体系对照

| 维度 | DeepSonar（vuln-definitions） | CVSS v4.0 |
|------|-------------------------------|-----------|
| 本质 | 业务/沦陷语义 + 前提 × 影响 | 标准化技术指标 → 0–10 分 |
| 等级 | critical / high / medium / none | Critical / High / Medium / Low / None |
| 用途 | 是否报告、条款引用 `severity_rule` | 向量、跨团队沟通、修复排序辅助 |
| 证据 | 必须 source→sink 或可复现利用 | 指标必须能被同一证据解释 |

---

## 2. 分数 → DeepSonar 映射（默认）

| CVSS Base（或 BT，若已评估利用成熟度） | `severity_mapped` | 说明 |
|----------------------------------------|-------------------|------|
| **9.0 – 10.0** | `critical` | 与 CVSS Critical 对齐 |
| **7.0 – 8.9** | `high` | 与 CVSS High 对齐 |
| **4.0 – 6.9** | `medium` | 默认 **不写正式 finding** |
| **0.1 – 3.9** | `none` 或 `medium` | 多为有限影响；无安全意义则 none |
| **0.0** | `none` | 无影响 |

### 2.1 允许的「语义覆盖」例外

下列情况允许 **映射等级与纯分数档不完全一致**，但必须在 `alignment_note` 写明：

| 情况 | 处理 |
|------|------|
| 分数 ≥9.0，但前提为 **已是管理员** 且管理面仅内网 | DeepSonar 可按条款降为 `high`；向量保持 `PR:H` 等真实前提 |
| 分数 7.0–8.9，但已证明 **租户隔离崩溃 / 未认证 RCE** | DeepSonar 可按条款升为 `critical`；复查是否漏评 VC/PR |
| 分数中等，但 **CISA KEV 活跃利用 + 业务核心资产** | severity 仍按定义；`fix_urgency` 提到 immediate |
| 白盒路径理论满分，但 **部署不可达** | DeepSonar → `none`；可给「假设可达」的条件分，并标注假设 |

**冲突裁决顺序**：

1. 证据是否成立（不可达 / 已防护 → none）  
2. `vuln-definitions` 类型条款（C/H/M/N）  
3. CVSS 指标是否填错（优先改指标，而不是硬改 severity）  
4. 仍分歧 → `alignment: diverge`，正式报告以 definitions 为准，并附 CVSS 供参考  

---

## 3. 指标组合 ↔ 等级直觉（辅助，非替代条款）

| 利用前提（摘要） | 影响摘要 | 常见 CVSS 档 | 常见 DeepSonar |
|------------------|----------|--------------|----------------|
| `PR:N` + `AV:N` + 稳定利用 | 任意 RCE / 整库 / 任意用户接管 | Critical | critical |
| `PR:L` + `AV:N` | 任意 RCE / 跨租户全量数据 | Critical 或 High | critical 或 high |
| `PR:N/L` + `AV:N` | 大量敏感数据读写、管理功能越权 | High～Critical | high 或 critical |
| `PR:H` + 管理面 | RCE 或高影响 | High 或更低 | high 或 medium |
| 任意 PR | 单对象低价值越权、有限信息 | Medium 或 Low | medium 或 none |
| 不可达 / 有效防护 | — | 不评或 0 | none |

完整前提 × 影响矩阵仍以  
`vuln-definitions/.../severity-levels.md` 为准。

---

## 4. 与 finding 字段对齐

```yaml
severity: critical | high     # 仅正式报告；来自 vuln-definitions
severity_rule: "ssrf.md#C2"  # 必填条款
cvss:
  version: "4.0"
  vector: "CVSS:4.0/..."
  base_score: 9.3
  nomenclature: CVSS-B
```

| 检查 | 要求 |
|------|------|
| `severity` vs `severity_mapped` | 正式 finding 应 `match`，或 diverge 有书面理由 |
| `cvss.base_score` ≥ 9.0 但 `severity: high` | 允许（如 PR:H 降级），须在 impact/preconditions 体现 |
| `cvss.base_score` < 7.0 但 `severity: critical` | **高可疑**；复查条款与指标，几乎总是一侧有误 |
| 无向量只有 `cvss_hint: "9.8"` | 兼容旧字段；新报告应升级为完整 `cvss` 块 |

---

## 5. 置信度

| `score_confidence` | 条件 |
|--------------------|------|
| high | 前提与影响证据充分；11 项指标均可辩护；分数经计算器或可靠锚点确认 |
| medium | 路径成立但部分指标两可（如 AT/UI）；或分数为估算 |
| low | 关键前提未验证；不应单独支撑正式 finding 的严重度抬升 |

`confidence`（finding 级）与 `score_confidence` 分开：前者是「漏洞是否成立」，后者是「分打得准不准」。

---

## 6. 工作示例

### 示例 A — 一致

- 未认证 SQL 注入读全库 → definitions `injection.md` Critical  
- `AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N` → 高 Base  
- `alignment: match`，`severity: critical`

### 示例 B — 分歧后修正指标

- 初评 `PR:N` 得 9.x，后发现强制 SSO 登录  
- 改为 `PR:L`，分数下降；若仍符合 high 条款 → 保持 high 并更新向量  

### 示例 C — 定性否决

- 扫描器 CVSS 模板 9.8，但代码侧参数化完善、不可达  
- definitions → `none`；**不输出正式 finding**；进度中可记「外部模板分无效」  
