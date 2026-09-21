# 数据库漏洞形态主表（db-vuln-types.md）

按形态归类数据库领域漏洞；先定形态（本文件），再映射八类 `vuln_type`（`vuln-definitions`），再按 `severity-levels.md` 定档。目录索引见 `attack-surfaces.md`。

形态 ID 供 finding 的 `db_class` 字段使用。

---

## A · 认证与接入（Authentication & Access）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| A1 | 认证绕过 / 无凭据会话 | password / Kerberos / LDAP / JWT 缺陷 | C2 |
| A2 | default 用户无密码 + 暴露 | 默认配置缺陷 | C1 前提 |
| A3 | 会话 / 令牌固定或重放 | 认证链 | C2 / M4 |
| A4 | Interserver / 集群凭据缺陷 | 集群协议 | H8 |

映射：`authz`（多数）、`secrets`（凭据泄露）。

## P · 权限模型（RBAC / Policy）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| P1 | GRANT 语义绕过 | 权限检查逻辑 | H2 |
| P2 | row policy / 行策略绕过 | 行级过滤缺失或被绕过 | H2 |
| P3 | 列掩码 / column mask 绕过 | 脱敏失效 | H2 |
| P4 | settings profile / constraint 绕过 | 限制被绕过（如 readonly） | H2 / M3 |
| P5 | 云平台角色 / 作用域绕过 | org / project / API key 作用域 | C3 / H4 |
| P6 | 缓存键未纳入安全上下文 | query cache / result cache 键缺 role、row policy、settings → 跨角色 / 跨设置读到他人结果（对照 CVE-2024-22412 类；同用户跨角色默认低档，跨用户 H2+） | M3 / L1 / H2 |

映射：`authz`。

## Q · 查询处理（Query Processing）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| Q1 | SQL 解析 / 执行内存破坏 | 解析器、表达式、聚合、join | C5 / H1（受前提定） |
| Q2 | 恶意函数 / UDF 逃逸 | executable UDF、script 引擎 | H1 |
| Q3 | 二次注入 / 标识符注入 | 拼接生成 SQL | H3 |
| Q4 | 查询级信息泄露 | 错误消息、堆栈、计时侧信道 | M1 |

映射：`injection`（Q3）、`rce`（Q2）、`authz`（Q4 结合权限）。

## S · 存储引擎与数据格式（Storage & Formats）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| S1 | 数据文件 / part 损坏解析内存破坏 | MergeTree part 读写、压缩/转码 | C5 / H1 |
| S2 | 输入格式解析器内存破坏 | CSV / JSONEachRow / Parquet / ORC 等 | C5 / H1 |
| S3 | codec / 转码缺陷 | 加密、压缩 codec | H1 / M5 |
| S4 | 字典 / 外表加载缺陷 | 不可信字典源 | H1 / H3 |

映射：`rce`（内存破坏归 rce）、`injection`。

## X · 外部访问与表函数（External Access）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| X1 | 表函数 SSRF | url / s3 / remote / file 表函数 | H5（云）/ M6（盲） |
| X2 | 文件读写越界 | file 表函数、备份路径 | C4 / H2（file-access） |
| X3 | UDF / 可执行体 / 脚本沙箱逃逸 | catBoost / executable script / library-bridge / 外部脚本引擎（对照 CVE-2025-1385、Groovy/Lua/Java UDF 沙箱逃逸族） | H1 |
| X4 | 出网数据外带 | 任意 URL 写 / webhook 滥用 | H5 / H7 |

映射：`ssrf`（X1/X4）、`file-access`（X2）、`rce`（X3）。

## R · 复制与集群（Replication & Cluster）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| R1 | Keeper / 协调服务缺陷 | ZooKeeper 兼容协议 | H8 / H2 |
| R2 | 复制协议节点冒充 | 节点间认证 | H8 |
| R3 | 分布式表越权 | 集群内转发查询权限 | H2 |

映射：`authz`、`rce`。

## C · 云控制面（Cloud Control Plane）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| C1 | 跨 org / 跨租户 IDOR | org / service / project id 可预测或未校验 | C3 |
| C2 | 同 org 越权 | 成员角色 / 资源归属校验缺失 | H4 |
| C3 | 集成 / webhook SSRF | 控制面外连功能 | H5 |
| C4 | API key 作用域 / 轮换缺陷 | 凭据管理 | H6 / M4 |
| C5 | 计费 / 配额绕过 | 商业逻辑 | M 档（通常非安全） |
| C6 | 控制面存储型 XSS | 注释 / 告警 / 集成名 | H7 |
| C7 | BYOC / 私有端点边界缺陷 | 控制面 → 数据面 | C3 / C4 |

映射：`authz`（C1/C2）、`ssrf`（C3）、`secrets`（C4）、`injection`（C6）。

## D · 数据泄露（Data Exposure）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| D1 | system 表敏感信息 | system.query_log / parts / users 等 | M1（多数被项目排除） |
| D2 | 备份 / 导出 / 日志泄露 | 备份配置、查询日志 | M5 / H6 |
| D3 | 错误消息信息泄露 | 堆栈 / 路径 / SQL 回显 | M1 |

映射：`secrets`、`authz`。

## F · 内存安全（Memory Safety）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| F1 | 未认证可达内存破坏 | 协议解析、HTTP handler | C1 / C5 |
| F2 | 认证后内存破坏 | 查询 / 格式 / codec | H1（受限用户）/ C5（评估可稳定控制执行流） |
| F3 | 整数溢出 / 越界 | 聚合、grouping、大参数 | 按 F1/F2 |
| F4 | UAF / double free | 生命周期管理 | 按 F1/F2 |

> ClickHouse Bugcrowd **不收纯 crash**：内存破坏必须展示可控执行流或泄露原语，纯 DoS 排除（见 `adjustment-and-invalid.md` INV 条款）。

映射：`rce`（多数内存安全归 rce 机理）。

## M · 配置与密钥（Config & Secrets）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| M1 | 弱默认 / 无认证默认 | default user 无密码、interserver 无密 | C1 前提（需展示现实暴露） |
| M2 | 硬编码 / 泄露凭据 | 仓库或镜像中的凭据 | H6 |
| M3 | 加密 / 密钥管理缺陷 | 磁盘加密、密钥轮换 | H6 / M5 |

映射：`secrets`。

---

## 归类优先级（边界情况）

1. **内存破坏 > 一切**：能稳定控制执行流 → F 族 + `rce`，不受「还需要 SQL 账号」降档影响过深（仍看前提）
2. **跨租户 > 同租户**：云平台上同时命中 C 族与 P 族时，先定 C 族
3. **绕过边界优先**：同一现象既可归「注入」又可归「越权」时，问「绕过的是哪条边界」——绕 SQL 权限 → P 族 authz；绕查询解释器 → Q 族 injection
4. **X1 SSRF 定档看实害**：能打 metadata / 内网管理面 + 拿凭据 → H5；仅探测 → M6
5. 拿不准归哪类 → `classification.md`（`vuln-definitions`）
