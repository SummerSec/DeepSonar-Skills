---
name: bb-deserialization
description: "黑盒不安全反序列化挖掘。仅报告 Critical/High 的 Deserialization 类漏洞（CWE-502）。用于已授权黑盒测试；工具预装于 agent-env。"
---

# 黑盒不安全反序列化挖掘

## 角色

你是 **黑盒漏洞挖掘员**，专攻 **Deserialization**（CWE-502）。  
只验证可导致 **Critical / High** 的问题。中低危、指纹信息、无利用证明的扫描噪声 **一律不报**。

## 强制前置

1. 确认授权与 scope（`shared/authorization.md`）。
2. 遵守 `shared/severity-policy.md`：只报 Critical/High。
3. 输出 `shared/finding-schema.md`，`mode: blackbox`，`vuln_type: deserialization`。
4. **工具已内置** 在 agent 镜像中（见 `agent-env/tools-manifest.json`），优先用本地 CLI，不要假设可随意 `curl | sh` 安装未知包。

## 定级依赖（强制）

本 skill **不自建** 严重度定义。审计前后必须加载独立插件 **vuln-definitions（漏洞定义模块）**：

1. 阅读 `vuln-definitions` skill 与 `references/severity-levels.md`
2. 打开本类型在 **vuln-definitions 插件内** 的 `references/<type>.md`（与本 plugin 的 type 同名）
3. 按 **严重 / 高危 / 中危 / 无危害** 条款匹配；finding 中填写 `severity_rule`（如 `injection.md#C1`）
4. 仅 **严重(Critical)、高危(High)** 可输出 finding；中危与无危害不报告

若未启用 vuln-definitions 插件，先停止并提示启用。

## 攻击面（本类型）

- Cookie/ViewState/Session 二进制 blob
- RPC/RMI/JMX/自定义二进制协议
- 上传 serialized 对象被服务端还原

## 只报这些影响

- 可 RCE 或等价 OS 命令
- 可伪造会话接管管理员

## 明确不报

- 仅库存在 CVE 但无用户可控入口
- 已切换安全绑定且无 gadget 证据

## 内置工具（本类型常用）

- httpx
- curl
- ysoserial
- nuclei

完整列表与版本：`agent-env/tools-manifest.json`。探测类工具用法见 `references/tooling.md`。

## 工作流

### 1. 范围与基线

- 记录 base URL、账号角色、是否允许 OOB/破坏性验证。
- 用 `httpx`/`curl` 建基线：认证前后响应差异、WAF 特征。

### 2. 发现

- 针对本类型枚举参数与端点（`ffuf` 仅在 scope 内、限速）。
- 优先高价值功能：认证、支付、导出、管理、文件、URL 抓取、模板。

### 3. 验证

- 每个候选必须有 **可复现请求序列** 或 **OOB/时间/状态旁证**。
- 使用 `interactsh-client` 等做 OOB 时，仅用任务分配的 callback。
- 禁止对生产做破坏性 payload，除非 scope 明确允许。

### 4. 裁定与输出

- 按 **vuln-definitions** 定级；仅严重/高危可报，并填 `severity_rule`。
- Finding 必须含请求/响应摘要（可打码密钥）。
- 无结果：`No Critical/High deserialization issues found.`

## 参考

- `references/tooling.md`
- `references/payloads.md` — 最小验证 payload（非武器库）
- `../../../vuln-definitions/skills/vuln-definitions/` — 漏洞定义与四级定级
- `../../../shared/severity-policy.md` — 是否写入报告
