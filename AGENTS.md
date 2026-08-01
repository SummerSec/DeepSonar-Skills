# dfh-security-skills

单一技能仓：

1. **vuln-definitions** — 漏洞定义模块（独立 plugin，语义基线）  
2. **whitebox-*** — 白盒审计（按漏洞类型）  
3. **blackbox-*** — 黑盒挖掘（按漏洞类型，工具在 agent-env）  

定级含 **严重 / 高危 / 中危 / 无危害**；**正式报告仅 Critical/High**。

## 目录约定

```
vuln-definitions/         # 独立插件：定义 + 四级定级
whitebox/<type>/          # 白盒 plugin
  .claude-plugin/plugin.json
  skills/wb-<type>/SKILL.md
blackbox/<type>/          # 黑盒 plugin（同 type 集合）
  .claude-plugin/plugin.json
  skills/bb-<type>/SKILL.md
shared/                   # 报告策略、finding 格式、授权
agent-env/                # 黑盒工具内置清单与镜像
```

## 漏洞类型（type）

| type | 白盒 skill | 黑盒 skill | 焦点 |
|------|------------|------------|------|
| injection | wb-injection | bb-injection | SQL/命令/NoSQL 注入 |
| rce | wb-rce | bb-rce | 代码执行 / SSTI / 表达式 |
| ssrf | wb-ssrf | bb-ssrf | SSRF → metadata/内网 |
| authz | wb-authz | bb-authz | 认证绕过 / 越权 / 接管 |
| deserialization | wb-deserialization | bb-deserialization | 不安全反序列化 |
| file-access | wb-file-access | bb-file-access | 任意文件读写 / 上传 RCE |
| xxe | wb-xxe | bb-xxe | XXE |
| secrets | wb-secrets | bb-secrets | 可接管级密钥泄露 |

## 改 skill 时

1. **改漏洞定义/定级标准** → 只改 `vuln-definitions/`，bump 其 version  
2. 改审计手法 → 对应 `whitebox-*` / `blackbox-*`  
3. 报告策略（是否上报 medium）→ `shared/severity-policy.md`  
4. 黑盒新工具 → `agent-env/tools-manifest.json` + 镜像  
5. marketplace 条目 version 与 plugin.json 对齐

## DeepFlowHunter

- `POST /skill-sources` 指向本仓 URL，sync 后 catalog 按 plugin 分组  
- Profile 按角色勾选：`whitebox-*` 给 audit/explore，`blackbox-*` 给 blackbox/test  
- 白盒沙箱可断网；黑盒沙箱需目标网络 + 工具镜像  
