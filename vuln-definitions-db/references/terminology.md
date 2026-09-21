# 术语与威胁模型（数据库领域）

对照 `vuln-definitions-db/SKILL.md` 工作流使用。定义不统一时以本文件为准。

---

## 1. 威胁模型（谁能攻击谁）

| 攻击者 | 说明 | 典型入口 |
|--------|------|----------|
| 未认证远程攻击者 | 网络可达但无任何凭据 | HTTP / native TCP 端口、Interserver、云平台公网接口 |
| 认证受限用户 | 有 SQL 账号但权限受限（readonly / granted / 行列受限） | SQL 接口、Playground、云查询控制台 |
| 恶意租户 | 云平台上合法注册的另一个 org / project | 云控制面 API、多租户共享面（Langfuse project、CH Cloud org） |
| 云平台普通成员 | 同 org 内非 admin 成员 | 控制面 Web / API（实例启停、成员、集成、API key） |
| 本地 OS 管理员 / 物理访问 | 服务器主机控制权 | 本地文件、进程内存 |

**不在威胁模型**：本地 OS 管理员 / 物理接触（能读 config / 内存 / 日志不是漏洞）；ClickHouse Cloud 数据面节点上的邻居租户经宿主机侧信道（未证明跨租户实害前）。

**云平台双边界**：DBMS 边界（SQL 权限）与 **租户边界**（org / project / service）。跨租户 ≫ 同租户越权；给跨租户问题按同租户定级是漏判，反之是抬级。

---

## 2. 权限边界术语（OSS）

| 术语 | 定义 |
|------|------|
| default 用户 | 部署即有、无密码的账号；default-user 无密码 + 网络暴露 = 最差配置基线 |
| readonly / granted 用户 | 通过 `GRANT` 语义限定（库 / 表 / 行 / 列 / 函数）或 settings profile 限定的账号 |
| 管理员 | `ACCESS MANAGEMENT` 等 SQL 权限或配置文件账号；**管理员自伤不是漏洞** |
| row policy / 行策略 | 行级过滤；被绕过 = 受限用户读到不该读的行 |
| 列掩码 | 列级脱敏；被绕过 = 读到未脱敏数据 |
| 认证链 | password / Kerberos / LDAP / JWT（SSL证书）等；认证链绕过 = 无凭据获得会话 |
| Interserver | 集群节点间通信；默认凭据 / 未认证 interserver 是集群面漏洞的前提 |

**纪律**：描述影响时必须写清「攻击者是哪种用户、绕过的是哪条边界」。「SQL 注入读到数据」若攻击者本就有 SELECT 权限，不是漏洞。

---

## 3. 租户模型术语（云平台）

| 术语 | 定义 |
|------|------|
| org / organization | ClickHouse Cloud 计费与权限根；org id / 邀请链接是常见 IDOR 轴 |
| service | 一个托管 ClickHouse 实例；service id 越权是 Cloud 常见轴 |
| API key | 控制面凭据；作用域（org-level / service-level）决定泄露影响 |
| BYOC | 客户 VPC 内部署数据面；控制面 → BYOC 边界是跨租户高危面 |
| Langfuse project | Langfuse 的租户单元（org > project）；跨 project 访问 = 跨租户 |
| 控制面 vs 数据面 | 控制面 = 管理 API/Web；数据面 = 存储与查询。两者攻击面与边界不同，勿混 |

---

## 4. 环境合格术语（OSS 复现纪律）

| 术语 | 定义 |
|------|------|
| 支持版本 | [Security Policy](https://github.com/ClickHouse/ClickHouse/security/policy) 列出的版本；过期版本上的问题不合格 |
| clickhouse-server | OSS 唯一合格组件；client / local / keeper 客户端洞不收 |
| release 构建 | CI release 构建可复现；debug / sanitizer / 其它编译器构建不合格 |
| 非实验特性 | 文档 / 代码标记 experimental 的特性或旗标下的洞不合格 |
| 环境无关 | 不依赖特定内核 / libc / DNS / SSL / 块设备配置；不依赖硬件故障 |

---

## 5. Bugcrowd 项目纪律术语

| 术语 | 定义 |
|------|------|
| VRT | Bugcrowd Vulnerability Rating Taxonomy：P1–P5 定官方档 |
| @bugcrowdninja.com | 测试账号强制邮箱后缀；$300 测试额度 |
| 5 req/s | 自定义脚本 / fuzz 上限；**禁止扫描器** |
| 停止条款 | 发现 PII 泄露或 shell → 立即停止测试并上报；继续深入 = 没收奖励 + 移除 |
| 协调披露 | 公开需项目方批准 |
| bounty_eligible | 对照 `bugcrowd-rules.md`：账号 / 速率 / 合格条件是否满足；**不改 severity** |
