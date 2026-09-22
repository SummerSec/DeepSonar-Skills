# Bugcrowd Android 范围外（OOS）审计规则（资格 / 投递纪律，不定级）

抽象自 Bugcrowd `engagements.json?search=android` 相关 brief / changelog 中反复出现的 Out-of-Scope 与测试纪律（约 **26** 个含 Android / 移动 App 目标的计划；工作区摘录见 `/workspace/issue-specs/bc-oos/`）。  
**对照日：2026-09-22。** 现场以各计划 **现行 brief** 为准；本文件与 brief 冲突时 **brief 获胜**。

**不定级。** 本文件只回答「按 Bugcrowd 移动 / Android 惯例能不能投、会不会被 OOS/Informational」；档位仍以 `vuln-definitions` + `vuln-definitions-mobile` 为准。  
**`bounty_eligible: false` ≠ 删除内部 finding 的 `severity`**——资格与定级分离（同 `google-android-devices-rules.md` 纪律）。

**不编造** 各计划奖金金额作政策；金额以 brief 为准，本文件不收录价目表。

**审计口号（Audit motto）**：

> **非 root 的第三方路径，能打到敏感 sink / 敏感数据；否则停。**

---

## 1. 与本插件字段的关系

| 问题 | 看哪里 | 字段 |
| ------ | -------- | ------ |
| 是不是安全漏洞、哪一档 | `severity-levels.md` + `adjustment-and-invalid.md` | `severity` / `severity_rule` |
| 属哪种移动端形态 | `mobile-vuln-types.md` + `attack-surfaces.md` | `mobile_class` |
| 第三方怎么扫优先面 | `android-third-party-attack-surfaces.md` | 候选草稿 |
| 按 **Bugcrowd 移动惯例** 能不能投 / 是否典型 OOS | **本文件 §3 / §4 / §5** | `bounty_eligible`（及工作笔记 OOS 码） |
| 报告怎么写才不易关单 | 本文件 §6 + `gates.md` Gate R | — |

- 命中本文件 BC-OOS / BC-OOS-M 且无「例外升格」条件 → 默认 **`bounty_eligible: false`**；内部仍可保留候选与（若已定级的）`severity` 供修复优先级，**不要**为了「没奖」把 `severity` 改成 `none` 或删掉  
- 同时命中 `INV*` → `reportable: false`（连正式报告都不进）  
- 计划 brief 明文更宽或更窄 → 以 brief 覆盖本表，并在 `rationale` 写明 brief 原文要点

---

## 2. 来源与使用边界

| 项 | 说明 |
| ---- | ------ |
| 抽样 | Bugcrowd 公开 engagements 中与 Android / Mobile App 相关的 brief「Out of Scope / Targets / 测试规则」及部分 changelog；约 26 份 OOS 摘录 |
| 性质 | **跨计划共性抽象**，不是单一计划的完整 brief 副本 |
| 权威 | 投递前打开目标计划页面；Targets 变更、私有计划补充条款、限时活动规则均可覆盖本表 |
| 禁止 | 把本表奖金暗示、完整利用链、或「别的计划给过钱」当作抬 `severity` 的依据 |

代表性复现模式（非穷尽、非背书）：Opera（exported 须有安全影响；缺 pinning / 低危硬编码 key）、Under Armour（缺 pinning / 混淆 / jailbreak 检测；**畸形 Intent 导致导出组件崩溃** OOS，敏感数据泄漏常 in-scope）、Chime / TIDAL / REA / Seek / Binance / Wise（缺 pinning·混淆·root 检测、需 root、DoS、第三方、无 Targets）等。

---

## 3. 通用范围外（BC-OOS-01 … 10）

跨 Web + Mobile 计划高频出现的 OOS / 低价值项。命中且无 brief 明文例外 → 默认不投赏金路径。

