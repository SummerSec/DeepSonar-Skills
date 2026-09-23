# 数据库领域漏洞定义指南（vuln-definitions-db）

独立 plugin：面向 **数据库（DBMS）引擎与数据库云平台** 的定级语义源。
定义 DBMS 通用漏洞形态（认证接入 / 权限模型 / 查询处理 / 存储引擎 / 外部访问 / 复制集群 / 云控制面 / 数据泄露 / 配置密钥 / 内存安全），并把 **Bugcrowd VRT P1–P5** 映射为四档；收录厂商实例 **ClickHouse**（OSS 引擎 + ClickHouse Cloud + Bugcrowd 项目内挂靠的 Langfuse Cloud）。

**领域化规则**：新数据库目标（MySQL / PostgreSQL / MongoDB / Redis / …）进本领域时 **只加厂商 reference 文件**，不开新 plugin。

**厂商文件现状**：ClickHouse 由 `references/asset-scope.md`（资产范围）与 `references/db-vuln-types.md`（形态）覆盖，未单列 `vendor-clickhouse.md`；Langfuse Cloud 单列 `references/vendor-langfuse.md`。后续新厂商一律用单列 `vendor-<name>.md`。

**不是** `wb-*`/`bb-*` 的 Web 应用八类细则；**不是** 浏览器 / 移动 OS 领域定级。

## 安装

```text
/plugin install vuln-definitions-db@DeepSonar-Skills
```

## 内容

| 文件 | 说明 |
|------|------|
| `SKILL.md` | 入口：角色、工作流、输出 |
| `references/severity-levels.md` | VRT P1–P5 → 四档 + 领域条款 |
| `references/terminology.md` | 威胁模型：权限边界 / 租户模型 / 实验特性 |
| `references/db-vuln-types.md` | 数据库形态主表（A/P/Q/S/X/R/C/D/F/M） |
| `references/attack-surfaces.md` | ClickHouse 源码目录族 + 云控制面攻击面 |
| `references/adjustment-and-invalid.md` | 降档条款 + Bugcrowd 排除项 |
| `references/gates.md` | Gate T/S/E/C/R + 报告要求 |
| `references/asset-scope.md` | 资产范围：OSS / Cloud / Langfuse + 范围外 |
| `references/bugcrowd-rules.md` | Bugcrowd 纪律 / 赏金表 / 资格（不定级） |
| `references/history-patterns.md` | 历史漏洞模式库（ClickHouse 官方案例 + 其他 DBMS 经典模式）+ 定级校准 K1–K6 + 挖掘切入点 |
| `references/vendor-langfuse.md` | Langfuse Cloud 厂商文件：资产 / 报告要求 / 安全架构特征（认证模型·SSRF 防线）/ 挖掘候选 |

## 规则

- **官方四档均可报**：正式报告含 `critical`/`high`/`medium`/`low`（VRT P1–P4）；排除条款与 Gate 不过不报
- **无效即停**：DoS / 纯崩溃、理论问题、无 PoC 的静态分析、依赖清单、缺限速 / 缺安全头 → `reportable: false`（不要写成低危）
- **定性定量分离**：本插件定性；CVSS（默认 v3.1，可按需 v4.0）由 `vuln-scoring` 负责
- **权限边界改变档位**：未认证远程 RCE ≠ 认证受限用户 RCE ≠ 管理员自伤；跨租户 ≠ 同租户越权
- **实验特性不合格**：需 experimental 特性 / 旗标、非 CI release 构建、依赖特定环境的 OSS 问题 → 不进正式报告
- **不收录具体 case**：无 CVE、无 issue 清单；类型来自官方条款与数据库架构的抽象归纳
- **赏金 ≠ 定级**：`bounty_eligible` 只回答能不能按 ClickHouse Bugcrowd 拿赏金；金额以项目页为准，不抬 / 压 `severity`

## 与 vuln-definitions 的关系

- **机理**（injection/rce/ssrf/authz/…）→ `vuln-definitions`（八类）
- **数据库四档 + 形态** → 本插件（`database.md` 为精简镜像）

## 语义基线

- 项目页（范围 / 排除项 / 赏金表）：[Bugcrowd ClickHouse](https://bugcrowd.com/engagements/clickhouse)（对照日 2026-08-28）
- 定级口径：[Bugcrowd VRT](https://bugcrowd.com/vulnerability-rating-taxonomy)
- 支持版本与安全策略：[ClickHouse Security Policy](https://github.com/ClickHouse/ClickHouse/security/policy)
- ClickHouse 文档：https://clickhouse.com/docs/en/intro
