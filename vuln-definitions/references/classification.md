# 漏洞归类规则

当一个问题可同时套多个类型时，先走「归类三问」，再按优先级 **只选一个主类型**（可在 impact 中注明关联类型）。

---

## 0. 归类三问

1. **根因在哪里？** 根因决定主类型；影响只在同级消歧时使用。
2. **越过的是哪条边界？** 会话 / 租户 / 权限 / 网络 / 执行环境 / 数据完整性 —— 对应不同条款。
3. **终态是什么？** 链路定档取 **终态可达的最高档**（`severity-levels.md#ADJ-C1`）；跨根因打包按根因拆条（`severity-levels.md#ADJ-C2`）。

---

## 1. 主类型优先级（从高到低）

前八项为 **通用机理（跨领域）**，后六项为 **Web 领域类型（定义在本插件内）**。

1. **rce** — 已证明或代码上直接可任意代码/命令执行  
2. **deserialization** — 根因是不安全反序列化（见 `deserialization.md`；即便最终是 RCE，主类型仍可为 deserialization，或双标 rce 若利用面是通用 RCE 入口）  
3. **injection** — SQL/命令/LDAP/NoSQL 等注入语义  
4. **xxe** — 根因是 XML 解析外部实体  
5. **ssrf** — 根因是服务端请求伪造（即便读到文件，若经 file:// 且主因是 URL 控制，归 ssrf；纯路径遍历归 file-access）  
6. **file-access** — 路径遍历、任意文件读写、危险上传（见 `file-access.md`）  
7. **authz** — 认证/授权/IDOR/会话  
8. **secrets** — 凭据泄露本身（若泄露导致的利用另开 finding）  
9. **ai-agent**（Web 领域） — 根因在模型上下文或模型可调用的工具（见 `ai-agent.md`）  
10. **client-side** — 根因在客户端渲染或跨窗口消息处理（见 `client-side.md`）  
11. **logic-flaw** — 根因是业务规则可被绕过或状态可被重复消费（见 `logic-flaw.md`）  
12. **component** — 根因在第三方组件或其默认配置（见 `component.md`）  
13. **cloud-native** — 根因是云资源策略或编排/运行时隔离（见 `cloud-native.md`）  
14. **crypto** — 根因是签名校验或密码学原语的完整性（见 `crypto.md`）  

> 这六类当前只有 **定义与定级**，没有 `wb-*` / `bb-*` 执行插件；`vuln_type` 与 `severity_rule` 可直接引用其条款。

**优先级只用于** 「同一根因同时满足多个类型定义」时消歧。**根因不同时不适用本表** —— 直接按 §2 拆条。`secrets` 与 `authz` 同处一个资产时的消歧见 §2.1，**不按本表序号判**。

---

## 2. 拆分 finding 的规则

- **根因不同** → 分开报（例如：硬编码 JWT 密钥 + 无鉴权管理接口 = secrets 一条 + authz 一条）  
- **同一根因一条利用链** → 报影响最大的一级，主类型取根因  
- **密钥泄露后可 RCE** → secrets（泄露）为主；RCE 作为 impact 描述，或另开 rce 若存在独立代码执行点  
- **跨根因打包** → 每个根因一条 finding，`severity` 各自独立，用 `related_findings` 互相引用（`severity-levels.md#ADJ-C2`）  
- **修复绕过 / 复报** → 按绕过后的实际影响重新定档，`regression_of` / `duplicate_of` 记关联（`severity-levels.md#ADJ-B1`、`#ADJ-B2`）  

### 2.1 secrets 与 authz 的消歧（判定问句，按序回答）

1. **凭据本身是否可被滥用？**（可调用 API、可解密、可接管）→ 否，则不成立 secrets  
2. **去掉「接口缺少授权」这一条件后，缺陷是否仍成立？** → 是，主类型取 **secrets**  
3. **同一资产是否另有独立根因**（接口无鉴权、IDOR）？→ 是，另开一条 **authz**，与 secrets 互不替代  
4. **两者都不成立** → 不报  

例：「前端 JS 硬编码 API Key 导致账户接管」→ 根因是密钥硬编码且有效，主类型 **secrets**（档位按实际滥用面）；若同一资产另有独立无鉴权接口，再加一条 **authz**。

---

## 3. 边界声明（新类型 ↔ 既有类型）

| 情形 | 主类型 |
|------|--------|
| 可控输入进入 SQL / shell / 模板引擎 / XML 解析 | `injection.md` / `rce.md` / `xxe.md` |
| 可控输入只作用于模型上下文或工具通道 | `ai-agent.md` |
| 可控内容在浏览器 / WebView 中被当作脚本执行 | `client-side.md`（移动端应用层形态见 `mobile.md`） |
| 服务端被诱导致出站请求（含打到云 metadata） | `ssrf.md`；云资源自身策略暴露归 `cloud-native.md` |
| 凭据硬编码 / 桶可匿名读，无其它根因 | `secrets.md`；云侧策略缺陷再开 `cloud-native.md` |
| 规则可绕、状态可重复消费，且不依赖缺鉴权 | `logic-flaw.md` |
| 组件版本 / 默认配置缺陷 | `component.md`；利用落点按 §1 主类型标注 |
| 数据真实性 / 完整性可被伪造 | `crypto.md`；金额与幂等缺失归 `logic-flaw.md` |
| 接口无鉴权 / IDOR / 会话可伪造 | `authz.md` |

---

## 4. 不归入本仓类型的问题

| 现象 | 处理 |
|------|------|
| XSS / UXSS / `postMessage` / CORS / 点击劫持 / 开放重定向 | **归 `client-side.md`**（定档锚点为能否取得会话、跨域执行、链到可接管凭据，不以「能弹窗」定档） |
| CSRF | 造成资金/权限/接管级状态变更 → `authz.md` 的「危险状态变更」子类；仅 CSRF token 缺失且操作不敏感 → `authz.md#M4` |
| 逻辑 / 风控 / 计费绕过 | **归 `logic-flaw.md`** |
| 第三方组件 CVE / 框架默认配置 | **归 `component.md`**（可达性 + 前提 + 厂商是否已修三段判定；不可达才是 none） |
| DoS / 限流 / 资源耗尽 | 默认 none；**预认证可达且可利用的内存破坏原语不适用本条** → 见 `database.md#H9` 与 `rce.md` |
| 缺安全头（CSP / HSTS / cookie flag）、版本披露 | none（信息性） |
| 纯理论问题、**分析器的输出噪声**（无人工验证的告警）、无 PoC 的依赖清单 | none |
| **分析器 / 扫描器 / 构建工具自身被被检工件攻破**（工件内容进入 `eval` / 反序列化 / 求解器） | **归 `rce.md`**（工件自噬子类）；不适用上一条的「输出噪声」排除 |
| 子域名 / 存储桶悬空资源接管 | 归 `authz.md` 的「悬空资源接管」子类；可写投递链影响部署时按 `cloud-native.md` 定档 |