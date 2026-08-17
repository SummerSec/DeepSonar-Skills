# Finding 输出格式

所有 skill 的漏洞报告必须使用下列结构（YAML 或等价 JSON）。  
与 DeepSonar SARIF 对齐时，将 `rule_id` → ruleId，`severity` → level，其余进 properties。

```yaml
id: VULN-001
mode: whitebox | blackbox
vuln_type: injection | rce | ssrf | authz | deserialization | file-access | xxe | secrets
title: 一句话标题（含组件/接口）
severity: critical | high          # 禁止 medium/low/none 进入正式报告
severity_rule: "injection.md#C1"  # 必填：vuln-definitions 插件中的条款号
confidence: high | medium        # 禁止 low
cwe: CWE-xxx
cvss_hint: "9.8"                 # 可选兼容字段：粗估；新报告优先用下方 cvss 块
cvss:                            # 可选但推荐：vuln-scoring 按所选版本填写
  version: "3.1"                 # "3.1" | "4.0"
  vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
  # v4 例: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"
  base_score: 9.8
  nomenclature: null             # 仅 v4 常用：CVSS-B | CVSS-BT | CVSS-BE | CVSS-BTE
cvss_alt:                        # 可选：另一版本对照
  version: "4.0"
  vector: "CVSS:4.0/..."
  base_score: 9.3
  nomenclature: CVSS-B

# 影响
impact: |
  攻击者能做什么；影响范围（用户/租户/数据/主机）

# 前提
preconditions:
  - 网络可达: 公网/内网
  - 认证: 未认证 | 普通用户 | 管理员

# 证据
evidence:
  whitebox:
    source: "文件:行 — 攻击者输入点"
    sink: "文件:行 — 危险调用"
    path: "简要数据流"
    code_refs:
      - path: src/foo.py
        lines: "42-58"
  blackbox:
    requests:
      - step: 1
        method: POST
        url: https://target/api/...
        headers: {}
        body: "..."
        response_summary: "status / 关键差异"
    oob: "可选 DNS/HTTP 回调证据"
    timing_ms: null

# 利用摘要（不要完整攻击武器化 exploit；给验证路径即可）
exploitability: |
  最短利用路径描述

# 修复
remediation:
  short: 一句话修复
  detail: |
    参数化 / 鉴权 / 白名单 等具体建议

# 否决说明：若最终决定不报，写在进度文件，不要进入 findings

# 系统类 / OpenHarmony（可选；用 vuln-definitions-oh 时必填）
phone_os_class: I1                 # 可选：Phone OS 类型 ID，如 I1 / K5 / W6
asset_repo: communication_dsoftbus # 官方 bounty 名单中的仓名（精确匹配）
asset_scope: in_list_first_party   # in_list_first_party | in_list_third_party | in_list_upstream_kernel | in_list_vendor | in_list_non_runtime | not_in_list
subject_revision: "<仓>@<sha>"     # Job 钉扎；可与现树不同
live_checked: "<后继仓>@<sha> <日期> | not_checked"
```

## 命名约定

- `rule_id` / `vuln_type` 使用 plugin 目录名：`injection`、`rce`、`ssrf`、`authz`、`deserialization`、`file-access`、`xxe`、`secrets`
- 白盒 skill 名：`wb-<type>`；黑盒：`bb-<type>`
- 严重度语义：`vuln-definitions`；数值评分：`vuln-scoring`（**CVSS v3.1 或 v4.0**）
- 系统类（OH / Phone OS）另填 `phone_os_class`、`asset_repo`、`asset_scope`；名单与分桶见 `vuln-definitions-oh` 的 `asset-scope.md`。`asset_scope` 不是 `in_list_first_party` 时默认不进正式报告（三方/上游内核仅默认路径独立 e2e 可例外）

## CVSS 字段纪律

- 支持 **v3.1** 与 **v4.0**；`version` 与 `vector` 前缀必须一致  
  - `3.1` → `CVSS:3.1/` + Base 8 项（AV/AC/PR/UI/S/C/I/A）  
  - `4.0` → `CVSS:4.0/` + Base 11 项（含 AT 与 VC/VI/VA/SC/SI/SA）  
- **默认**主版本 `3.1`；用户/数据源指定或需 FIRST v4 时用 `4.0`；对照时主块 + `cvss_alt`  
- `base_score` 须与向量一致；不确定时宁可省略分数并说明，勿编造  
- `severity` 仍以 `severity_rule` 定性为准；CVSS 不能单独把 medium 抬进正式报告  
- 完整流程与按需加载见 `vuln-scoring` 插件  
