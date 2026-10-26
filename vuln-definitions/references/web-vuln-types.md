# Web 领域形态主表（vuln-definitions）

目标为 **Web 应用 / 控制台 / API / 前端 + 移动 WebView** 时，按本表先定 **形态簇**，再定 **主类型**（八类通用机理之一，或六类 Web 领域类型之一），最后按该类型 `references/<type>.md` 的条款定档。

> 条款锚点倾向列只是起点；定档必须落到 `severity-levels.md` 与对应类型文件的具体条款号。

---

## 1. 三步走

1. **形态**：本文件 §2 找到命中的形态簇（可多行命中，取根因所在行）
2. **主类型**：按 `classification.md` 定主类型（八类通用机理 / 六类 Web 领域）
3. **定档**：打开 `references/<type>.md` 匹配 C → H → M → N；数据面另过 `severity-levels.md` §7 规模 × 敏感度矩阵；链路与复报过 §8 的 ADJ-C / ADJ-B

前置门禁：资产范围见 `web-asset-scope.md`，五步门禁见 `web-gates.md`。

---

## 2. 形态主表

| # | 形态簇 | 典型机理 | 主类型 | 条款锚点倾向 |
|---|--------|----------|--------|--------------|
| W1 | 认证与身份 | 认证绕过、任意注册 / 登录、令牌可铸造、会话不随凭据变更失效、弱口令与默认凭证 | `authz.md` | C1–C2 / C5–C8 / H5–H6 / M6 / N7 |
| W2 | 授权与对象级 | IDOR、垂直越权、租户 / 组织边界、对象级授权缺失 | `authz.md` | C1–C4 / H1–H4 / M1–M2 |
| W3 | 配置面暴露 | Actuator / 内部管理接口 / 调试端点无认证或仅前端隐藏 | `authz.md`；组件默认配置归 `component.md` | C6 / M6 |
| W4 | 客户端注入与跨域 | 反射 / 存储 / DOM XSS、UXSS、`postMessage`、CORS 带凭据、开放重定向、点击劫持 | `client-side.md` | C1–C3 / H1–H5 / M1–M4 |
| W5 | 服务端解析与执行 | SQL / NoSQL / 命令 / 表达式注入、SSTI、不安全反序列化、XXE | `injection.md` / `rce.md` / `deserialization.md` / `xxe.md` | 各文件 C 族 |
| W6 | 文件与上传 | 路径遍历、任意文件读写、危险上传、压缩包穿越 | `file-access.md` | 该文件 C / H 族 |
| W7 | 出站请求 | SSRF、webhook 与 URL 预览、metadata、DNS rebinding | `ssrf.md`；云资源自身暴露归 `cloud-native.md` | C1–C4 / H1–H4 |
| W8 | AI / Agent | 提示词注入、内部规则外泄、MCP / 工具越权、记忆与会话跨用户、计费与风控滥用、执行环境隔离失效 | `ai-agent.md` | C1–C3 / H1–H5 / M1–M3 |
| W9 | 业务逻辑 | 资金损失、权益与配额逃逸、风控与内容合规可绕、并发超发与状态机跳步 | `logic-flaw.md` | C1–C3 / H1–H4 / M1–M4 |
| W10 | 组件与供应链 | 组件 CVE、框架默认配置、私有源与制品链路 | `component.md` | C1–C2 / H1–H3 / M1–M3 |
| W11 | 云与运行时 | 对象存储 / STS 策略、编排面未授权、容器与沙箱隔离、镜像仓库可写 | `cloud-native.md` | C1–C3 / H1–H4 / M1–M3 |
| W12 | 密码学完整性 | 签名 / 验签缺失或可关、密文可伪造与投毒、传输层校验绕过 | `crypto.md` | C1–C3 / H1–H3 / M1–M3 |
| W13 | 数据暴露与密钥 | 凭据 / 密钥 / 令牌暴露、接口过度返回、日志与备份暴露 | `secrets.md`；接口缺授权另开 `authz.md` | C 族 / H6 类 |
| W14 | 内部规则外泄 | system prompt、技能配置、工具 schema、内部业务规则 | `ai-agent.md` | H1 / M1 |

---

## 3. 归类纪律

- **根因优先**：同一请求链命中多行时，取 **根因** 所在行；影响只在同级消歧时使用（`classification.md` §0–§2）
- **终态定档**：链式利用取终态可达的最高档（`severity-levels.md#ADJ-C1`）；跨根因打包每根因一条（`#ADJ-C2`）
- **不塞 `authz`**：W4 / W8 / W9 / W10 / W11 / W12 六类不得因「有越权感」而笼统归入 `authz.md`
- **配置面与组件分开**：自研代码放行管理端点 → `authz.md`；组件自身默认配置或版本缺陷 → `component.md`（W3 两列）

---

## 4. 与八类、六类的关系

| 层次 | 内容 | 定义位置 |
|------|------|----------|
| 通用机理（八类，跨领域） | injection / rce / ssrf / authz / deserialization / file-access / xxe / secrets | `references/<type>.md` |
| Web 领域类型（六类） | client-side / logic-flaw / ai-agent / component / cloud-native / crypto | `references/<type>.md`（无 `wb-*` / `bb-*` 执行插件） |

形态簇是 **Web 落点**，机理类型是 **利用语义**；同一形态可映射到不同机理（如 W5 的表达式注入可能最终归 `rce.md`）。跨域目标（OH / Chrome / DB / Mobile）仍以各自领域的形态表为准，机理主类型回落到本插件。