---
name: vuln-definitions-oh
description: "OpenHarmony / Phone OS 系统漏洞定义指南。在官方四档与调整/无效条款之上，定义移动操作系统通用漏洞类型（内核/HDF/IPC/沙箱/权限/Ark/近场软总线/OTA 等，对齐 Android·iOS 同类形态），用于系统服务层、框架层、应用层审计与定级。"
---

# OpenHarmony / Phone OS 系统漏洞定义指南

## 角色

你是 **移动操作系统（Phone OS）漏洞的语义与定级指南**，落地目标以 **OpenHarmony** 为主（标准 / 小型 / 轻量系统），语义与 Android、iOS 等 Phone OS **同类问题形态对齐**。

完成：

1. **归类**：先定公告机理（见 `mechanism-types.md`），再定 Phone OS 形态（见 `phone-os-vuln-types.md`），并映射八类 `vuln_type`
2. **定级**：严重 / 高危 / 中危 / 低危（`critical` / `high` / `medium` / `none`）— 以 OH 官方奖励计划四档为准
3. **裁定**：级别调整 10 条、无效 9 条、Gate 门禁
4. **报告**：正式报告按官方四档（`critical` / `high` / `medium` / `none`）；INV 与 Gate 不过不报

本插件 **不执行扫描**；**不收录** 具体 CVE 或历史公告条目。类型体系来自 Phone OS 共性，**不局限** 于某一厂商已公开漏洞清单。

## 何时使用

- 审计 OpenHarmony 或 **同类移动 OS** 的系统服务层 / 框架层 / 应用层
- 涉及：内核与驱动/HDF、IPC/SA 中继、沙箱隔离、权限实现、Ability/Want、媒体/消息解析、Ark/Web 运行时、近场·软总线·分布式、OTA/包管理、锁屏与密钥、UDMF/剪贴板/广播等
- 需要官方四档定级或判断是否投递

## 强制前置

1. **读 `shared/authorization.md`** — 未授权目标不启动  
2. **读 `shared/finding-schema.md`** — 字段结构、`severity_rule` 必填；本插件 `severity` 为官方四档（`critical|high|medium|none`），`confidence` 禁止 `low`  
3. 仓级 `shared/severity-policy.md` 的「只报 C/H」**不适用于**本插件  
4. **对齐机理类型**：`vuln_type` 仍属八类之一（`vuln-definitions`）

## 定级依赖

| 依赖 | 来源 |
|------|------|
| **官方公告机理类型** | 本插件 `references/mechanism-types.md`（越界写/UAF/权限绕过等；审计该类时必须打开对应小节） |
| Phone OS 攻击面形态 | 本插件 `references/phone-os-vuln-types.md` |
| **OH bounty 资产范围** | 本插件 `references/asset-scope.md`（官方名单） |
| OH 组件 → 类型索引 | 本插件 `references/attack-surfaces.md` |
| 系统四档 / 术语 | `references/severity-levels.md`、`references/terminology.md` |
| 调整与无效 | `references/adjustment-and-invalid.md` |
| 门禁与报告 | `references/gates.md` |
| 八类机理定义 | `vuln-definitions` → `references/<type>.md` |
| CVSS v3.1 / v4.0 | `vuln-scoring`（OH 语境默认 3.1，可按需 4.0） |

## 范围与报告

- **只挖**：官方 bounty 名单内、且 **master 仍活跃（或已转到后继仓现树）** 的在册自研组件；默认配置下可由远程（含同网/近场/无线/文件消息）或普通三方应用触达，且能演示实害、危害强于已有权限。实时名单里的停更/旧名仓不当活跃树  
- **报告**：官方四档 `critical` / `high` / `medium` / `none`（低危）  
- **明确不报**：名单外仓库、在册三方/上游 linux 树（INV4）、厂商/测试文档工具链、system/root/native 前提、未证明二次洞、IPC 半链、权限等价、单应用临时 DoS、非默认 skip、解锁 BL 主路径等（见 ADJ/INV）

## 定级工作流

```
1. 攻击者模型：远程（未装 App，含同网/近场/无线/消息文件）或本地（普通三方 HAP）？
2. asset-scope.md：落点仓是否在官方名单、是否停更/旧名、属哪一桶（不在册 / 在册停更 / 三方 / 上游内核 / 厂商 / 非运行时 → 停或找后继）
3. mechanism-types.md 定机理（先查 §9 公告用语全表；MW/MR/UAF/NPD/IO/SO/HO/TC/DF/RACE/IV/AUTHZ/BYPASS/PATH/FILE/LEAK/ML/CRYPTO/UNINIT/MMAP/DOS）
4. phone-os-vuln-types.md 定形态（K/I/S/P/E/F/B/M/W/N/U/X）
5. attack-surfaces.md 对照 OH 组件（若目标为 OH）
6. gates.md：**S 资产范围** → **V 活树/最新公开版本** → A 攻击者 → B 默认可达 → C 直接实害 → D 链闭合
7. 八类 references/<type>.md 确认 `vuln_type` 成立
8. severity-levels.md 匹配 严重→高危→中危→低危
9. adjustment-and-invalid.md 查降级/无效
10. 官方四档且 confidence≥medium、Gate 全过 → 输出 finding（附 CVSS，默认 v3.1）
11. 无效 / Gate 不过 → 记否决原因
```

## 输出（定级场景）

```yaml
vuln_type: <type|none>          # 八类
mechanism: <如 UAF|MW|AUTHZ>   # 公告机理，见 mechanism-types.md
phone_os_class: <如 I1|S1|M1a> # Phone OS 形态 ID
asset_repo: <官方名单仓名>      # 如 communication_dsoftbus
asset_scope: in_list_first_party | in_list_stale | in_list_third_party | in_list_upstream_kernel | in_list_vendor | in_list_non_runtime | not_in_list
subject_revision: "<仓>@<sha>"  # Job 钉扎
live_checked: "<后继仓>@<sha> <日期> | not_checked"
severity: critical | high | medium | none
confidence: high | medium | low
severity_rule: "severity-levels.md#H5"
rationale: |
  资产桶；Phone OS 类型；路径与影响；条款；ADJ/INV
reportable: true | false   # 官方四档且 confidence≠low 为 true；INV / Gate 不过为 false
```

## 文件清单

| 文件 | 说明 |
|------|------|
| [asset-scope.md](references/asset-scope.md) | **OH bounty 资产范围**：官方实时名单 + 分桶 |
| [mechanism-types.md](references/mechanism-types.md) | **官方公告机理**：2021–2026 自研披露用语全表 + 每类定义（越界/UAF/权限绕过/路径穿越/SA 中继/明文 PIN 等） |
| [phone-os-vuln-types.md](references/phone-os-vuln-types.md) | **Phone OS 攻击面形态**（K/I/S/P/… 主类型表） |
| [attack-surfaces.md](references/attack-surfaces.md) | OH 组件 → 类型索引 |
| [terminology.md](references/terminology.md) | 远程/本地/TCB；同网算远程 |
| [severity-levels.md](references/severity-levels.md) | 官方四档 + 影响语映射 |
| [adjustment-and-invalid.md](references/adjustment-and-invalid.md) | 调整 10 + 无效 9 + 强前提 |
| [gates.md](references/gates.md) | Gate A–D + **S 资产范围** + **V 活树** + 报告话术 |
