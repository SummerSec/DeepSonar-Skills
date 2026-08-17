# OpenHarmony / Phone OS 系统漏洞定义指南（vuln-definitions-oh）

独立 plugin：面向 **OpenHarmony 及同类移动 OS** 的定级语义源。  
在 OH 官方四档（严重/高危/中危/低危）之上，提供 **Phone OS 通用漏洞类型**（对齐 Android / iOS 同类形态），覆盖系统服务层、框架层、应用层。

## 安装

```text
/plugin install vuln-definitions-oh@DeepSonar-Skills
```

审计时建议同时安装 `vuln-definitions`（八类机理）+ `vuln-scoring`（CVSS v3.1/v4.0）。

## 内容

| 文件 | 说明 |
|------|------|
| `skills/vuln-definitions-oh/SKILL.md` | 入口：角色、工作流、输出 |
| `references/asset-scope.md` | **资产范围**：官方 bounty 实时名单 + 分桶 |
| `references/phone-os-vuln-types.md` | **主类型表**：内核/HDF/IPC/沙箱/权限实现/Ability/文件·UDMF/广播/媒体/Ark·Web/近场·软总线/OTA/UI 等 |
| `references/attack-surfaces.md` | OH 组件族 → 类型 ID 索引 |
| `references/terminology.md` | 远程/本地/TCB；同网算远程 |
| `references/severity-levels.md` | 官方四档条款 + 影响语映射 |
| `references/adjustment-and-invalid.md` | 级别调整 + 无效 + 强前提 |
| `references/gates.md` | Gate S（资产）+ **V（活树）** + A–D + 报告要求 |

## 规则

- **Phone OS 共性优先**：类型体系不局限某一厂商历史披露；OH 是落地目标与四档口径来源  
- **只报 C/H**：正式报告仅 `critical`/`high`  
- **无效即停**：强前提 / INV 直接 `none`  
- **定性定量分离**：本插件定性；CVSS（默认 v3.1，可按需 v4.0）由 `vuln-scoring` 负责  
- **资产以官方名单为准**：`https://bugbounty.openharmony.cn/bug-bounty/openharmony/sync/repositories`；不在册不投递；`third_party_*` / 上游 linux 树默认 INV4  
- **在册 ≠ 活跃树**：官方实时名单也会挂停更/旧名仓；须过 Gate V，现树已修则不投递  
- **不收录具体 case**：无 CVE、无历史公告摘录；类型覆盖可对照官方月报**第一张表（自研）**做缺口检查  

## 与 vuln-definitions 的关系

- **机理**（injection/rce/ssrf/…）→ `vuln-definitions`  
- **系统四档 + Phone OS 形态** → 本插件（`openharmony.md` 为精简镜像）  

## 语义基线

- 定级口径：OpenHarmony 安全漏洞奖励计划（2026-05）  
- 资产范围：奖励计划同步仓库名单（仅实时接口，不检入仓列表）  
- 类型覆盖：移动操作系统通用攻击面（Android / iOS / OH 同型问题，抽象定义）  
