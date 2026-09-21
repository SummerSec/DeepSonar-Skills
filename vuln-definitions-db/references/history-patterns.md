# 历史漏洞模式库（history-patterns.md）

把历史真实案例提炼为 **模式**，用于两件事：① 挖掘时的高 ROI 切入点；② 定级校准（官方对同类问题的真实档位）。

> 纪律：本文件是 **模式归纳**，不是 CVE 清单；案例仅作定级锚点，不替代 `severity-levels.md` 条款。
> 数据基线：ClickHouse 官方 [Security Advisories](https://github.com/ClickHouse/ClickHouse/security/advisories)（对照日 2026-08-28）+ 业界公认数据库漏洞模式。
> 形态 ID 见 `db-vuln-types.md`；条款见 `severity-levels.md`。

---

## 1. ClickHouse 历史案例（含 Bugcrowd 渠道产出）

ClickHouse 官方 GHSA 数量少但模式集中；其中 **多条来自 Bugcrowd 渠道**，直接证明下列方向有真实产出。

| 模式 | 案例 | 官方档 | 形态 | 条款 |
|------|------|--------|------|------|
| **codec 解压路径未认证内存破坏** | Gorilla 堆溢出 / T64 堆溢出 / FPC 整数下溢→栈溢出（同日三条，2023-12） | High / High / Moderate | S3+F2 | C5 / F2 |
| **未认证 native 协议控制流劫持** | CVE-2024-6873：特殊构造请求重定向执行流（256B 窗口，无完整 RCE 也评 High）；**Bugcrowd 渠道** | High | A4+F1 | C5 |
| **外置 bridge / UDF 动态加载链 RCE** | CVE-2025-1385：library-bridge（localhost HTTP API）+ 表引擎文件上传 → 动态加载任意库执行；需两项表引擎权限 | High（CVSS4 7.5, PR:H） | X3 | H1 |
| **缓存键未纳入安全上下文** | CVE-2024-22412：query cache 键只含 userName 不含 role，同用户切角色后读到他人 row policy 缓存行；**Bugcrowd 渠道** | Low（CVSS3 2.4, AV:A/PR:H） | P6 | 见 §3 校准 |
| **HTTP 头 CRLF 注入** | HTTP header CRLF injection（2025-04） | Moderate | A4 | M 档 |

**方向启示**：

1. **解压 / 解析是不可信数据的第一站**：codec、输入格式、协议帧——未认证可达的内存安全重灾区
2. **native 协议（9000 端口）是未认证入口**：HTTP 有 handler 层审视，native 协议帧解析相对少人挖
3. **单点无害的链式组合**：表引擎上传文件 × library-bridge 加载 = RCE；审计时单独「无害」的功能组合起来看
4. **缓存 / 性能优化层容易忘记权限**：query cache、结果缓存、预编译语句复用——凡有缓存键，检查键里缺了什么安全上下文

---

## 2. 其他数据库经典模式（领域通用）

数据库领域的公知漏洞族；进新厂商目标时按此清单扫一遍。

### MySQL 形态

| 模式 | 要点 | 形态 | 条款倾向 |
|------|------|------|----------|
| 认证比较逻辑缺陷（CVE-2012-2122 类） | 密码哈希比较用布尔返回，重试概率命中 → 任意账号登录 | A1 | C2 |
| UDF 插件 RCE（lib_mysqludf_sys 类） | SQL 权限 + plugin 目录可写 → OS 命令 | X3 | H1 |
| 配置文件注入提权（CVE-2016-6663/6664 类） | mysqld 权限 → 写 my.cnf → root 执行 | M1 链 | C4 |
| 客户端连接串注入 | 恶意 server / 连接串参数触发客户端文件读 | A5 | H 档 |

### PostgreSQL 形态

| 模式 | 要点 | 形态 | 条款倾向 |
|------|------|------|----------|
| 超级用户功能误报校准（COPY PROGRAM / 扩展语言） | 需 superuser 的功能本身不是漏洞；**能从普通用户到达才算** | — | 不报（校准） |
| 数组下标 / 算术溢出内存破坏（CVE-2021-32027 类） | 下标计算整数溢出 → 堆破坏 | F3 | F2 档 |
| 逻辑复制权限边界 | replication 角色越权读写集群状态 | R3 | H2 |
| SCRAM / 认证时序（CVE-2017-7577 类） | 认证侧信道 | A1 | C2/M 档 |

### MongoDB 形态

| 模式 | 要点 | 形态 | 条款倾向 |
|------|------|------|----------|
| 未认证暴露（27017 公网，2020 勒索潮） | 无认证 + 暴露 = 灾难；云平台等价物是未授权 API | M1 | C3（云）/ 部署基线 |
| NoSQL 注入（`$where` JS 注入、`$ne` 条件绕过） | 运算符注入改查询语义 → 绕过认证 / 越权读 | Q3 | H2/H3 |
| 聚合管道注入 | `$expr` / aggregation 注入拼接 | Q3 | H3 |
| IDOR（ObjectID 可预测） | 云控制面可枚举他人资源 | C2 | C3/H4 |

### Redis 形态

| 模式 | 要点 | 形态 | 条款倾向 |
|------|------|------|----------|
| 未认证写文件 → RCE（cron / SSH key / webshell） | 无认证 + 写原语 = 主机沦陷 | M1 链 | C4 |
| 主从复制 RCE（伪造 master + MODULE LOAD） | 节点冒充加载恶意模块 | R2 | C2/H8 |
| Lua 沙箱逃逸（CVE-2022-0543 Debian 类、EVAL 历史逃逸） | 打包引入的 loadlib / 宿主对象泄露 | X3 | H1 |
| protected-mode / 混部署 SSRF 打内网 Redis | 云平台 SSRF → 内网无认证 Redis | C3 链 | H5 |

### Elasticsearch / 搜索引擎形态

| 模式 | 要点 | 形态 | 条款倾向 |
|------|------|------|----------|
| 脚本沙箱逃逸（CVE-2014-3120 / CVE-2015-1427 Groovy 类） | 脚本引擎沙箱 → RCE | X3 | C1/H1 |
| 未认证 9200 + 敏感索引 | 数据全读 | M1 | C3 |
| 动态模板 / 聚合注入 | 有限注入面 | Q3 | M 档 |

### Cassandra / 宽表形态

| 模式 | 要点 | 形态 | 条款倾向 |
|------|------|------|----------|
| UDF Java 沙箱逃逸（CVE-2021-44521 类） | 允许 Java UDF 时沙箱绕过 → RCE | X3 | H1 |
| 未认证 CQL / JMX 暴露 | 部署基线 | M1 | 部署基线 |

### SQL Server 形态

| 模式 | 要点 | 形态 | 条款倾向 |
|------|------|------|----------|
| xp_cmdshell / CLR 程序集 | 功能滥用；**需校准**：有 sysadmin 权限用不是漏洞，普通用户能触发才是 | X3 | H1（有前提校准） |
| linked server 双跳凭据 | 跨实例凭据滥用 | A5 | H 档 |
| 报表 / 附加组件 RCE（CVE-2020-0618 类） | 边缘组件入口 | Q1 | C1/H1 |

---

## 3. 定级校准要点（历史案例反推）

历史案例给出了官方（ClickHouse / CVSS）对边界情况的 **真实口径**，与 `severity-levels.md` 条款配合使用：

| # | 校准 | 依据 | 落到条款 |
|---|------|------|----------|
| K1 | **未认证控制流劫持原语（部分重定向 / 有限窗口）即使无完整 RCE 链，也是 High**，不必强求「稳定控制执行流」才定档 | CVE-2024-6873：256B 窗口执行流重定向、无 RCE PoC，官方 High | C5 放宽解读：`critical` 需完整链；**受限原语 → H1/F2** |
| K2 | **需高权限（PR:H）+ 特殊配置开启的 RCE 链仍是 High**，不因「管理员要先开配置」排除 | CVE-2025-1385：library-bridge 需显式启用 + 两项表引擎权限，CVSS4 7.5 High | H1；ADJ1 只降一档，不排除 |
| K3 | **同用户跨角色 / 跨设置的缓存污染 → 低档**（攻击者需已控制该账号，越权范围限同用户的角色差） | CVE-2024-22412 官方 Low（CVSS3 2.4） | P6 默认 M3/L1；**跨用户才 H2+** |
| K4 | **未认证 codec / 格式解析内存破坏 → High**；只有整数下溢等较弱原语可 Moderate | Gorilla/T64 High，FPC Moderate | F1/F2 |
| K5 | **superuser / 管理员专属功能被当漏洞报 = 无效**；必须证明「受限用户能到达」 | PostgreSQL COPY PROGRAM 误报传统 | Gate T5 / 不报 |
| K6 | **部署基线类（无认证 + 公网暴露）在 OSS 定级中不算漏洞本身**，但云平台等价问题（未授权 API、跨租户）是最高档 | MongoDB/Redis 勒索潮 vs 云 SaaS 责任边界 | OSS：部署建议；云：C3 |

**写 finding 时**：命中 K1–K6 任一校准，在 `rationale` 里写明「对照 history-patterns.md#K_」。

---

## 4. 挖掘切入点（按 ROI 排序，ClickHouse 当前）

1. **codec / 输入格式解析**（`src/Compression/`、`src/Formats/`）：未认证可达（HTTP `INSERT` body / native 帧 / `url()` 拉取的数据）+ 内存安全重灾区（历史 3 连发）；产出 F 族
2. **缓存键审计**（query cache、result cache、DDL cache、字典缓存）：键里缺 role / row policy / settings / 仓库配置吗？产出 P6
3. **native 协议帧解析**（`src/Server/TCPHandler`）：认证前处理多少输入？CVE-2024-6873 证明这条路的定级口径友好
4. **bridge / UDF / 外部执行链**（library-bridge、odbc-bridge、executable UDF）：localhost HTTP API 的输入校验、与文件上传功能的组合
5. **表函数与外部引擎**（`src/TableFunctions/`）：file/url/s3/remote 的路径约束与 SSRF 面；约束绕过 = X 族
6. **RBAC 语义**（`src/Access/`）：GRANT 路径覆盖、`WITH GRANT OPTION` 链、row policy 与视图 / dictionary / 物化视图交互中的权限旁路
7. **云控制面**（黑盒）：org/service id 的对象级鉴权（C2 IDOR）、集成 webhook 的 SSRF（C3）、API key 作用域（C4）
8. **Langfuse**：project 边界 IDOR、INGESTION API 越权写、prompt 跨租户泄露（C 簇）
