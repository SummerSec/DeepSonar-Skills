# 漏洞评分模块（vuln-scoring）

独立 plugin：在 **vuln-definitions 定性定级** 之后，用 **最新行业标准** 给出可复现的定量分与利用优先级。

## 安装

```text
/plugin install vuln-scoring@DeepSonar-Skills
```

建议与 `vuln-definitions` 同开：先定级，再评分。

## 标准基线

| 标准 | 版本/状态 | 本插件用途 |
|------|-----------|------------|
| **CVSS** | **v4.0**（FIRST，2023-11 GA） | 主评分：向量串 + Base / Threat / Environmental 分 |
| **EPSS** | FIRST EPSS（持续更新） | 未来约 30 天被野外利用概率（辅助） |
| **SSVC** | CERT/CISA 决策树 | 响应动作：Track / Attend / Act 等 |
| **CISA KEV** | 已知被利用目录 | 命中则提高紧急度 |

> **不替代** `vuln-definitions` 的严重/高危/中危/无危害语义。  
> 定性条款仍是报告门槛；CVSS 用于数值化、对齐外部漏洞库与修复排序。

## 内容

| 文件 | 说明 |
|------|------|
| `skills/vuln-scoring/SKILL.md` | 入口：何时用、评分流程、输出格式 |
| `references/cvss-v4.md` | CVSS v4.0 指标定义与取值决策 |
| `references/score-mapping.md` | CVSS ↔ DeepSonar C/H/M/N 映射与冲突处理 |
| `references/prioritization.md` | EPSS / SSVC / KEV 组合优先级 |
| `references/vector-examples.md` | 八类漏洞常见向量示例 |

## 原则

1. **主标准固定为 CVSS v4.0**（不要默认回退到 v3.1，除非用户明确要求对照）  
2. **必须同时给出分数与完整向量串**  
3. 与 `vuln-definitions` 冲突时：**先对齐定性证据，再调指标**；不得只为抬分改向量  
4. 本仓正式 finding 仍只报 Critical/High；评分可为 medium/none 记录在进度中  
