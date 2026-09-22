# 数据库领域（DBMS / 数据库云平台）定级规则

本文件为 **数据库领域（DBMS 引擎与数据库云平台，当前厂商实例 ClickHouse）** 的定级**摘要索引**（供不装 `vuln-definitions-db` 时快速对照；条款编号与插件一致）。  
审计目标为 **ClickHouse OSS / ClickHouse Cloud / Langfuse Cloud 或其它数据库引擎 / 数据库云平台** 时，**权威条款在 `vuln-definitions-db/references/severity-levels.md`**：与全局 `severity-levels.md` / `<type>.md` 冲突时，数据库语义以插件条款为准；**本摘要与插件不一致时以插件为准**。

> 语义基线：[Bugcrowd VRT](https://bugcrowd.com/vulnerability-rating-taxonomy) + [ClickHouse 项目页](https://bugcrowd.com/engagements/clickhouse)（对照日 2026-08-28）。  
> 完整形态表、门禁、资产范围与 Bugcrowd 纪律见插件 `vuln-definitions-db`。赏金表 **不** 改本文件档位。

---

## 1. 何时使用

- 目标是数据库引擎（ClickHouse OSS，或未来收录的 MySQL / PostgreSQL / MongoDB / Redis / …）或数据库云平台（ClickHouse Cloud、Langfuse Cloud）
- finding 涉及：认证接入、RBAC / row policy / 列掩码、SQL 解析与执行、MergeTree / 格式 / codec、UDF 与表函数、Keeper 与复制、云控制面多租户、system 表、备份导出
- 需要对照 Bugcrowd VRT（P1–P5）定档，或判断是否合格 / 排除
- 已授权参与 ClickHouse Bugcrowd 项目时：范围 / 纪律 / `bounty_eligible` 见完整插件 `bugcrowd-rules.md`（本文件不定资格）

---

## 2. 术语（要点）

| 术语 | 定义 |
|------|------|
| 未认证远程攻击者 | 网络可达无凭据（HTTP / native TCP / Interserver / 云公网接口） |
| 认证受限用户 | readonly / granted / 行列受限 SQL 账号；云平台普通成员 |
| 恶意租户 | 云平台另一 org / project；**跨租户 ≫ 同租户越权** |
| 权限边界 | SQL 权限（GRANT / row policy / 掩码）与租户边界（org / project / service）两层 |
| clickhouse-server | OSS 唯一合格组件；client / local 不合格 |
| 支持版本 / release 构建 / 非实验特性 | OSS 合格三条件（见 Security Policy） |
| VRT | Bugcrowd Vulnerability Rating Taxonomy，P1–P5 |

**不在威胁模型**：本地 OS 管理员 / 物理访问；管理员自伤；纯 DoS。

---

## 3. 四档危害（领域条款）

> Bugcrowd 项目按 VRT 定官方档（P1–P4 → critical/high/medium/low；P5 → 不报）。  
> 走 `vuln-definitions-db` 时 **官方四档均可写入正式 finding**。仓级「只报 C/H」不适用。排除条款与 Gate 不过仍不报，不要把低危写成 `none`。

| 档 | 本仓映射 | VRT | 一句话 |
|----|----------|-----|--------|
| 严重 | `critical` | P1 | 未认证远程沦陷级；跨租户沦陷；受限用户 → 系统沦陷 |
| 高危 | `high` | P2 | 认证受限用户 RCE / 权限模型绕过；同租户越权；SSRF 实害 |
| 中危 | `medium` | P3 | 有限信息泄露；需多前提的绕过；盲 SSRF |
| 低危 | `low` | P4 | 复杂前提低敏越权；自身账号轻微缺陷 |

### 严重（P1 → critical）

| # | 判定条件 |
|---|----------|
| C1 | 未认证远程代码执行（无凭据网络可达 server 或云公网接口） |
| C2 | 认证绕过 / 无凭据会话 / 账号接管 |
| C3 | 跨租户沦陷：A 租户读写 / 接管 B 租户数据、服务、集成凭据（含 BYOC 边界） |
| C4 | 受限用户 → 系统沦陷（OS shell / 服务器管理 / 集群管理面） |
| C5 | 未认证可达且可稳定控制执行流的内存破坏 |

### 高危（P2 → high）

| # | 判定条件 |
|---|----------|
| H1 | 认证受限用户 RCE（UDF / 表函数 / codec / 字典等链路） |
| H2 | 权限模型绕过：GRANT / row policy / 列掩码 / settings profile 被绕过 |
| H3 | SQL / 查询注入（控制面或查询接口，读敏感数据或绕权限） |
| H4 | 云平台同租户越权（普通成员管理他人资源 / 读凭据） |
| H5 | SSRF 实害（打内网 / metadata、拿凭据或触管理面） |
| H6 | 可接管级凭据泄露 |
| H7 | 存储型 XSS 打他人（self / POST 反射被排除） |
| H8 | 复制 / 集群协议认证绕过（凭据伪造 / 节点冒充） |

### 中危（P3 → medium）

| # | 判定条件 |
|---|----------|
| M1 | 有限信息泄露（低敏元数据、内部路径 / 堆栈） |
| M2 | 云平台低敏 IDOR |
| M3 | 需管理员误配置 + 特定交互才可达的绕过 |
| M4 | 影响有限的会话 / 令牌缺陷 |
| M5 | 备份 / 导出 / 日志部分数据暴露 |
| M6 | 盲 SSRF（仅探测） |

### 低危（P4 → low）

| # | 判定条件 |
|---|----------|
| L1 | 需受害者高度配合的低敏越权 |
| L2 | 自身账号内轻微安全含义的配置缺陷 |
| L3 | 轻微安全含义的 UI / 逻辑缺陷 |

---

## 4. 级别调整（命中即下调或不合格）

| # | 条款 | 对本模块含义 |
|---|------|--------------|
| ADJ1 | 需管理员主动误配置 | 通常降一档 |
| ADJ2 | 仅实验特性 / 旗标可达 | OSS **不合格**（非降档） |
| ADJ3 | 受害者高度配合的交互链 | 降一档 |
| ADJ4 | 仅理论影响未演示 | P5 / 不报 |
| ADJ5 | 仅本地 OS 管理员可达 | 不在威胁模型 |
| ADJ6 | 泄露仅为低敏元数据 | 降到 M1 / P3 |
| ADJ7 | 仅影响自己账号 / 自伤 | 不报 |
| ADJ8 | 已修复于最新版 / 不再支持版本 | 不报（须在支持版本可复现） |
| ADJ9 | 利用链上的单环 | 看整链定档 |
| ADJ10 | 野外利用 / 已公开 | 只提优先级，不改档 |
| ADJ11 | 影响仅限排除目标（learn.clickhouse.com、支持表单等） | 不报 |
| ADJ12 | Postgres offering 租户内隔离 | 不报，除非跨租户 |

## 5. 排除（Bugcrowd 明文，命中即停）

| # | 条款 |
|---|------|
| INV1 | DoS / DDoS；资源耗尽、纯崩溃、crash-only 内存破坏 |
| INV2/3/4 | 缺限速（无实害）/ 缺安全头 / 版本披露 |
| INV5/6 | EXIF 地理位置 / 邮件安全记录缺失（SPF / DKIM / DMARC） |
| INV7 | POST 反射 XSS / self-XSS |
| INV8/9/10 | 社工与物理攻击 / 支付处理 / 第三方系统（非 ClickHouse 资产） |
| INV11 | 依赖清单（过时依赖列表），除非有 PoC 证明可严重利用 |
| INV12/13 | 静态分析器 / 扫描器原始输出（无人工验证）/ 理论问题 |
| INV14 | 已发表 / 他人已报（重复） |
| INV15/16/17/18 | system 表不可利用枚举 / 客户端组件 / 非 release 构建 / 环境依赖 |
| INV19 | 未在支持版本可复现（Security Policy） |
| INV20 | Play HTTP 服务器（默认本地 setup）的 Web 漏洞（clickjacking / CSRF / 缺头等） |
| INV21 | 对真实用户 / 客户数据的破坏性验证 |
| INV22/23 | learn.clickhouse.com、支持 / 聊天 / 反馈表单；未列出的子域与资产（范围外，可报无赏金） |

编号与插件一致（ADJ1–ADJ12 / INV1–INV23）；完整条款文字见 `vuln-definitions-db` 的 `adjustment-and-invalid.md`。

---

## 6. 数据库类型与攻击面（摘要）

完整定义见 `vuln-definitions-db` 的 **`db-vuln-types.md`**。目录索引见 `attack-surfaces.md`。

| 类型簇 | 例 | 条款倾向 |
|--------|-----|----------|
| 认证接入 | 认证绕过、default 无密码暴露、Interserver | C1 / C2 / H8 |
| 权限模型 | GRANT / row policy / 列掩码 / settings profile 绕过 | H2 |
| 查询处理 | SQL 解析内存破坏、UDF 逃逸、二次注入 | C5 / H1 / H3 |
| 存储与格式 | MergeTree part、格式解析器、codec | C5 / H1 |
| 外部访问 | 表函数 SSRF、文件读写越界、UDF 可执行体 | H5 / H1 / C4 |
| 复制集群 | Keeper、节点冒充、分布式表越权 | H8 / H2 |
| 云控制面 | 跨租户 IDOR、集成 SSRF、API key 作用域 | C3 / H4–H6 |
| 内存安全 | 协议 / 查询 / 格式解析内存破坏 | C1 / C5 / H1 |
| 配置密钥 | 弱默认、硬编码凭据、密钥管理 | C1 前提 / H6 |

**归类纪律**：内存破坏 > 一切（可控执行流 → F 族 rce）；跨租户 > 同租户；先问「绕过的是哪条边界」。

---

## 7. 报告与定级纪律

- 定级前先跑 Gate：**威胁模型 → 资产范围 → 环境合格 → 安全实害 → 可复现**（完整见 `gates.md`）
- `severity_rule` 权威锚点为 `vuln-definitions-db/references/severity-levels.md#H2`（本摘要的 `database.md#H2` / `#INV1` 为等价锚点）。另填 `db_class`、`target_asset`、`vrt_priority`；可选 `bounty_eligible`（见 `shared/finding-schema.md`）
- 与 CVSS：本文件定性；量化用 `vuln-scoring`（默认 v3.1）。CVSS **不得**单独抬档
- **不收录具体 case**：无 CVE / issue 清单
