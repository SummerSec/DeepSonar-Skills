# 报告策略（仓库级）

> **漏洞定义与四级定级标准不在本文件。**  
> 唯一语义源：独立插件 **`vuln-definitions`（漏洞定义模块）**  
> 路径：`vuln-definitions/skills/vuln-definitions/`

## 本仓报告什么

| 定级结果（按 vuln-definitions） | 是否写入正式 finding |
|--------------------------------|----------------------|
| Critical（严重） | ✅ 是 |
| High（高危） | ✅ 是 |
| Medium（中危） | ❌ 否（可记入进度否决） |
| None（无危害） | ❌ 否 |

## 强制流程

1. 加载 **vuln-definitions** skill  
2. 打开对应 `references/<vuln_type>.md`  
3. 按 Critical → High → Medium → None 匹配  
4. 仅 `critical`/`high` 且 `confidence` 为 high/medium 时，交给 `wb-*` / `bb-*` 输出  
5. （推荐）加载 **vuln-scoring**，按 **CVSS v3.1（默认）或 v4.0（按需）** 补全 finding 的 `cvss` 向量与分数；评分不得单独把 medium 抬进正式报告  

## 硬性检查（报告前）

1. 是否符合该类 **漏洞定义**？  
2. 攻击者前提与影响是否写清？  
3. 是否命中该类 **严重/高危** 条款（写明条款号，如 `injection.md#C1`）？  
4. 白盒 source→sink 或黑盒复现是否成立？  
5. 是否误把 medium/none 抬级？  

任一否 → 不报告。

## 置信度

- 只输出 `confidence: high | medium` 的 Critical/High  
- `confidence: low` 不输出  
- 黑盒无回显需 OOB/时间/状态旁证才可达 medium+  
