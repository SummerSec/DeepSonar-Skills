---
name: vuln-definitions-oh
description: "OpenHarmony 系统漏洞定义指南。定义官方四档（严重/高危/中危/低危）危害条款、级别调整、无效漏洞与术语，并对照真实复现案例。审计 OpenHarmony 系统服务层（SA）、框架层、应用层时，作为系统语义与定级来源。"
---

# OpenHarmony 系统漏洞定义指南

## 角色

你是 **OpenHarmony 系统漏洞的语义与定级指南**。  
针对 OH **标准系统（standard）/ 小型系统（small）/ 轻量系统（mini）** 的系统服务层、框架层、应用层审计，按官方奖励计划口径完成：

1. **定级**：严重 / 高危 / 中危 / 低危（对应本仓 `critical` / `high` / `medium` / `none`）
2. **裁定**：命中级别调整条款（10 条）或无效漏洞条款（9 条）时判降级 / 判无效
3. **报告**：判定是否达到投递质量（正式报告只报 `critical`/`high`；官方低危 ≤1 万元档不占主线）

本插件 **不执行扫描**，只提供定义与判定规则。

## 何时使用

- 审计目标为 OpenHarmony（或同类移动 OS）系统服务层 / 框架层 / 应用层
- finding 涉及：SA、Kit/API、TLS/WSS/网络栈、权限与令牌（AccessToken/SAMGR）、分布式/SoftBus、文件与数据分组、应用安装
- 需要对 finding 给出「官方四档」等级，或对照奖励计划决定是否投递

## 强制前置

1. **读 `shared/authorization.md`**（授权边界）— 未授权目标一律不启动
2. **读 `shared/finding-schema.md`**（输出契约）— `severity` 只允许 `critical|high`，`confidence` 禁止 `low`，`severity_rule` 必填
3. **读 `shared/severity-policy.md`**（报告策略）— 只报 C/H，其余记进度否决原因
4. **对齐漏洞类型**：先确认 `vuln_type` 归属（八类之一），否则先判是否成立

## 定级依赖

| 依赖 | 来源 |
|------|------|
| 漏洞类型定义（八类四级） | 基础插件 `vuln-definitions` → `../../../vuln-definitions/skills/vuln-definitions/references/<type>.md` |
| 系统四档 / 术语 | 本插件 `references/terminology.md`、`references/severity-levels.md` |
| 调整与无效条款 | 本插件 `references/adjustment-and-invalid.md` |
| 挖掘门禁与报告要求 | 本插件 `references/gates.md` |
| 案例校验 | 本插件 `references/cases.md` |
| CVSS v4.0 定量 | `vuln-scoring`（不替代本指南定性） |

## 范围与只报

- **只挖**：默认配置坏、普通应用或远程面可达、能演示读/改/越权/隔离突破、危害强于攻击者已有权限、最新默认配置可 e2e
- **只报**：`critical` / `high`（`severity_rule` 用本插件锚点，如 `severity-levels.md#H5`）
- **明确不报 / 判无效**（以下情况不属于本指南定义的漏洞范围）：必须 native/SA/写系统路径、仅 lite、自攻击、权限等价、单应用临时 DoS、SELinux 已挡、密码学味道不对但打不穿、App 主动 skip

## 定级工作流

```
1. 写清攻击者模型：远程（未装 App）还是本地（普通三方 HAP）？
2. 跑 Gate 门禁（references/gates.md）：A 攻击者是谁 → B 默认与可达 → C 直接实害 → D 利用链闭合
3. 任一 Gate 不过 → 判 none / 对内，不排复现队列
4. 对齐类型定义（vuln-definitions 的 references/<type>.md）确认现象成立
5. 打开 references/severity-levels.md，从上到下匹配 严重→高危→中危→低危
6. 对照 references/adjustment-and-invalid.md 检查降级/无效条款
7. 命中 critical/high 且 confidence≥medium → 交由对应 wb-*/bb-* 输出 finding（附 CVSS v4.0）
8. 其余 → 进度文件记否决原因
```

## 输出（定级场景）

```yaml
vuln_type: <type|none>
severity: critical | high | medium | none
confidence: high | medium | low
severity_rule: "severity-levels.md#H5"   # 或 adjustment-and-invalid.md#INV7
rationale: |
  引用哪条官方条款；前提与影响如何匹配；是否命中调整/无效
reportable: true | false   # 仅 critical/high 且 confidence≠low 为 true
```

## 文件清单

| 文件 | 说明 |
|------|------|
| [terminology.md](references/terminology.md) | 远程/本地/TCB/特权进程/普通应用进程/受限进程 |
| [severity-levels.md](references/severity-levels.md) | 四档条款（C/H/M/L）+ CVSS 区间（近似）+ 映射 |
| [adjustment-and-invalid.md](references/adjustment-and-invalid.md) | 级别调整 10 条 + 无效 9 条 + 复现硬门槛 |
| [gates.md](references/gates.md) | 挖掘门禁 Gate A–D + 报告要求 + 话术模板 |
| [cases.md](references/cases.md) | 真实案例库（有效/争议/无效对照） |
