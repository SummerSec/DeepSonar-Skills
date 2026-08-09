---
name: vuln-definitions-oh
description: "OpenHarmony / Phone OS 系统漏洞定义指南。在官方四档与调整/无效条款之上，定义移动操作系统通用漏洞类型（内核/IPC/沙箱/权限/媒体/Web/无线/安装等，对齐 Android·iOS 同类形态），用于系统服务层、框架层、应用层审计与定级。"
---

# OpenHarmony / Phone OS 系统漏洞定义指南

## 角色

你是 **移动操作系统（Phone OS）漏洞的语义与定级指南**，落地目标以 **OpenHarmony** 为主（标准 / 小型 / 轻量系统），语义与 Android、iOS 等 Phone OS **同类问题形态对齐**。

完成：

1. **归类**：属于哪类 Phone OS 漏洞（见 `phone-os-vuln-types.md`），并映射八类 `vuln_type`
2. **定级**：严重 / 高危 / 中危 / 低危（`critical` / `high` / `medium` / `none`）— 以 OH 官方奖励计划四档为准
3. **裁定**：级别调整 10 条、无效 9 条、Gate 门禁
4. **报告**：正式报告只报 `critical`/`high`

本插件 **不执行扫描**；**不收录** 具体 CVE 或历史公告条目。类型体系来自 Phone OS 共性，**不局限** 于某一厂商已公开漏洞清单。

## 何时使用

- 审计 OpenHarmony 或 **同类移动 OS** 的系统服务层 / 框架层 / 应用层
- 涉及：内核与驱动、IPC/SA、沙箱隔离、权限与令牌、导出组件与 deeplink、媒体/消息解析、WebView/运行时、蓝牙·Wi‑Fi·分布式、安装更新、锁屏与密钥、剪贴板/广播等
- 需要官方四档定级或判断是否投递

## 强制前置

1. **读 `shared/authorization.md`** — 未授权目标不启动  
2. **读 `shared/finding-schema.md`** — `severity` 仅 `critical|high`，`confidence` 禁止 `low`，`severity_rule` 必填  
3. **读 `shared/severity-policy.md`** — 只报 C/H  
4. **对齐机理类型**：`vuln_type` 仍属八类之一（`vuln-definitions`）

## 定级依赖

| 依赖 | 来源 |
|------|------|
| Phone OS 通用漏洞类型 | 本插件 `references/phone-os-vuln-types.md` |
| OH 组件 → 类型索引 | 本插件 `references/attack-surfaces.md` |
| 系统四档 / 术语 | `references/severity-levels.md`、`references/terminology.md` |
| 调整与无效 | `references/adjustment-and-invalid.md` |
| 门禁与报告 | `references/gates.md` |
| 八类机理定义 | `vuln-definitions` → `references/<type>.md` |
| CVSS v3.1 / v4.0 | `vuln-scoring`（OH 语境默认 3.1，可按需 4.0） |

## 范围与只报

- **只挖**：Phone OS 通用类型中、在 **默认配置** 下可由 **远程（含同网/无线/文件消息）** 或 **普通三方应用** 触达，且能演示实害、危害强于已有权限  
- **只报**：`critical` / `high`  
- **明确不报**：system/root/native 前提、未证明二次洞、IPC 半链、权限等价、单应用临时 DoS、非默认 skip、纯上游三方无默认路径、解锁 BL 主路径等（见 ADJ/INV）

## 定级工作流

```
1. 攻击者模型：远程（未装 App，含同网/无线/消息文件）或本地（普通三方 HAP）？
2. phone-os-vuln-types.md 归类（K/I/S/P/E/F/B/M/W/N/U/X…）
3. attack-surfaces.md 对照 OH 组件（若目标为 OH）
4. gates.md：A 攻击者 → B 默认可达 → C 直接实害 → D 链闭合
5. 八类 references/<type>.md 确认机理成立
6. severity-levels.md 匹配 严重→高危→中危→低危
7. adjustment-and-invalid.md 查降级/无效
8. 仅 critical/high 且 confidence≥medium → 输出 finding（附 CVSS，默认 v3.1）
9. 其余记否决原因
```

## 输出（定级场景）

```yaml
vuln_type: <type|none>          # 八类
phone_os_class: <如 I1|S1|M1a> # 可选，Phone OS 类型 ID
severity: critical | high | medium | none
confidence: high | medium | low
severity_rule: "severity-levels.md#H5"
rationale: |
  Phone OS 类型；路径与影响；条款；ADJ/INV
reportable: true | false
```

## 文件清单

| 文件 | 说明 |
|------|------|
| [phone-os-vuln-types.md](references/phone-os-vuln-types.md) | **Phone OS 通用漏洞类型定义**（主类型表） |
| [attack-surfaces.md](references/attack-surfaces.md) | OH 组件 → 类型索引 |
| [terminology.md](references/terminology.md) | 远程/本地/TCB；同网算远程 |
| [severity-levels.md](references/severity-levels.md) | 官方四档 + 影响语映射 |
| [adjustment-and-invalid.md](references/adjustment-and-invalid.md) | 调整 10 + 无效 9 + 强前提 |
| [gates.md](references/gates.md) | Gate A–D + 报告话术 |
