# OpenHarmony / Phone OS 系统漏洞定义指南（vuln-definitions-oh）

独立 plugin：面向 **OpenHarmony 及同类移动 OS** 的定级语义源。  
在 OH 官方四档（严重/高危/中危/低危）之上，提供 **Phone OS 通用漏洞类型**（对齐 Android / iOS 同类形态），覆盖系统服务层、框架层、应用层。

## 安装

```text
/plugin install vuln-definitions-oh@DeepSonar-Skills
```

审计时建议同时安装 `vuln-definitions`（八类机理）+ `vuln-scoring`（CVSS v4.0）。

## 内容

| 文件 | 说明 |
|------|------|
| `skills/vuln-definitions-oh/SKILL.md` | 入口：角色、工作流、输出 |
| `references/phone-os-vuln-types.md` | **主类型表**：内核/IPC/沙箱/权限/导出组件/文件/广播/媒体/Web/无线/安装/UI 等 |
| `references/attack-surfaces.md` | OH 组件族 → 类型 ID 索引 |
| `references/terminology.md` | 远程/本地/TCB；同网算远程 |
| `references/severity-levels.md` | 官方四档条款 + 影响语映射 |
| `references/adjustment-and-invalid.md` | 级别调整 + 无效 + 强前提 |
| `references/gates.md` | Gate A–D + 报告要求 |

## 规则

- **Phone OS 共性优先**：类型体系不局限某一厂商历史披露；OH 是落地目标与四档口径来源  
- **只报 C/H**：正式报告仅 `critical`/`high`  
- **无效即停**：强前提 / INV 直接 `none`  
- **定性定量分离**：本插件定性；CVSS v4.0 由 `vuln-scoring` 负责  
- **不收录具体 case**：无 CVE、无历史公告摘录  

## 与 vuln-definitions 的关系

- **机理**（injection/rce/ssrf/…）→ `vuln-definitions`  
- **系统四档 + Phone OS 形态** → 本插件（`openharmony.md` 为精简镜像）  

## 语义基线

- 定级口径：OpenHarmony 安全漏洞奖励计划（2026-05）  
- 类型覆盖：移动操作系统通用攻击面（Android / iOS / OH 同型问题，抽象定义）  
