# 资产范围（asset-scope.md）

对照日 2026-08-28（[项目页](https://bugcrowd.com/engagements/clickhouse)）。范围以官方页面实时为准，本文件是快照与抽象。

---

## 1. in-scope 资产

| 资产 | 形态 | 合格条件 | 官方焦点（focus areas） |
|------|------|----------|--------------------------|
| **ClickHouse OSS**（github.com/ClickHouse/ClickHouse） | C++ DBMS 引擎，白盒为主 | clickhouse-server 组件；支持版本；最新 release + master 可复现；非实验特性；release 构建 | RBAC 绕过、安全控制绕过（mTLS / 加密配置）、内存破坏与缓冲区溢出 |
| **ClickHouse Cloud**（控制面 + 数据面） | SaaS Web/API，黑盒为主 | `@bugcrowdninja.com` 测试账号（$300 额度）；只用自己账号 | IDOR、注入、存储型 XSS、SSRF、敏感数据泄露、业务逻辑、RCE、SQLi、认证 / 授权、未授权 API、绕安全控制 |
| **Langfuse Cloud**（cloud.langfuse.com，2026-07-14 新增） | SaaS Web/API，黑盒为主，源码开源（github.com/langfuse/langfuse） | `@bugcrowdninja.com` 测试账号；只用自己账号 | 同上（多租户 LLM 平台标准攻击面） |

> ClickHouse Cloud 文档入口：https://clickhou.se/bugcrowddocs  
> Langfuse 文档：https://langfuse.com/docs；负责任披露：https://langfuse.com/security/responsible-disclosure

---

## 2. 明确范围外（不要投时间）

| 资产 / 面 | 状态 |
|-----------|------|
| learn.clickhouse.com | 范围外（明文列出） |
| 新支持工单 / Chat / Request new integration / Share feedback 表单 | 范围外（明文列出） |
| 未列出的 ClickHouse 子域 / 资产 | 范围外；可报但无赏金 |
| 支付处理 | 三方处理，范围外 |
| 第三方系统（ClickHouse 员工在用） | 范围外 |
| Postgres offering 的租户内隔离 | 按设计不计，除非跨租户影响 |
| clickhouse.com 官网本身 | 未列为 target（不要打官网 CMS） |

---

## 3. OSS 合格条件（细节，对齐项目页）

1. 报告含描述 + 分步复现
2. **最新官方 release 和 master** 均可复现
3. 未修改源码 / 二进制
4. 未已发表；重复报告不合格
5. Linux x86_64；不依赖内核 / libc / DNS / SSL / 文件系统 / 块设备配置 / 硬件
6. 无需在 server 机器安装额外软件
7. 不用 experimental 特性 / 旗标
8. ClickHouse CI release 构建（debug / sanitizer / 其它编译选项不合格）
9. **clickhouse-server** 组件

## 4. 云平台纪律（细节）

1. 测试账号邮箱以 **@bugcrowdninja.com** 结尾；注册免费账号自带 $300 额度
2. **禁止无限卡 / 一次性卡**（违规移除出项目）
3. 禁扫描器；自定义脚本 / fuzz ≤5 req/s 且定向
4. 只测自己账号；不碰他人数据
5. 发现 PII / shell → 立即停止并上报
6. 不主动降级系统 / 服务
7. 额度耗尽 → 找 Bugcrowd Support 加

---

## 5. 新目标进领域时

数据库领域新目标（MySQL / PostgreSQL / MongoDB / Redis / TiDB / …）只加 **厂商 reference 文件**（如 `vendor-mysql.md`：资产、赏金、排除项），复用本插件形态表与条款；**不开新 plugin**。见仓库 CLAUDE.md「领域插件框架」。
