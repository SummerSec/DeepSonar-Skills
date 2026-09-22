# DeepSonar-Skills

DeepSonar / Agent 用的 **高危安全技能仓**（单仓库）：

| 维度 | 说明 |
| ------ | ------ |
| **漏洞定义** | 独立插件 **`vuln-definitions`**：每类定义 + 严重/高危/中危/无危害 |
| **领域定义** | 按领域独立插件：`vuln-definitions-oh`（移动 OS）/ `vuln-definitions-chrome`（浏览器）/ `vuln-definitions-db`（数据库）/ `vuln-definitions-mobile`（移动 App） |
| **漏洞评分** | 独立插件 **`vuln-scoring`**：**CVSS v3.1 / v4.0**（按需）+ EPSS/SSVC/KEV 优先级 |
| **白盒** | 源码审计，source→sink 追踪 |
| **黑盒** | 已授权目标上的漏洞验证；**工具预装进 agent 环境** |
| **组织方式** | 定义按 **领域**、审计按 **漏洞类型** 各一个 plugin（白盒、黑盒对称）；另有 **方法论** plugin（如 `mobile-audit`） |
| **移动方法论** | **`mobile-audit`**：APK/IPA 怎么挖/复现/取证；**不定级**（配合 `vuln-definitions` + `vuln-definitions-mobile`） |
| **报告范围** | `wb-*`/`bb-*` 定级后 **只报告 Critical / High**；**OH / Chrome / DB / Mobile 官方四档均可报** |

> 使用前阅读 [DISCLAIMER.md](./DISCLAIMER.md) 与 [shared/authorization.md](./shared/authorization.md)。

---

## 仓库结构

```
DeepSonar-Skills/
├── vuln-definitions/            # 【独立插件】漏洞定义模块（必装）
│   ├── SKILL.md
│   └── references/              # 全局等级 + 八类四级条款
├── vuln-definitions-oh/         # 【独立插件】OH / Phone OS 系统四档
│   ├── SKILL.md
│   └── references/
├── vuln-definitions-chrome/     # 【独立插件】Chrome / Chromium 浏览器四档
│   ├── SKILL.md
│   └── references/
├── vuln-definitions-db/         # 【独立插件】数据库领域四档（ClickHouse 厂商实例）
│   ├── SKILL.md
│   └── references/
├── vuln-definitions-mobile/     # 【独立插件】移动端 App（Android / iOS 应用层）四档
│   ├── SKILL.md
│   └── references/              # 含 google-android-devices-rules.md（项目规则，资格）
├── vuln-scoring/                # 【独立插件】漏洞评分（CVSS v3.1/v4.0 按需）
│   ├── SKILL.md
│   └── references/              # cvss-v3.1 / cvss-v4、映射、优先级、分版示例
├── mobile-audit/                # 【方法论插件】移动 App（APK/IPA）审计（不定级）
│   ├── README.md
│   └── skills/mobile-app-audit/ # SKILL.md + references/（recon…tooling）
├── shared/                      # 报告策略、finding 格式、授权
│   ├── severity-policy.md       # 默认只报 C/H；OH / Chrome / DB 四档例外（细则见对应插件）
│   ├── finding-schema.md
│   └── authorization.md
├── whitebox/<type>/             # 白盒 plugin ×8
├── blackbox/<type>/             # 黑盒 plugin ×8（类型对称）
├── agent-env/                   # 黑盒工具内置
└── .claude-plugin/marketplace.json
```

领域 / 评分 plugin 含 `.claude-plugin/plugin.json` + 根目录 `SKILL.md`；白盒 / 黑盒 / **mobile-audit** plugin 为 `skills/<skill>/SKILL.md`。

---

## Plugin 一览

### 漏洞定义 `vuln-definitions`（必装基线）

| Plugin | Skill | 职责 |
|--------|-------|------|
| **vuln-definitions** | `vuln-definitions` | 八类漏洞的定义；严重/高危/中危/无危害判定；归类规则 |

凡启用任一审计/挖洞 plugin，**应同时启用本插件**。

### 领域专项（按领域组织，不按项目）

| Plugin | Skill | 职责 |
| -------- | ------- | ------ |
| **vuln-definitions-oh** | `vuln-definitions-oh` | OpenHarmony / Phone OS 官方四档 + 系统形态 |
| **vuln-definitions-chrome** | `vuln-definitions-chrome` | Chrome / Chromium 官方 S0–S3 + 沙箱 / Site Isolation + VRP 资格（不定级） |
| **vuln-definitions-db** | `vuln-definitions-db` | 数据库领域：DBMS 形态 + Bugcrowd VRT P1–P5 → 四档 + ClickHouse 厂商实例 |
| **vuln-definitions-mobile** | `vuln-definitions-mobile` | 移动端（Android / iOS App）领域：应用层形态 + HackerOne 惯例 → 四档 + 历史模式库 + Google 设备项目规则（资格，不定级） |

> 新审计项目落进已有领域时 **只加厂商 reference 文件，不开新 plugin**（见 CLAUDE/AGENTS.md「领域插件框架」）。

### 漏洞评分 `vuln-scoring`（推荐）

| Plugin | Skill | 职责 |
|--------|-------|------|
| **vuln-scoring** | `vuln-scoring` | **CVSS v3.1 / v4.0** 按需评分与向量串；映射 DeepSonar 四级；EPSS/SSVC/KEV 修复优先级 |

在定性定级之后补全 finding 的 `cvss` 块；**不替代** `vuln-definitions` 的报告门槛。

### 方法论 `mobile-audit`

