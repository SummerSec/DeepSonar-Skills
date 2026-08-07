# OpenHarmony 系统漏洞定义指南（vuln-definitions-oh）

独立 plugin：面向 **OpenHarmony / 类移动 OS** 系统审计的定级语义源。  
覆盖系统服务层（SA）、框架层、应用层的漏洞定义与官方四档裁定。

## 安装

```text
/plugin install vuln-definitions-oh@DeepSonar-Skills
```

审计 OpenHarmony 目标时，**同时安装** `vuln-definitions`（漏洞类型定义）+ `vuln-scoring`（CVSS v4.0 定量）。

## 内容

| 文件 | 说明 |
|------|------|
| `skills/vuln-definitions-oh/SKILL.md` | 指南入口：角色、前置、定级工作流、输出 |
| `references/terminology.md` | 远程/本地/TCB/特权进程/普通应用进程/受限进程 |
| `references/severity-levels.md` | 官方四档危害条款（C/H/M/L 锚点）+ CVSS 区间（近似）+ 映射 |
| `references/adjustment-and-invalid.md` | 级别调整 10 条 + 无效漏洞 9 条 + 复现硬门槛 |
| `references/gates.md` | 挖掘门禁 Gate A–D + 报告要求 + 实害话术模板 |
| `references/cases.md` | 真实复现案例库：有效 / 争议 / 无效对照 |

## 规则

- **系统语义独立**：四档以官方奖励计划口径为准，不与通用 Web 条款混用
- **只报 C/H**：正式报告仅 `critical`/`high`；官方「低危」（≤1 万档）默认不占主线
- **无效即停**：命中无效/强前提条款直接判 `none`/对内，不排复现队列
- **定性定量分离**：本插件定性；CVSS v4.0 量化由 `vuln-scoring` 负责

## 与基础 vuln-definitions 的关系

- 漏洞**类型**定义（injection/rce/ssrf/authz/deserialization/file-access/xxe/secrets）仍以 `vuln-definitions` 的 `references/<type>.md` 为准
- **系统级定级、无效、调整** 以本插件为准（本插件是其 OH 专项细化）

## 语义基线

依据 OpenHarmony 安全漏洞奖励计划（2026-05 官方口径）+ 实战复测结论（2026-08 批次：3 有效 + 1 争议 + 15 无效/强前提）。
