# 利用优先级：EPSS · SSVC · KEV

CVSS（**v3.1 或 v4.0**）回答 **「有多严重」**。  
本节回答 **「多优先修 / 多可能被打」**。  
**均不替代** `vuln-definitions` 的严重度，也 **不单独** 决定是否写入正式 finding。

---

## 1. 组合模型（推荐）

```
                    ┌─────────────┐
   证据与定性定级 ──►│ vuln-def   │── severity (C/H/M/N)
                    └─────────────┘
                           │
                    ┌──────▼──────┐
   技术指标评分   ──►│ CVSS 3.1/4.0│── score + vector（按所选版本）
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
| CVSS | Base ≥ 7.0，或利用面极强（网络+未认证+低复杂+无交互等） |
| KEV | 命中目录 |
| EPSS | 显著高于组织阈值（常见 ≥0.1 或 top 百分位） |
| SSVC | Act / Attend |

---

## 2. CISA KEV

- 目录：https://www.cisa.gov/known-exploited-vulnerabilities-catalog  
- **命中** ⇒  
  - v3.1 Temporal 倾向 `E:H`/`E:F`；v4.0 Threat 倾向 `E:A`  
  - `fix_urgency: immediate`  
  - SSVC Exploitation → Active  
- 无 CVE ≠ 安全；内部 0day 仍按 definitions + CVSS。

---

## 3. EPSS

- FIRST EPSS：https://www.first.org/epss/  
- 有 CVE 才填；现场 0day → `epss: null`  
- 纪律：EPSS 高/低 **不改写** severity；只影响 `fix_urgency`  

```yaml
priority:
  epss: 0.87
  epss_percentile: 0.99
  epss_as_of: "2026-08-01"
```

---

## 4. SSVC

| `ssvc_action` | 含义 |
|---------------|------|
| **act** | 立即行动 |
| **attend** | 密切关注并加快 |
| **track_star** | 跟踪并准备 |
| **track** | 常规跟踪 |
| **unknown** | 信息不足 |

写清 stakeholder（默认 `deployer`）与决策点证据；**禁止**用 SSVC 替换 `severity`。

---

## 5. `fix_urgency` 合成（启发式）

在 **reportable（C/H 且 confidence≥medium）** 前提下：

| 条件 | `fix_urgency` |
|------|-----------------|
| KEV 或 SSVC=act 或（critical 且网络未认证稳定利用） | `immediate` |
| high/critical + 公开 PoC 或 EPSS 高 | `soon` |
| high 但 `PR:H` / 高复杂 / 仅内网 | `planned` |
| 进度中 medium 或已有缓解 | `defer` / `planned` |

---

## 6. 输出模板

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
    未认证 RCE 已复现；暂无 KEV；建议下一补丁窗口前修复。
```

---

## 7. 明确不做

- 不把 EPSS 当 CVSS  
- 不把 SSVC 当 DeepSonar severity  
- 无外网时不假装已查情报（`null` + 说明）  