| Plugin | Skill | 职责 |
| -------- | ------- | ------ |
| **mobile-audit** | `mobile-app-audit` | Android APK / iOS IPA：静态攻击面、代码流、混合栈/SDK、真机与 PoC、证据包；**NEVER 自产 severity**（须同时启用 vuln-definitions + vuln-definitions-mobile） |

### 白盒 `whitebox-*`

| Plugin | Skill | 只关心 |
| -------- | ------- | -------- |
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
/plugin marketplace add <your-org>/DeepSonar-Skills
/plugin install vuln-definitions@DeepSonar-Skills   # 必装：定级基线
/plugin install vuln-scoring@DeepSonar-Skills       # 推荐：CVSS v3.1/v4.0 评分
/plugin install vuln-definitions-oh@DeepSonar-Skills      # OpenHarmony / Phone OS
/plugin install vuln-definitions-chrome@DeepSonar-Skills  # Chrome / Chromium
/plugin install vuln-definitions-db@DeepSonar-Skills      # 数据库（ClickHouse 等）
/plugin install vuln-definitions-mobile@DeepSonar-Skills  # 移动端（Android / iOS App）定级
/plugin install mobile-audit@DeepSonar-Skills             # 移动 App（APK/IPA）审计方法论
/plugin install whitebox-injection@DeepSonar-Skills
/plugin install blackbox-injection@DeepSonar-Skills
# 按需安装其他 type
```

### DeepSonar skill_sources

```http
POST /skill-sources
{
  "name": "DeepSonar-Skills",
  "repo_url": "https://github.com/<org>/DeepSonar-Skills.git",
  "branch": "main"
}
```

然后 `POST /skill-sources/:id/sync`，在 Agent Profile 中勾选模块，例如：

- 审计角色：`whitebox-injection`、`whitebox-rce`、…  
- 黑盒角色：`blackbox-ssrf`、`blackbox-authz`、…  
- 移动 App：`mobile-audit` + `vuln-definitions` + `vuln-definitions-mobile`  

### 本地 skills CLI

```bash
npx skills add <org>/DeepSonar-Skills --skill wb-injection
```

---

## 严重度纪律（摘要）

**完整定义与条款**：插件 [`vuln-definitions`](./vuln-definitions/)（`references/severity-levels.md` + 各 `references/<type>.md`）。  
**定量评分**：插件 [`vuln-scoring`](./vuln-scoring/)（**CVSS v3.1 默认 / v4.0 按需**；可选 EPSS/SSVC/KEV）。  
**报告策略**：[`shared/severity-policy.md`](./shared/severity-policy.md)（默认只报严重/高危）。

| 等级 | 是否报告（wb/bb） | 含义（全局） |
| ------ | ---------- | -------------- |
| 严重 Critical | ✅ | 沦陷级：RCE/整库/身份或租户接管/云凭证等 |
| 高危 High | ✅ | 重大数据/权限/子系统沦陷，未达一键全系统 |
| 中危 Medium | ❌ | 真实弱点但影响有限或利用受限 |
| 无危害 None | ❌ | 不可达、已防护、误报、非安全问题 |

OpenHarmony / Phone OS 走 `vuln-definitions-oh`、Chrome / Chromium 走 `vuln-definitions-chrome`、数据库走 `vuln-definitions-db`、移动端走 `vuln-definitions-mobile` 时例外：官方四档 `critical` / `high` / `medium` / `low` 均可报；INV / Gate 不过仍不报。不要把官方低危写成 `none`。Chrome 的纯 DoS / MiraclePtr PROTECTED、DB 的纯 crash / 理论问题、Mobile 的**本地 DoS**（杀进程 / 纯崩溃 / 资源耗尽，INV1；破坏性远程 DoS 按 H8）与入口面本身（INV26）/ self-XSS / 需越狱前提是 **不报**，不是低危。

| CVSS Base（v3.1/v4.0 共用档） | 常见 DeepSonar 映射 |
| ------------------------------- | --------------------- |
| 9.0 – 10.0 | critical |
| 7.0 – 8.9 | high |
| 4.0 – 6.9 | medium（默认不报） |
| 0.0 – 3.9 | none / medium（OH / Chrome / DB 官方低危为 `low`） |

---

## 黑盒工具环境

```bash
# 查看清单
cat agent-env/tools-manifest.json

# 构建示例镜像（请在 CI 中 pin 版本并校验）
docker build -f agent-env/Dockerfile.blackbox -t deepsonar-blackbox-agent:0.1 .
```

白盒审计可继续使用 **断网** 沙箱；黑盒必须使用带工具且可访问目标的镜像。

---

## 扩展新漏洞类型 / 新领域 / 新厂商

**新漏洞类型**（audit 手法维度）：

1. 在 `whitebox/<new-type>/` 与 `blackbox/<new-type>/` 各建 plugin（复制现有 type）。  
2. 更新 `.claude-plugin/marketplace.json`。  
3. 若黑盒需要新工具 → 写入 `agent-env/tools-manifest.json` 并重建镜像。  
4. 确认仍只覆盖 Critical/High。  

**新领域**（如 Web 框架、IoT）：建新 `vuln-definitions-<domain>` plugin + `vuln-definitions` 桥接 `references/<domain>.md`。

**新厂商项目**（如 MySQL、MongoDB 进数据库领域）：**只在对应领域 plugin 内加厂商 reference 文件**（资产范围 / 赏金 / 排除项），复用领域形态表与条款，不开新 plugin。

---

## 许可证

Apache-2.0。见 [LICENSE](./LICENSE)。
