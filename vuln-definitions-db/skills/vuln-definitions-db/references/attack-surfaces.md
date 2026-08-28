# 攻击面索引（ClickHouse 源码目录族 + 云控制面）

白盒审计 ClickHouse OSS 时按目录定位形态（`db-vuln-types.md`）；黑盒审计云平台时按功能面定位。目录族是 **索引不是清单**：核心在 `src/` 下，`contrib/` 的三方库问题须证明在出货路径可达。

---

## 1. ClickHouse OSS 源码目录族（C++）

| 目录族 | 关注内容 | 形态 |
|--------|----------|------|
| `src/Parsers/`, `src/Analyzer/` | SQL 解析、语法树、查询重写 | Q1 / F2 |
| `src/Interpreters/` | 执行计划、权限检查（AccessRights）、`InterpreterSelectQuery` 等各种 Interpreter、**query cache 键构造**（CVE-2024-22412 类：键缺安全上下文） | P1 / P2 / P6 / Q3 |
| `src/Access/` | RBAC、GRANT 语义、row policy、quota、settings profile | P1–P4 |
| `src/Functions/`, `src/AggregateFunctions/` | 标量/聚合函数实现，参数校验 | Q1 / F2 / F3 |
| `src/Formats/` | 输入输出格式（CSV / JSONEachRow / Parquet / ORC / Avro…）——**不可信数据第一站，历史重灾区** | S2 / F2 |
| `src/Compression/`, `src/Encryption/` | **codec 解压路径未认证可达**（Gorilla / T64 / FPC 历史三连发）；加密（encryption_codecs） | S3 / F1 / F2 / M3 |
| `src/Storages/` | MergeTree 族、外部引擎（Kafka / MySQL / PostgreSQL…）、视图 | S1 / X3 / R3 |
| `src/TableFunctions/` | file / url / s3 / remote / mysql / postgresql 表函数 | X1 / X2 / X4 |
| `src/Dictionaries/` | 外部字典（executable / http / redis 源） | S4 / X3 |
| `src/Server/` | HTTP handler、**TCPHandler（native 协议，认证前处理面；CVE-2024-6873 类未认证控制流劫持）**、Interserver、MySQL/PostgreSQL 兼容协议 | A1 / A4 / F1 |
| `src/Bridge/`（library-bridge / odbc-bridge） | **localhost HTTP API 输入校验**（CVE-2025-1385 类：与表引擎文件上传组合成 RCE 链） | X3 |
| `src/Disks/` | 磁盘抽象、S3 / Azure blob 后端 | X2 / M3 |
| `src/Common/`, `src/IO/` | 基础库、缓冲、压缩流 | F1–F4 |
| `src/Coordination/`, `programs/keeper` | Keeper（ZooKeeper 兼容） | R1 / R2 |
| `programs/server`, `src/Daemon/` | server 入口、配置加载 | M1 / F1 |

> 记住：**只认 clickhouse-server**；client / local / benchmark 工具的问题不合格（`gates.md` Gate S）。

---

## 2. ClickHouse Cloud 控制面（黑盒）

| 功能面 | 关注点 | 形态 |
|--------|--------|------|
| org / 成员管理 | 邀请链接、角色枚举、成员 API 越权 | C1 / C2 |
| service 管理（启停 / 扩缩 / IP 过滤） | service id 越权、配置注入、私有端点 | C1 / C7 |
| API key 管理 | 作用域绕过、key 回显、轮换 | C4 |
| 集成（S3 / GCS / BI / webhook） | SSRF、凭据回显 | C3 / C4 |
| SQL Console / 查询接口 | SQL 注入、跨 service 查询 | Q3 / C1 |
| 共享 / 导出（query link、结果分享） | 未鉴权访问链接 | C1 / D2 |
| 计费 / 配额 | 业务逻辑 | C5 |
| SSO / 身份联合 | 断言处理、账户链接 | A1 / C1 |

---

## 3. Langfuse Cloud 控制面（黑盒）

| 功能面 | 关注点 | 形态 |
|--------|--------|------|
| org / project 权限 | 跨 project 访问（org > project 两级租户） | C1 / C2 |
| trace / session / prompt 数据 | IDOR（可预测 id、缺对象级鉴权） | C1 / C2 |
| API key（public / secret） | 作用域、前缀泄露、sk-lf- 令牌处理 | C4 |
| INGESTION API | 越权写入他人 project、注入 | C2 / Q3 |
| prompt management / playground | 注入、跨 project 泄露 | C1 / C6 |
| SSO / 邀请 | 链接枚举、账户接管 | A1 / C1 |
| webhook / 集成 | SSRF | C3 |

---

## 4. 使用方式

- 白盒：目录 → 形态 → `db-vuln-types.md` 详情 → `severity-levels.md` 定档
- 黑盒：功能面 → 形态 → 同上
- 三方库（`contrib/`）：先证明出货路径可达 + 非实验特性，再定档；否则对内记录
