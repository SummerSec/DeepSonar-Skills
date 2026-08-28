---
name: vuln-definitions-db
description: "数据库领域漏洞定义指南。定义 DBMS 通用漏洞形态（认证接入 / 权限模型 RBAC / 查询处理 / 存储引擎 / 外部访问 UDF·表函数 / 复制与集群 / 云控制面多租户 / 数据泄露 / 配置密钥 / 内存安全），并把 Bugcrowd VRT P1–P5 映射为 critical/high/medium/low 四档；含 ClickHouse Bugcrowd 项目资产范围、OSS 合格条款、云平台排除项与赏金资格（不定级）。用户提到「ClickHouse 漏洞」「数据库漏洞」「DBMS」「SQL 注入定级」「RBAC 绕过」「row policy」「Keeper」「clickhouse-server」「ClickHouse Cloud」「Bugcrowd」「VRT」「P1 P2 P3」「Langfuse」或要给数据库类审计目标定级时使用。This skill should be used when the user asks to rate a database / DBMS vulnerability, classify RBAC or row-policy bypasses, map Bugcrowd VRT priorities to severity tiers, check ClickHouse Bugcrowd scope and eligibility, or audits ClickHouse OSS, ClickHouse Cloud, or other database targets."
---

# 数据库领域漏洞定义指南

## 角色

你是 **数据库（DBMS）领域漏洞的语义与定级指南**，落地目标是 **数据库引擎、数据库客户端与其云托管平台**。当前收录的厂商实例是 **ClickHouse**（OSS 引擎 + ClickHouse Cloud SaaS + Bugcrowd 项目内挂靠的 Langfuse Cloud）；后续数据库目标进本领域时 **只加厂商 reference 文件，不开新 plugin**。

完成：

1. **归类**：先定数据库形态（见 `db-vuln-types.md`），再映射八类 `vuln_type`
2. **定级**：严重 / 高危 / 中危 / 低危（`critical` / `high` / `medium` / `low`）— Bugcrowd 项目按 **VRT P1–P4** 对齐（P5 → 不报）
3. **裁定**：降档条款、排除条款（Bugcrowd out-of-scope）、Gate 门禁
4. **报告**：正式报告按官方四档；排除条款与 Gate 不过不报
5. **赏金资格**（可选）：对照 `bugcrowd-rules.md` 填 `bounty_eligible`；**赏金不改档**

本插件 **不执行扫描**；**不收录** 具体 CVE / issue；**不写** 可武器化 exploit。类型来自官方条款与数据库架构，**不**把嵌入式场景、非 server 组件、实验特性当成同一套档。

## 何时使用

- 审计 ClickHouse OSS（github.com/ClickHouse/ClickHouse，C++）、ClickHouse Cloud、Langfuse Cloud，或其它数据库引擎 / 数据库云平台
- 涉及：认证与接入（HTTP/TCP/native 协议、Kerberos/LDAP/JWT）、RBAC 与 row/column policy、查询解析与执行、MergeTree/字典/codec/格式化器、UDF 与表函数（file/url/s3/remote）、Keeper 与复制、云控制面（org/service/API key/集成）、system 表、备份与导出
- 需要按 Bugcrowd VRT（P1–P5）定级，或判断「这还算不算安全漏洞 / 合不合格」
- 已授权参与 ClickHouse Bugcrowd 项目：范围、速率限制、账号纪律、`bounty_eligible`（不定级）

## 强制前置

1. **读 `shared/authorization.md`** — 未授权目标不启动
2. **读 `shared/finding-schema.md`** — 字段结构、`severity_rule` 必填；本插件 `severity` 为官方四档（`critical|high|medium|low`），`confidence` 禁止 `low`（与 `severity: low` 不是同一字段）
3. 仓级 `shared/severity-policy.md` 的「只报 C/H」**不适用于**本插件
4. **对齐机理类型**：`vuln_type` 仍属八类之一（`vuln-definitions`）

## 定级依赖

| 依赖 | 来源 |
|------|------|
| VRT 四档映射 + 领域条款 | 本插件 `references/severity-levels.md` |
| 术语与威胁模型 | 本插件 `references/terminology.md` |
| 数据库形态主表 | 本插件 `references/db-vuln-types.md` |
| 目录 → 类型 | 本插件 `references/attack-surfaces.md` |
| 降档与排除 | 本插件 `references/adjustment-and-invalid.md` |
| 门禁与报告 | 本插件 `references/gates.md` |
| 资产范围 | 本插件 `references/asset-scope.md` |
| Bugcrowd 资格 / 纪律 | 本插件 `references/bugcrowd-rules.md` |
| 八类机理定义 | `vuln-definitions` → `references/<type>.md` |
| CVSS v3.1 / v4.0 | `vuln-scoring`（数据库语境默认 3.1，可按需 4.0） |

