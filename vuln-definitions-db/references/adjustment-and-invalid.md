# 级别调整（ADJ）与排除条款（INV）

命中 ADJ → 降档或改非安全；命中 INV → **直接不报**（`reportable: false`）。条款来自 Bugcrowd ClickHouse 项目页 out-of-scope 与 VRT 惯例（对照日 2026-08-28），数据库领域通用条款保留抽象形态。

---

## 1. 级别调整（ADJ，命中即下调）

| # | 条款 | 对本模块含义 |
|---|------|--------------|
| ADJ1 | 需管理员主动误配置 | 通常降一档（如管理员把 file 表函数权限给了普通用户后的问题） |
| ADJ2 | 仅实验特性 / 旗标可达 | OSS **不合格**（非降档，见 INV12）；云平台看默认开关 |
| ADJ3 | 需要受害者高度配合的交互链 | 降一档（P2→P3 类） |
| ADJ4 | 仅理论影响未演示 | 降到 P5 / 不报（理论问题被项目排除） |
| ADJ5 | 仅本地 OS 管理员可达 | 不在威胁模型，不报 |
| ADJ6 | 泄露仅为低敏元数据 | 降到 M1 / P3 |
| ADJ7 | 仅影响自己账号 / 自伤 | 不报 |
| ADJ8 | 已修复于最新版且不再支持版本 | 不报（须在支持版本可复现） |
| ADJ9 | 利用链上的单环 | 定档看整链，不要每环都标 C 档 |
| ADJ10 | 野外利用 / 已公开 | 只提优先级，不改档 |
| ADJ11 | 影响仅限排除目标（learn.clickhouse.com、支持表单等） | 不报 |
| ADJ12 | Postgres offering 租户内隔离 | 不报，除非能证明跨租户影响 |

---

## 2. 排除条款（INV，命中即停）

### 通用排除（Bugcrowd 项目明文）

| # | 条款 |
|---|------|
| INV1 | DoS / DDoS；资源耗尽、纯崩溃、crash-only 内存破坏 |
| INV2 | 缺限速且无具体安全实害 |
| INV3 | 缺安全头（CSP / X-Frame-Options / cookie flag 等）且无利用展示 |
| INV4 | 版本披露 / 软件指纹 |
| INV5 | EXIF 地理位置 |
| INV6 | 邮件安全记录缺失（SPF / DKIM / DMARC） |
| INV7 | POST 反射 XSS / self-XSS |
| INV8 | 社工 / 物理攻击 |
| INV9 | 支付处理（三方处理） |
| INV10 | 第三方系统（ClickHouse 员工在用的非 ClickHouse 资产） |
| INV11 | 依赖清单（过时依赖列表）；除非有 PoC 证明严重且可利用 |
| INV12 | 静态分析器 / 扫描器原始输出，无人工验证 / PoC |
| INV13 | 理论安全问题 |
| INV14 | 已发表 / 他人已报（重复） |

### 数据库领域排除（官方焦点外的杂音）

| # | 条款 |
|---|------|
| INV15 | system 表内不可利用 / 无敏感信息的进程用户枚举类发现 |
| INV16 | 客户端组件（clickhouse-client / clickhouse-local / benchmark）问题 |
| INV17 | 非 release 构建（debug / sanitizer / 自选编译器）上才可复现 |
| INV18 | 环境依赖问题（特定内核 / libc / DNS / SSL / 块设备 / 硬件故障） |
| INV19 | 未在支持版本可复现（Security Policy） |
| INV20 | Play HTTP 服务器（默认本地 setup）上的 Web 漏洞（clickjacking / CSRF / 缺头等） |
| INV21 | 对真实用户/客户数据的破坏性验证 |
| INV22 | learn.clickhouse.com、支持 / 聊天 / 反馈表单 |
| INV23 | 未经列出的 ClickHouse 子域 / 资产（范围外；可报但无赏金） |

> 编号说明：INV1–INV14 为通用排除（Bugcrowd 项目明文），INV15–INV23 为数据库领域排除；原重复的 INV20「扫描器原始输出」已并入 INV12，现编号连续（INV1–INV23 / ADJ1–ADJ12），引用以条款文字为准。

---

## 3. 常见误判纠正

| 误判 | 纠正 |
|------|------|
| 「crash = 高危内存破坏」 | 纯 crash 是 DoS，INV1 排除；只有能演示受控执行流 / 泄露原语才进 F 族 |
| 「default 用户无密码 = critical」 | default 无密码本身是配置基线；须展示现实暴露 + 现实影响才定档 |
| 「SSRF 探测到内网 = high」 | 盲探测是 M6；拿到 metadata 凭据或打管理面才是 H5 |
| 「泄露 API key 前缀 / 组织名 = high」 | 低敏元数据 M1/M2；可接管级凭据才是 H6 |
| 「同 org 普通成员看别人 service = critical」 | 同租户越权 H4；跨 org 才是 C3 |
| 「依赖有 CVE = 可报」 | 须有 PoC 证明在 ClickHouse 实现下可利用（INV11） |
