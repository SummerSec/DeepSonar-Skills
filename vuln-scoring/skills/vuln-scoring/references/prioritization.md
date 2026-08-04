# 利用优先级：EPSS · SSVC · KEV

CVSS 回答 **「有多严重」**。  
本节标准回答 **「多优先修 / 多可能被打」**。  
**均不替代** `vuln-definitions` 的严重度，也 **不单独** 决定是否写入正式 finding。

---

## 1. 组合模型（推荐）

```
                    ┌─────────────┐
   证据与定性定级 ──►│ vuln-def   │── severity (C/H/M/N)
                    └─────────────┘
                           │
                    ┌──────▼──────┐
   技术指标评分   ──►│ CVSS v4.0  │── score + vector
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
      CISA KEV          EPSS              SSVC
     已知被利用      30 天利用概率      响应动作树
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                           ▼
                    fix_urgency / 排序建议
```

| 输入 | 高优先级信号 |
|------|----------------|
| severity | critical / high |
| CVSS | Base ≥ 7.0，或 Exploitability 很强（N/N/L 等） |
| KEV | 命中目录 |
| EPSS | 分数显著高于组织阈值（常见关注 ≥0.1 或 top 百分位） |
| SSVC | Act / Attend |

---

## 2. CISA KEV（Known Exploited Vulnerabilities）

- 目录：https://www.cisa.gov/known-exploited-vulnerabilities-catalog  
- **命中 KEV** ⇒  
  - Threat 指标倾向 `E:A`  
  - `fix_urgency: immediate`（在可修复前提下）  
  - SSVC Exploitation 倾向 Active  
- 无 CVE 或未收录 ≠ 安全；内部 0day 仍按 definitions + CVSS 处理。

---

## 3. EPSS（Exploit Prediction Scoring System）

- 维护：FIRST EPSS SIG；预测 **已公开 CVE 在未来约 30 天内被野外利用的概率**（0–1）。  
- 数据与 API：https://www.first.org/epss/  
- 适用：有 CVE 的漏洞排序；**不适用** 无 CVE 的现场新发现（标 `epss: null`）。  
- 使用纪律：  
  1. EPSS **高** + CVSS **高** → 最优先补丁窗口  
  2. EPSS **低** 不能把 Critical 改成 Medium  
  3. EPSS **高** 不能把 None/不可达改成 Critical  
  4. 写出查询时间与分位数（若可得），避免过期缓存  

```yaml
priority:
  epss: 0.87
  epss_percentile: 0.99
  epss_as_of: "2026-08-01"
```

---

## 4. SSVC（Stakeholder-Specific Vulnerability Categorization）

- 来源：CERT/CC + CISA 实践  
- 本质：**决策树 → 动作**，不是 0–10 分  
- 部署方（Deployer）常用决策点：

| 决策点 | 常见取值 | 含义 |
|--------|----------|------|
| Exploitation | none / public_poc / active | 利用状态 |
| Technical Impact | partial / total | 技术影响是否完全沦陷 |
| Automatable | yes / no | 利用步骤是否可大规模自动化 |
| Mission Prevalence / Well-being | 视组织 | 业务暴露与公共安全 |

### 4.1 CISA 风格动作（输出用）

| `ssvc_action` | 含义 | 与本仓关系 |
|---------------|------|------------|
| **act** | 立即行动 | 通常对应 critical/high + 活跃利用或极易打 |
| **attend** | 密切关注并加快 | high，或 critical 但缓解已部分到位 |
| **track_star** | 跟踪并准备 | medium～high 边界、情报变化快 |
| **track** | 常规跟踪 | medium 或已缓解 |
| **unknown** | 信息不足 | 列出缺失决策点 |

本 skill 输出 SSVC 时：

- 写清 **stakeholder 假设**（默认 `deployer`）  
- 每个决策点给取值 + 一句证据  
- **禁止**用 SSVC 动作名替换 `severity` 字段  

---

## 5. `fix_urgency` 合成规则（启发式）

在 **已是 reportable（C/H 且 confidence≥medium）** 的前提下：

| 条件 | `fix_urgency` |
|------|-----------------|
| KEV 命中 **或** SSVC=act **或**（critical 且 `PR:N`+`AV:N` 稳定利用） | `immediate` |
| high/critical，有公开 PoC 或 EPSS 高 | `soon` |
| high，利用条件受限（`PR:H` / `AT:P` / 仅内网） | `planned` |
| 仅进度中的 medium、或已有有效缓解待根治 | `defer` 或 `planned` |

非 reportable 项：不要用 `immediate` 制造恐慌式工单；可在进度文件记监控建议。

---

## 6. 输出模板（priority 段）

```yaml
priority:
  kev: false
  epss: null
  ssvc_action: attend
  ssvc_stakeholder: deployer
  ssvc_decision_points:
    exploitation: public_poc
    technical_impact: total
    automatable: "yes"
  fix_urgency: soon
  note: |
    未认证 RCE 路径已复现；暂无 KEV；建议下一补丁窗口前完成修复。
```

---

## 7. 明确不做的事

- 不把 EPSS 当 CVSS  
- 不把 SSVC 当 DeepSonar severity  
- 不在无网络权限时「查询」外网情报并假装已查（无条件则 `null` + 说明）  
- 不输出完整武器化 exploit 以「证明 EPSS」；利用成熟度用公开情报与是否存在 PoC 表述即可  
