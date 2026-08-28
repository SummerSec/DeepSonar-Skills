# 报告策略（仓库级）

> **漏洞定义与四级定级标准不在本文件。**  
> 唯一语义源：独立插件 **`vuln-definitions`（漏洞定义模块）**  
> 路径：`vuln-definitions/skills/vuln-definitions/`

## 本仓报告什么（`wb-*` / `bb-*` 默认）

| 定级结果（按 vuln-definitions） | 是否写入正式 finding |
|--------------------------------|----------------------|
| Critical（严重） | ✅ 是 |
| High（高危） | ✅ 是 |
| Medium（中危） | ❌ 否（可记入进度否决） |
| None（无危害） | ❌ 否 |

OpenHarmony / Phone OS 走 `vuln-definitions-oh`、Chrome / Chromium 走 `vuln-definitions-chrome`、数据库（ClickHouse 等 DBMS / 数据库云平台）走 `vuln-definitions-db` 时见文末例外（官方四档均可报）。

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

- 只输出 `confidence: high | medium` 的可报 finding  
- `confidence: low` 不输出  
- 黑盒无回显需 OOB/时间/状态旁证才可达 medium+  

## 例外：OpenHarmony / Phone OS（`vuln-definitions-oh`）

仓级「只报 C/H」**不适用于**本例外。系统类正式 finding 的 `severity` 为官方四档 `critical` / `high` / `medium` / `low`。INV 与 Gate 不过仍不报（`reportable: false`）。`confidence` 仍禁止 `low`（与 `severity: low` 不是同一字段）。字段另填 `mechanism`、`phone_os_class`、`asset_repo`、`asset_scope`（见 `finding-schema.md`）。

## 例外：Chrome / Chromium（`vuln-definitions-chrome`）

仓级「只报 C/H」**不适用于**本例外。浏览器类正式 finding 的 `severity` 为官方四档 `critical` / `high` / `medium` / `low`（S0–S3）。非安全条款与 Gate 不过仍不报（`reportable: false`）。`confidence` 仍禁止 `low`。字段另填 `chrome_class`、`chrome_process`、`chrome_sandbox`、`security_impact`；可选 `vrp_eligible`（见 `finding-schema.md`）。纯 DoS / MiraclePtr PROTECTED / 物理本机 / AI 越狱不是低危，是不报。`vrp_eligible: false` 不阻止对内正式 finding。  

## 例外：数据库（`vuln-definitions-db`）

仓级「只报 C/H」**不适用于**本例外。数据库类（ClickHouse OSS / ClickHouse Cloud / Langfuse Cloud 及后续数据库目标）正式 finding 的 `severity` 为官方四档 `critical` / `high` / `medium` / `low`（Bugcrowd VRT P1–P4；P5 → 不报）。排除条款（DoS / 纯崩溃 / 缺限速 / 缺安全头 / 理论问题 / 实验特性等）与 Gate 不过仍不报（`reportable: false`）。`confidence` 仍禁止 `low`。字段另填 `db_class`、`target_asset`、`vrt_priority`；可选 `bounty_eligible`（见 `finding-schema.md`）。纯 DoS / 纯 crash / 理论影响不是低危，是不报。`bounty_eligible: false` 不阻止对内正式 finding；赏金表不改 `severity`。
