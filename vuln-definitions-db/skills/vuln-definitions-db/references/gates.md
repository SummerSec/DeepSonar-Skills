# 挖掘门禁 Gate T、S、E、C、R 与报告要求

发现可疑点后 **按顺序回答**；任一「否」→ 不进入深度 PoC，最多记对内缺陷。
形态见 `db-vuln-types.md`；范围见 `asset-scope.md`；排除见 `adjustment-and-invalid.md`；Bugcrowd 纪律见 `bugcrowd-rules.md`。

## Gate T · 攻击者是谁？（威胁模型）

- [ ] **T1** 攻击者是：未认证远程 / 认证受限用户 / 恶意租户（云）之一？
- [ ] **T2** 不需要：本地 OS 管理员权限、物理访问、已中毒机器、ClickHouse 员工协助？
- [ ] **T3** 不需要管理员主动做出不合理的错误配置？（合理配置 = 文档默认或常见生产配置）
- [ ] **T4** 不依赖未证明的第二洞才产生安全含义？
- [ ] **T5** 管理员自伤 / 自账号内影响不算（不报）

## Gate S · 是不是本插件的资产？

对照 `asset-scope.md`。

- [ ] **S1** 目标在 in-scope 清单（ClickHouse OSS / ClickHouse Cloud / Langfuse Cloud）？
- [ ] **S2** OSS：是 **clickhouse-server** 组件问题（非 client / local / benchmark / keeper 客户端）？
- [ ] **S3** 不是 learn.clickhouse.com、支持 / 聊天 / 反馈表单等明确排除面？
- [ ] **S4** 不是第三方系统 / 三方库在出货路径不可达？
- [ ] **S5** 云平台：写清是 **同租户** 还是 **跨租户**（org / project 边界）？
- [ ] **S6** 不是 Postgres offering 的租户内隔离（除非证明跨租户）？

## Gate E · 环境合格吗？（OSS 复现纪律）

- [ ] **E1** 最新官方 release **和** master 均可复现（或最新 release 可复现且 master 未修）？
- [ ] **E2** 用未修改源码 / 官方二进制（未加补丁 / 未改配置注入特殊路径）？
- [ ] **E3** Linux x86_64、ClickHouse CI release 构建（非 debug / sanitizer / 自选编译器）？
- [ ] **E4** 不依赖内核版本 / libc / DNS / SSL / 块设备配置 / 硬件故障？
- [ ] **E5** 不依赖 experimental 特性或旗标（allow_experimental_*）？
- [ ] **E6** 无需在 clickhouse-server 机器上安装额外软件？
- [ ] **E7** 不依赖特定默认账号之外的额外账号 / 特殊权限（或写清前提）？

## Gate C · 有没有「安全实害」？

至少命中一条，且能演示（Bugcrowd：纯崩溃 / 理论影响不算）：

| 实害类型 | 合格例子 | 不合格例子 |
|----------|----------|------------|
| 代码执行 | 受限用户经表函数 / UDF 执行 OS 命令 | 仅 ASAN 崩溃报告 |
| 数据访问 | 跨租户 / 越权读其它 org 数据、绕过 row policy 读行 | 泄露低敏元数据且无后续利用 |
| 认证绕过 | 无凭据获得会话 / 接管账号 | 密码策略弱（需管理员配合前提） |
| 凭据窃取 | SSRF 拿到 metadata 凭据 / API key | 仅探测内网存活 |
| 服务接管 | 接管他人 service / 集群写入 | 仅影响自己资源 |
| 信息泄露 | 敏感配置 / 密钥 / 跨租户数据 | 版本号、低敏日志 |

- [ ] **C1** 危害大于攻击者已有能力（有 SELECT 权限的用户读到本就有权读的数据不算）
- [ ] **C2** 影响能写清到「谁、越过了哪条边界（认证 / 授权 / 租户 / 进程）、拿到什么」
- [ ] **C3** 有可观测证据（回显 / OOB / 状态变化），不是「可能」

## Gate R · 能否复现并合格投递？

- [ ] **R1** step-by-step 复现步骤（含版本、平台、配置差异）已写？
- [ ] **R2** PoC 是最小化的（SQL / HTTP 请求 / 脚本），可独立复跑？
- [ ] **R3** 云平台测试遵守纪律：`@bugcrowdninja.com` 账号、≤5 req/s、无扫描器？
- [ ] **R4** 没有触碰他人数据 / 账号（只测自己账号）？
- [ ] **R5** 发现 PII 泄露或 shell → 已停止深入、立即上报（停止条款）？
- [ ] **R6** 报告含官方报告模板要点：Lab setup / Additional setup / Exploitation / Outcome / Extra Details（crashlog、PoC、方法论、缓解建议）？
- [ ] **R7** 已写清 `subject_revision`（版本 / SHA 钉扎）与 `live_checked`？

## 决策

```
Gate T 不过     → 非威胁模型，停
Gate S 不过     → 非本插件资产 / 排除面，停
Gate E 不过     → OSS 环境不合格（实验特性 / 非支持版本 / 非 release 构建）→ 对内或停
Gate C/R 不过   → 无安全实害或不可复现，停
全过            → 四档定级（P1–P4），可写正式 finding；对照 bugcrowd-rules.md 填 bounty_eligible
```

---

## 报告要求（对齐 Bugcrowd ClickHouse，供已授权投递）

投递走 [Bugcrowd ClickHouse](https://bugcrowd.com/engagements/clickhouse)。细则见 `bugcrowd-rules.md`。

1. **描述 + 步骤 + 影响**：漏洞描述、发现位置、复现步骤、潜在影响（报告模板见项目页）
2. **OSS 建议**：Lab setup（server/client 版本、OS、平台）、Additional setup（配置差异）、Exploitation、Outcome、Extra Details（crashlog / PoC / 方法论 / 缓解建议）
3. **云平台**：自己账号内测试；不碰他人数据；账号用 `@bugcrowdninja.com`
4. **不写完整武器化 exploit**；验证路径即可
5. **AI 辅助报告**须人工核威胁模型 + 可达 + PoC；批量低质量按刷屏处理
6. 协调披露：公开须项目方批准

**禁止**：未授权目标、扫描器、>5 req/s、破坏真实用户数据、发现 PII/shell 后继续深入。
