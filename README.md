# dfh-security-skills

DeepFlowHunter / Agent 用的 **高危安全技能仓**（单仓库）：

| 维度 | 说明 |
|------|------|
| **漏洞定义** | 独立插件 **`vuln-definitions`**：每类定义 + 严重/高危/中危/无危害 |
| **白盒** | 源码审计，source→sink 追踪 |
| **黑盒** | 已授权目标上的漏洞验证；**工具预装进 agent 环境** |
| **组织方式** | **按漏洞类型** 各一个 plugin（白盒、黑盒对称） |
| **报告范围** | 定级后 **只报告 Critical / High**；中危与无危害不写 finding |

> 使用前阅读 [DISCLAIMER.md](./DISCLAIMER.md) 与 [shared/authorization.md](./shared/authorization.md)。

---

## 仓库结构

```
dfh-security-skills/
├── vuln-definitions/            # 【独立插件】漏洞定义模块（必装）
│   └── skills/vuln-definitions/
│       ├── SKILL.md
│       └── references/          # 全局等级 + 八类四级条款
├── shared/                      # 报告策略、finding 格式、授权
│   ├── severity-policy.md       # 只报 C/H（细则见 vuln-definitions）
│   ├── finding-schema.md
│   └── authorization.md
├── whitebox/<type>/             # 白盒 plugin ×8
├── blackbox/<type>/             # 黑盒 plugin ×8（类型对称）
├── agent-env/                   # 黑盒工具内置
└── .claude-plugin/marketplace.json
```

每个 plugin 含 `.claude-plugin/plugin.json` + `skills/.../SKILL.md`。

---

## Plugin 一览

### 漏洞定义 `vuln-definitions`（必装基线）

| Plugin | Skill | 职责 |
|--------|-------|------|
| **vuln-definitions** | `vuln-definitions` | 八类漏洞的定义；严重/高危/中危/无危害判定；归类规则 |

凡启用任一审计/挖洞 plugin，**应同时启用本插件**。

### 白盒 `whitebox-*`

| Plugin | Skill | 只关心 |
|--------|-------|--------|
| whitebox-injection | wb-injection | SQL/命令/NoSQL/LDAP 注入 → 泄库/RCE |
| whitebox-rce | wb-rce | eval/SSTI/表达式 → RCE |
| whitebox-ssrf | wb-ssrf | SSRF → metadata/内网接管 |
| whitebox-authz | wb-authz | 认证绕过、提权、大规模越权 |
| whitebox-deserialization | wb-deserialization | 反序列化 → RCE |
| whitebox-file-access | wb-file-access | 任意文件读写、上传 RCE |
| whitebox-xxe | wb-xxe | XXE → 读文件/SSRF |
| whitebox-secrets | wb-secrets | 仍有效且可接管的密钥 |

### 黑盒 `blackbox-*`

与上表 **type 一一对应**，skill 名为 `bb-<type>`。  
运行依赖 `agent-env` 预装工具（httpx、ffuf、nuclei、sqlmap、interactsh-client 等）。

---

## 安装

### Claude Code marketplace

```text
/plugin marketplace add <your-org>/dfh-security-skills
/plugin install vuln-definitions@dfh-security-skills   # 必装：定级基线
/plugin install whitebox-injection@dfh-security-skills
/plugin install blackbox-injection@dfh-security-skills
# 按需安装其他 type
```

### DeepFlowHunter skill_sources

```http
POST /skill-sources
{
  "name": "dfh-security-skills",
  "repo_url": "https://github.com/<org>/dfh-security-skills.git",
  "branch": "main"
}
```

然后 `POST /skill-sources/:id/sync`，在 Agent Profile 中勾选模块，例如：

- 审计角色：`whitebox-injection`、`whitebox-rce`、…  
- 黑盒角色：`blackbox-ssrf`、`blackbox-authz`、…  

### 本地 skills CLI

```bash
npx skills add <org>/dfh-security-skills --skill wb-injection
```

---

## 严重度纪律（摘要）

**完整定义与条款**：插件 [`vuln-definitions`](./vuln-definitions/)（`references/severity-levels.md` + 各 `references/<type>.md`）。  
**报告策略**：[`shared/severity-policy.md`](./shared/severity-policy.md)（默认只报严重/高危）。

| 等级 | 是否报告 | 含义（全局） |
|------|----------|--------------|
| 严重 Critical | ✅ | 沦陷级：RCE/整库/身份或租户接管/云凭证等 |
| 高危 High | ✅ | 重大数据/权限/子系统沦陷，未达一键全系统 |
| 中危 Medium | ❌ | 真实弱点但影响有限或利用受限 |
| 无危害 None | ❌ | 不可达、已防护、误报、非安全问题 |

---

## 黑盒工具环境

```bash
# 查看清单
cat agent-env/tools-manifest.json

# 构建示例镜像（请在 CI 中 pin 版本并校验）
docker build -f agent-env/Dockerfile.blackbox -t dfh-blackbox-agent:0.1 .
```

白盒审计可继续使用 **断网** 沙箱；黑盒必须使用带工具且可访问目标的镜像。

---

## 扩展新漏洞类型

1. 在 `whitebox/<new-type>/` 与 `blackbox/<new-type>/` 各建 plugin（复制现有 type）。  
2. 更新 `.claude-plugin/marketplace.json`。  
3. 若黑盒需要新工具 → 写入 `agent-env/tools-manifest.json` 并重建镜像。  
4. 确认仍只覆盖 Critical/High。  

---

## 许可证

Apache-2.0。见 [LICENSE](./LICENSE)。