| ID | 主题 | 典型表述（抽象） | 动作 | 常见 INV 对照 |
| ---- | ------ | ------------------ | ------ | --------------- |
| **BC-OOS-01** | DoS / DDoS / 纯资源耗尽 | 高流量、压测、仅使服务不可用；本地杀进程 / 纯崩溃 | 不投；破坏性远程 DoS 仅当 brief 明确接收且达移动端 H8 门槛时另议 | **INV1**（本地）；远程未达 H8 → 项目页 / ADJ4 |
| **BC-OOS-02** | 社会工程 / 钓鱼 | 钓员工或用户凭据、预文本、无技术链的欺诈 | 禁止测试与提交 | —（授权/行为） |
| **BC-OOS-03** | 物理攻击 / 仅物理可触达 | 对办公区、数据中心、或「必须拿到解锁手机到手」才能成立的唯一前提 | 不投 | 近 **INV15** 前提族 |
| **BC-OOS-04** | 无实害的「最佳实践」 | 缺安全头、cookie 标志、TLS 版本/套件、密码策略文案等，**无 PoC 实害** | 不投 | **INV13** / ADJ4 |
| **BC-OOS-05** | 低危 CSRF | 登录/登出 CSRF、非敏感未认证表单 CSRF | 不投 | 近 INV13 |
| **BC-OOS-06** | 无敏感动作的 Clickjacking / Self-XSS | 无状态改变、无敏感 UI；或仅自盗 | 不投 | 近 INV13；self-XSS 惯例排除 |
| **BC-OOS-07** | 第三方 / 供应商资产 | CDN、SaaS、支付处理器、未授权第三方域名；非目标名下资产 | 不投（除非 brief 写明 in-scope 或可证为目标错误配置且计划接收） | **INV10**；SDK 另见 M7 / **INV18** |
| **BC-OOS-08** | 已知漏洞库 / CVE 清单 | 过时依赖列表、N-day 无目标内工作 PoC | 不投 | **INV11** |
| **BC-OOS-09** | 扫描器 / 自动化原始输出 | 无人工验证、无复现步骤的工具 dump | 不投 | **INV12** |
| **BC-OOS-10** | 不在 Targets | brief Targets 未列资产；「属于品牌但未列」常仅 VDP、无奖 | 默认不投赏金；可记内部笔记 | 范围纪律（先于定级） |

---

## 4. 移动端专用范围外（BC-OOS-M1 … M8）

Android / iOS App 计划中反复出现的移动项。与 `android-third-party-attack-surfaces.md` 的「优先面」互补：**下列单独出现时默认 OOS**。

| ID | 主题 | 典型表述（抽象） | 何时才可能升格 | INV / 形态对照 |
| ---- | ------ | ------------------ | ---------------- | ---------------- |
| **BC-OOS-M1** | **缺少证书固定（pinning）** | Absence of cert pinning；「可 MITM」仅因无 pinning | 在 **用户未装攻击者 CA** 的前提下仍能解密/劫持，或 pinning 可被未授权第三方路径绕过并导致会话窃取 | 单独 → OOS；有实害会话窃取再按 AS3 + 项目页 |
| **BC-OOS-M2** | **缺少混淆 / 反调试 / 二进制保护** | Lack of obfuscation / anti-debug | 几乎不因「能反编译」单独给奖 | 近 M7（OWASP）；**不**当漏洞 |
| **BC-OOS-M3** | **缺少 root / jailbreak 检测** | Lack of root/jailbreak detection | 检测缺失本身不报；绕过检测后须另有敏感 sink | 单独 → OOS |
| **BC-OOS-M4** | **导出组件 / 深链仅崩溃或仅唤起** | malformed Intent crash on exported Activity/Service/Receiver；「有 exported」无安全影响 | **泄漏敏感数据、未授权敏感操作、任意 URL、Provider 越权读写** 等 → 常 in-scope | 崩溃 → **INV1**；仅唤起 → **INV26** |
| **BC-OOS-M5** | **必须 root / 越狱才能成立** | require rooted/jailbroken device；root 后读 SharedPreferences | 默认不投；brief 写明 points-only 等从其规定 | **INV15** |
| **BC-OOS-M6** | **低危硬编码密钥** | 客户端 API key / 渠道号，无法证明可访问隐私或付费能力 | 证明可调敏感 API、读他人数据、动用付费配额等 → 可候选 | 升格后走 AS2；否则近 INV13 |
| **BC-OOS-M7** | **第三方 SDK 缺陷** | 广告/统计/支付 SDK 自身漏洞；出货不可达或不覆盖 | **出货路径可达且影响宿主** 敏感数据/操作，且 brief 未排除 SDK | **INV18**（不可达/不覆盖）；可达宿主影响 → 按 AE/AW/AS… |
| **BC-OOS-M8** | **「TLS 下仍有敏感字段」类 MITM 叙事** | 仅证明 HTTPS body 有 token，或仅在已装用户 CA / 已关 pinning 下抓包 | 需未授权第三方路径或错误信任锚导致实害 | 与 M1 叠加时更易 OOS；真 TrustManager 全信任等另按 AS3 |

> Under Armour 系 brief 原意摘要：**畸形 Intent 打导出组件导致崩溃 → OOS**；**利用导出面造成敏感数据泄漏 → 通常 in-scope**。与本表 M4 + INV1/INV26 一致。

