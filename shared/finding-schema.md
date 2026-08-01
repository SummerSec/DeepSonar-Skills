# Finding 输出格式

所有 skill 的漏洞报告必须使用下列结构（YAML 或等价 JSON）。  
与 DeepFlowHunter SARIF 对齐时，将 `rule_id` → ruleId，`severity` → level，其余进 properties。

```yaml
id: VULN-001
mode: whitebox | blackbox
vuln_type: injection | rce | ssrf | authz | deserialization | file-access | xxe | secrets
title: 一句话标题（含组件/接口）
severity: critical | high          # 禁止 medium/low/none 进入正式报告
severity_rule: "injection.md#C1"  # 必填：vuln-definitions 插件中的条款号
confidence: high | medium        # 禁止 low
cwe: CWE-xxx
cvss_hint: "9.8"                 # 可选，粗估


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
```

## 命名约定

- `rule_id` / `vuln_type` 使用 plugin 目录名：`injection`、`rce`、`ssrf`、`authz`、`deserialization`、`file-access`、`xxe`、`secrets`
- 白盒 skill 名：`wb-<type>`；黑盒：`bb-<type>`
