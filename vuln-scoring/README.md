# 漏洞评分模块（vuln-scoring）

独立 plugin：在 **vuln-definitions 定性定级** 之后，用 **CVSS v3.1 和/或 v4.0** 给出可复现定量分与利用优先级。

## 安装

```text
/plugin install vuln-scoring@DeepSonar-Skills
```

建议与 `vuln-definitions` 同开：先定级，再评分。

## 标准基线

| 标准 | 版本 | 本插件用途 |
|------|------|------------|
| **CVSS** | **v3.1** 与 **v4.0**（按需选一或对照） | 向量串 + Base（+ Temporal/Threat/Environmental） |
| **EPSS** | FIRST EPSS | 野外利用概率（辅助） |
| **SSVC** | CERT/CISA | 响应动作 |
| **CISA KEV** | 已知被利用目录 | 提高紧急度 |

> **不替代** `vuln-definitions`。定性条款是报告门槛；CVSS 用于数值化与外部对齐。

### 版本怎么选

- **默认 v3.1**（OH/厂商公告、NVD 存量常见）  
- 用户指定或数据源已是 `CVSS:4.0/` → **v4.0**  
- 用户要求对照 → **两版各评一次**（`cvss` + `cvss_alt`）  
- 细则见 `skills/vuln-scoring/SKILL.md`「版本选择 / 按需加载」

## 内容

| 文件 | 说明 |
|------|------|
| `skills/vuln-scoring/SKILL.md` | 入口：版本选择、按需加载、流程、输出 |
| `references/cvss-v3.1.md` | **按需**：v3.1 指标与决策 |
| `references/cvss-v4.md` | **按需**：v4.0 指标与决策 |
| `references/vector-examples-v3.1.md` | **按需**：v3.1 示例向量 |
| `references/vector-examples-v4.md` | **按需**：v4.0 示例向量 |
| `references/score-mapping.md` | **共用**：分数 ↔ DeepSonar C/H/M/N |
| `references/prioritization.md` | **共用**：EPSS / SSVC / KEV |

## 原则

1. **先选版本，再只加载该版本指标文件**（双版本对照除外）  
2. **向量前缀与 version 必须一致**；禁止混用 3.1/4.0 指标集  
3. 与 definitions 冲突时先对齐证据再改指标  
4. 正式 finding 仍只报 Critical/High  
