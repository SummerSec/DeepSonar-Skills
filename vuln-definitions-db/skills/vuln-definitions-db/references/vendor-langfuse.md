# Langfuse Cloud 厂商文件（vendor-langfuse.md）

Langfuse = 开源 LLM 工程平台（多租户 SaaS + 可自托管）。**ClickHouse Bugcrowd 项目内挂靠 target**（2026-07-14 加入），进数据库领域插件（厂商实例，不开新 plugin）。

> 快照日 2026-08-29。范围以 [Bugcrowd 项目页](https://bugcrowd.com/engagements/clickhouse) Langfuse target 实时为准。定级/形态/排除见本插件 `severity-levels.md` / `db-vuln-types.md` / `adjustment-and-invalid.md`。

---

## 1. 资产

| 项 | 值 |
|----|-----|
| 目标 | cloud.langfuse.com（Cloud SaaS；源码同套，自托管可本地起） |
| 源码 | github.com/langfuse/langfuse（TS/Next.js + tRPC + ClickHouse + Prisma/Postgres） |
| 文档 | langfuse.com/docs；负责任披露 langfuse.com/security/responsible-disclosure |
| Cloud 版本 | 4.24.0（2026-08-29 `/api/public/health` 探测；HEAD f6e56cbb 2026-08-28） |
| 赏金表 | 与 ClickHouse Cloud 同表：P1 $2100–2500 / P2 $1000–1250 / P3 $100–600 / P4 $50–100 |
| 租户模型 | org（根）> project（数据单元）；API key 分 project 级（pk-/sk-）与 org 级两种 |

## 2. 报告要求（项目明文，违反即无效）

1. 测试账号注册邮箱 **@bugcrowdninja.com** 结尾
2. 发现暴露客户 / 员工 PII → **立即停止并上报**
3. 拿到 shell → **立即停止并上报**；继续横向 = 没收奖励 + 移除
4. 不主动降级系统 / 服务；只测自己账号，不碰他人数据
5. 报告结构：漏洞描述 + 潜在影响 + 复现步骤（含所需配置/条件）+ PoC 代码/脚本/截图

## 3. 安全架构特征（2026-08 白盒审计 HEAD f6e56cbb，供快速上手）

| 面 | 实现 | 攻防含义 |
|----|------|----------|
| Public API 认证 | Basic（pk:sk，secret 经 sha256(salt) 查库 + Redis 缓存）；Bearer（仅 public key）→ 只给 `scores` accessLevel | 无 secret 无法伪造；**org key 在 project 路由直接 403** |
| 对象级鉴权 | 所有按 id 读取（trace/observation/media 等）都带 `projectId = key.projectId` 过滤 | 跨 project 直接 404；**换 project 对象 id 无意义** |
| tRPC | `protectedProjectProcedure` 强制 `input.projectId ∈ session orgs.projects`；org 路由再叠 `throwIfNoOrganizationAccess` | 双保险；admin 独立分支 |
| API routes | stripe 用 `constructEvent` 验签名；chatCompletion 走 `isProjectMemberOrAdmin` + `hasProjectAccess`；MCP/agent watch 走 session 或 API key | 无裸端点 |
| Webhook SSRF | `validateWebhookURL`：协议 http(s) / 端口 80·443 / hostname 黑名单 / IP 段黑名单（含内网+loopback+metadata）；`connection.ts` 连接时 DNS 复查 IP（缓解 TOCTOU） | **盲打内网基本不可行**；需测 whitelist env 未配置的实例 |
| MCP | `/api/public/mcp`：仅 BasicAuth project key；org key / Bearer 拒绝；限速；ingestion suspended 检查 | 面大（datasets/prompts/media/scores 读写工具）但门严 |
| Media | S3 预签名 URL（`getSignedUrl`） | 检查签名过期与路径是否含 projectId |
| CSP | Cloud 生产 CSP 完整（frame-ancestors 'none'、object-src 'none'）；**注意 `img-src`/`media-src` 含 `http://localhost:*`** | clickjacking 排除；localhost 放宽是浏览器端探测线索（需注入点配合） |

## 4. 挖掘候选（未完成验证 / 深挖方向）

按 ROI 排序：

1. **in-app agent 沙箱**（`packages/in-app-agent-sandbox-runtime` + `web/src/features/in-app-agent/`）：agent 执行远程/受控代码，沙箱逃逸 = P1；读工具对 in-app agent key 开放（`allowInAppAgentKey: true`），读面权限是否正确
2. **v4 migration 写模式**（`LANGFUSE_MIGRATION_V4_WRITE_MODE` events_only）：新旧表读写切换期的数据一致性 / 权限旁路
3. **SCIM**（`api/public/scim/Users`）：用户预置接口的鉴权与 org 绑定
4. **annotation-queues 分配**（`public/annotation-queues/[queueId]/assignments.ts`）：把队列项分配给用户 / 查询他人分配
5. **LLM key 存储**（`features/llm-api-key`）：Playground 用的 LLM API key 加密与回显；`llm-connections` 集成
6. **media 预签名 URL**：签名参数（过期 / IP 绑定 / 路径穿越）
7. **CSP localhost 放宽 → 浏览器端端口探测**：需先在页面找到可控 img/media URL 注入点（如数据集图片 URL、prompt 模板渲染）
8. **事件 / webhook 载荷注入**：events API 与 automations 的字段透传到 webhook payload，配合受害者 webhook 端做注入/钓鱼（影响低，多为排除项）

## 5. 定级映射（Langfuse 语境）

| 场景 | 形态 | 档位 |
|------|------|------|
| 跨 project / 跨 org 读他人 trace、prompt、dataset | C1 | P1（跨租户沦陷） |
| 同 org 跨 project 普通成员越权 | C2 | P2（同租户越权） |
| INGESTION 越权写他人 project（用自己 key 写别人 project） | Q3/C1 | P1/P2 |
| in-app agent 沙箱逃逸 | X3 | P1 |
| webhook 盲 SSRF（探测内网） | M6 | P3 |
| 版本披露 / 缺安全头 / 限速缺失 | INV | 不报 |

**关键防线提示**：Langfuse 对象级鉴权模式统一（projectId 绑定 key/session），**跨 project IDOR 需要找「漏传 projectId 过滤的查询」**——重点审计新 endpoint（v2/v3、unstable/）与 batch/export 类后台任务，而不是旧公共端点。