---

## 5. BC-OOS ↔ DeepSonar INV 速查

| BC-OOS | 优先对齐的 INV / 纪律 | 说明 |
| -------- | ----------------------- | ------ |
| 01 | INV1 | 本地 DoS / crash-only；勿用崩溃撑档 |
| 04 | INV13 / ADJ4 | 无演示的理论 / 最佳实践 |
| 07 | INV10 | 非目标第三方系统 |
| 08 | INV11 | 依赖清单无 PoC |
| 09 | INV12 | 扫描器原始输出 |
| 10 | （范围） | 无 Targets → 先停赏金路径 |
| M4 | INV1 + INV26 | 崩溃 vs 入口面本身 |
| M5 | INV15 | root 后才能观察 |
| M7 | INV18 | SDK 不可达 / 项目不覆盖 |

INV 命中 → `reportable: false`。仅 BC-OOS 命中、INV 未命中 → 仍可不报赏金（`bounty_eligible: false`），是否保留内部 finding 由授权审计约定决定，**不改已有 severity**。

---

## 6. 测试与报告纪律

### 6.1 测试前

1. 打开计划 **Targets**；无 Android / 对应包名 → **BC-OOS-10**，停止赏金向测试或改走授权私有审计约定  
2. 阅读 Out of Scope / 移动专章（pinning、混淆、root、exported crash）  
3. 默认威胁模型：**未 root**、同设备恶意 App / 深链 / Web；与 audit motto 一致  

### 6.2 测试中

- 禁止：未经允许的 DoS、社会工程、碰生产真实用户资金/数据破坏性操作  
- 导出组件：先追 **敏感 sink**，不要停在 `am start` 成功或 crash  
- SDK：先做 **出货可达性**；不可达 → INV18 / M7  
- MITM：分清「用户已装 CA」与「应用信任错误」  

### 6.3 报告前硬门禁（SKILL 强制）

对每条拟提交 / 拟正式交付的候选，勾选：

| # | 检查 | 失败则 |
| --- | ------ | -------- |
| 1 | 资产在 Targets（或授权书列明） | BC-OOS-10 → 不投奖 |
| 2 | 非「仅缺 pinning / 混淆 / root 检测」 | M1–M3 → 不投 |
| 3 | 非 crash-only 导出组件 / 非纯入口面 | M4 + INV1/INV26 → 不报 |
| 4 | 非 root-only 观察路径 | M5 + INV15 → 不报 |
| 5 | 非不可达 / 项目排除的第三方 SDK | M7 + INV18 → 不报 |
| 6 | 有 **非 root 第三方路径 → 敏感 sink/数据** 的最小证据 | 口号不满足 → 停 |
| 7 | 非扫描器原文 / 非无 PoC 的 CVE 清单 | 09 / 08 / INV12 / INV11 |

### 6.4 字段写法

```text
bounty_eligible: false
rationale: BC-OOS-M4 (exported crash-only) / INV1; live brief <program> 2026-…
# severity 若已由 definitions 填写 → 保留不动
```

---

## 7. 与攻击面清单的分工

| 文件 | 职责 |
| ------ | ------ |
| `android-third-party-attack-surfaces.md` | 怎么扫、五层优先、SRC 接受矩阵（方法论） |
| **本文件** | Bugcrowd 向 **OOS / 资格** 共性门禁（投递纪律） |
| `adjustment-and-invalid.md` | DeepSonar **INV** 语义（报不报） |
| `google-android-devices-rules.md` | Google 设备 VRP 资格（另一项目） |

---

## 8. 明确不做什么

- **不改** `severity` / 不替代 `severity-levels.md`  
- **不**把 `bounty_eligible: false` 当成删除内部 severity 的理由  
- **不**收录或编造各计划奖金数字作政策  
- **不**写武器化 exploit / 免杀 / 大规模 DoS 步骤  
- **不**声称本表覆盖全部 Bugcrowd 私有计划或未来 brief 变更  

---

## 相关引用

- `../SKILL.md` — 报告前 BC-OOS 硬门禁  
- `android-third-party-attack-surfaces.md` — 第三方攻击面与 SRC 矩阵  
- `../../../vuln-definitions-mobile/references/adjustment-and-invalid.md` — INV1 / INV11 / INV12 / INV13 / INV15 / INV18 / INV26  
- `../../../vuln-definitions-mobile/references/google-android-devices-rules.md` — 资格文件体例对照（Google 项目）  