官方原文（对照用，不以记忆替代）：

- https://bugcrowd.com/engagements/clickhouse（项目页：范围 / 排除项 / 赏金表；对照日 2026-08-28）
- https://bugcrowd.com/vulnerability-rating-taxonomy（VRT）
- https://github.com/ClickHouse/ClickHouse/security/policy（支持版本与安全策略）
- https://clickhouse.com/docs/en/intro（文档）

## 范围与报告

- **只挖**：`asset-scope.md` 列出的 in-scope 资产（ClickHouse OSS 引擎、ClickHouse Cloud、Langfuse Cloud）；ClickHouse OSS 只认 **clickhouse-server** 组件、**支持版本**、**非实验特性**
- **报告**：官方四档 `critical` / `high` / `medium` / `low`（对应 VRT P1–P4）
- **明确不报**：DoS / 纯崩溃、纯理论无 PoC、静态分析器原始输出、依赖清单类、缺限速 / 缺安全头 / 版本泄露、Postgres offering 租户内隔离、learn.clickhouse.com、支持 / 聊天 / 反馈表单、第三方系统（见 `adjustment-and-invalid.md`）
- **Bugcrowd 纪律**：`@bugcrowdninja.com` 测试账号、禁扫描器、自定义测试 ≤5 req/s、发现 PII / shell → **立即停止并上报**（见 `bugcrowd-rules.md`）

## 定级工作流

```
1. 攻击者模型：未认证远程 / 认证受限 SQL 用户 / 恶意租户？本地 OS 管理员或物理访问 → 停
2. asset-scope.md：目标在 in-scope 清单？OSS 是否 clickhouse-server + 支持版本 + 非实验特性？
3. terminology.md 认清权限边界：default / readonly / granted / 管理员；云平台 org / service / API key 作用域
4. db-vuln-types.md 定形态（A/P/Q/S/X/R/C/D/F/M）
5. attack-surfaces.md 对照目录族（若有源码树）
6. gates.md：T 威胁模型 → S 资产范围 → E 环境合格 → C 安全实害 → R 可复现
7. 八类 references/<type>.md 确认 vuln_type 成立
8. severity-levels.md 匹配 严重→高危→中危→低危（Bugcrowd 项目同时给 vrt_priority）
9. adjustment-and-invalid.md 查降档 / 排除
10. 官方四档且 confidence≥medium、Gate 全过 → 输出 finding（附 CVSS，默认 v3.1）
11. 对照 bugcrowd-rules.md 填 bounty_eligible（赏金不改 severity）
12. 排除条款 / Gate 不过 → 记否决原因
```

## 输出（定级场景）

```yaml
vuln_type: <type|none>                 # 八类
db_class: <如 A1|P2|Q3|X1|C2>          # 数据库形态 ID
target_asset: clickhouse_oss | clickhouse_cloud | langfuse_cloud | <other-db>
vrt_priority: P1 | P2 | P3 | P4        # Bugcrowd 项目官方档；非 Bugcrowd 目标可省
bounty_eligible: true | false          # 对照 bugcrowd-rules.md；false 仍可 reportable
subject_revision: "<clickhouse|chromium…>@<version-or-sha>"   # OSS 钉扎版本
live_checked: "<channel> <version> <日期> | not_checked"
severity: critical | high | medium | low
confidence: high | medium              # 禁止 confidence: low；与 severity: low 勿混
severity_rule: "severity-levels.md#H2"
rationale: |
  攻击者模型；权限边界；形态；条款；ADJ/INV；赏金资格
reportable: true | false               # 官方四档且 confidence≠low 为 true；排除 / Gate 不过为 false
```

## 文件清单

| 文件 | 说明 |
|------|------|
| [severity-levels.md](references/severity-levels.md) | VRT P1–P5 → 四档映射 + 领域条款 |
| [terminology.md](references/terminology.md) | 威胁模型与术语（权限边界 / 租户模型） |
| [db-vuln-types.md](references/db-vuln-types.md) | 数据库形态主表 |
| [attack-surfaces.md](references/attack-surfaces.md) | ClickHouse 目录族与云攻击面索引 |
| [adjustment-and-invalid.md](references/adjustment-and-invalid.md) | 降档 + 排除条款 |
| [gates.md](references/gates.md) | Gate + 报告要求 |
| [asset-scope.md](references/asset-scope.md) | 资产范围（OSS / Cloud / Langfuse） |
| [bugcrowd-rules.md](references/bugcrowd-rules.md) | Bugcrowd 项目纪律 / 赏金表 / 资格（不定级） |
