# Android 与 Google 设备项目规则（赏金资格，不定级）

对齐 Google Bug Hunters 的 **Android and Google Devices Security Reward Program**（bughunters `android-friends`）：**算不算计划资产、能不能投、报告够不够格**。
**不定级。** 档位仍以 `severity-levels.md` 为准；本文件的资格与金额判定 **不改** `severity`。

**权威（实时以官网为准，对照日 2026-09-13；规则页标注 Last Updated: April 2026）**：

| 用途 | URL |
| ------ | ----- |
| 项目规则（本文件来源） | <https://bughunters.google.com/about/rules/android-friends/android-and-google-devices-security-reward-program-rules> |
| **代理前缀（本仓环境读外链用）** | <https://proxy.sumsec.me/> → 用法 `https://proxy.sumsec.me/<原始 URL>`（适用于本表任一链接；模式 `/any/`、`/domain/`、`/subdomain/`、`/tdomain/`、`/tsubdomain/`、`/mh/x-header-name/` 见站点首页） |
| 投递入口 | <https://bughunters.google.com/report/vrp> → 选 **Android** / **Google Devices** |
| 已发布威胁模型 / 预期行为 | <https://source.android.com/docs/security/overview/updates-resources> |
| 已知 non-bugs 清单 | <https://bughunters.google.com/learn/invalid-reports/about-this-section> |
| 行为准则（SNR 纪律） | <https://bughunters.google.com/about/rules/other/code-of-conduct-for-our-vulnerability-reward-programs> |
| 后端 / 服务端目标 | <https://bughunters.google.com/about/rules/google-friends/google-and-alphabet-vulnerability-reward-program-vrp-rules> |

**纪律**：不得用奖金表、完整利用链奖金或开发者预览版加成抬 `severity`。金额与名额会改，现场以规则页为准；下表只作资格与量级对照。
**兜底**：本文件未收录的影响类别 / 设备家族，或与规则页冲突的判定 → **回本规则页**（加代理前缀 `https://proxy.sumsec.me/` 读取，见 §12）。
**不写**武器化 exploit：Titan M2 / Secure Element / pKVM 条目只记「存在、有名额上限」，不写利用步骤。

---

## 1. 与本插件字段的关系

| 问题 | 看哪里 | 字段 |
| ------ | -------- | ------ |
| 是不是安全漏洞、哪一档 | `severity-levels.md` + `adjustment-and-invalid.md` | `severity` / `severity_rule` |
| 属哪种移动端形态 | `mobile-vuln-types.md` + `attack-surfaces.md` | `mobile_class` / `component` |
| 能不能按 **本项目** 投递领奖 | **本文件 §4 / §5 / §8 / §9** | `bounty_eligible` |
| 报告怎么写才不被关单 | 本文件 §5 + `gates.md` Gate R | — |

- `severity: low` 仍可写正式 finding；本项目按「用户影响」组织，低档单点多走裁量小额奖或零奖，**不因此改成 `none`**
- 命中 `INV`（`adjustment-and-invalid.md`）或 Gate 不过 → `reportable: false`，谈不上资格
- 系统层目标（AOSP framework / kernel / TEE / bootloader / 固件）**档位来源**换成 `vuln-definitions-oh`，但**本文件的程序规则仍适用**（见 §10）

---

## 2. 范围（资格前提）

**Active Hardware Targets** — 必须在下列合格设备的 **最新公开可用构建** 上复现：

| 家族 | 设备 |
| ------ | ------ |
| Pixel | Pixel 手机、Pixel 平板、Pixel 手表 |
| Smart Home / Google Nest | Nest 摄像头、音箱、显示屏、恒温器、路由器 |
| Fitbit | Fitbit 手环、智能手表 |

- 设备若将在 **90 天内** 到达保证安全更新窗口结束 → **范围外**

**Platform and Software Scope** — 覆盖设备软件栈，含但不限于：

- Android Open Source Project（AOSP）代码
- Android TV、WearOS、Android Automotive OS（AAOS）
- 合格设备上出货的 OEM 专有代码与驱动
- Trusted Execution Environment（TEE）、Secure Element（如 Titan M2）、bootloader、设备固件（含 SoC、MCU、radio 单元）

#### 范围外组件（Out-of-Scope Components）

| 排除面 | 含义 | 本插件 |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| 上游通用 Linux | 上游内核 / 通用 Linux 组件缺陷，除非给出在 Android 或 Pixel 维护模块上直接可利用的功能性 PoC | 无该 PoC → 不报（INV23） |
| 后端 / 服务端 | Google 基础设施、后端 API、与设备交互的服务端服务 | 走 Google and Alphabet VRP（INV24） |

---

## 3. 在范围内影响类别 → 本插件条款

项目按「用户影响」判定，并明确优先自动化 AI 工具难以覆盖的类别。报告须给出「真实用户危害 + 功能性 PoC」；依赖极不可能前提或不现实用户交互的报告通常不合格。
**下方映射只回答「本项目认不认这类影响」；档位仍由条款文件定。**

### 代码执行、内存安全与虚拟化

| Google 影响类别 | 形态 / 路由 | `vuln_type` | 条款 |
| ----------------- | ------------- | ------------- | ------ |
| 任意代码执行（特权 / 非特权 / 受限语境，含 TEE、Secure Element、hypervisor） | AW1 / AD1 / AF3 / AM1；TEE·SE·hypervisor 侧 → 系统层（`vuln-definitions-oh`） | `rce` | C1 / C4 / H1 |
| pKVM 边界击穿（Host↔Hypervisor / pVM 代码执行或信息泄露） | 系统层（`vuln-definitions-oh`） | `rce` | 由 OH 定档 |
| 反序列化与 gadget chain（如 Android Framework 的 Parcel mismatch 链） | AM1 / AI | `deserialization` | C1 / H1 |
| 内存读泄露敏感 PII | AM1 | `secrets` | H3（敏感数据）/ M1（低敏）——数据级别见 `terminology.md` §7 |
| 野外利用 / 利用链关键立足点（ITW） | — | — | ADJ9：只提修复优先级，**不改档** |

### 提权与权限

| Google 影响类别 | 形态 | `vuln_type` | 条款 |
| ----------------- | ------ | ------------- | ------ |
| 权限绕过：绕过系统 / signature / dangerous 权限取得设备敏感数据，或阻止敏感权限撤销 | AP1 | `authz` | H9 |
| Special App Access：未授权取得或阻止撤销特权 Special App Access | AP2 | `authz` | H9（取得敏感数据）/ M9（有限面） |
| While-In-Use 滥用：敏感 WIU / 一次性权限跨进程死亡或重启后保留；后台启动服务取得 WIU 权限 | AP1 | `authz` | H9 |

### UI、Activity 与多用户

| Google 影响类别 | 形态 | `vuln_type` | 条款 |
| ----------------- | ------ | ------------- | ------ |
| Activity / Intent 伪造：任意启动非导出敏感 Activity；非特权后台 Foreground Service（FGS）启动取得 while-in-use 权限；Intent Redirect 加固的有效绕过 | AE5 / AI1 | `authz` | H6 / H3 |
| UI 覆盖与点按劫持：覆盖隐私 / 安全敏感界面、伪造 UI 真实性、隐藏隐私敏感系统指示（如 toast）、绕过 `FLAG_SECURE` | AT4 / AT5 | `authz` / `none` | H10（捕获凭据或安全确认）/ M8（仅覆盖与伪装） |
| 多用户与 Private Space：跨用户读取敏感数据；未用指定锁定因子解锁 Private Space | AP3 | `authz` | H11 |

### 设备管理与拒绝服务

| Google 影响类别 | 形态 | `vuln_type` | 条款 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------ | --------------------------------------- |
| 企业绕过：未授权移除 Device Policy Controller（DPC） | AP5 | `authz` | M9（有限面）/ H（越权触及企业数据时） |
| 破坏性远程 DoS：远程持续 / 永久 DoS，需恢复出厂设置、永久删除用户或 Profile 状态、无交互卸载 App，或反复呼出 / 阻止呼出紧急呼叫 | AP4 | `none` | H8（本地杀进程 / 纯崩溃走 INV1，不落本条） |

> 低于上述影响阈值的提交仍可被逐案审查并给裁量小额奖——**「可能有小额奖」不是抬高 `severity` 的依据**（ADJ4 / INV13）。

---

## 4. 已发布威胁模型与 non-bugs

- 提交前必须对照两份官方清单：AOSP「已接受的架构性危害 / 预期行为」（如 Android 用户同意模型下允许的动作）与 bughunters「已知 non-bugs」（如钓鱼）
- 命中清单的条目 → 关闭、不奖。反复提交已知 non-bugs 或范围外报告 → 可能触发自动限速或更长响应时间
- 本插件侧：命中 `adjustment-and-invalid.md` 的 `INV` → 直接停，与官方清单结论一致

---

## 5. 投递与 PoC 要求（不过即关闭）

1. **首报必须带功能性 PoC**，且以 **机器可读附件** 提交（`.zip` / `.md` / 可执行脚本）
2. 纯 UI 交互类：高质量录像 + 分步说明可替代代码 PoC
3. 纯理论攻击路径、推测假设、**未最小化的 fuzzer 崩溃** → 不可行动，关闭
4. 只占时间戳的 **shell 报告** → 被后续「首个完整可行动报告」取代，不获奖
5. **内存破坏类：必须**附补丁或根因代码修复；缺补丁 → 可能判不合格，或大幅降奖扩乘子
6. **Framework / 逻辑类：强烈期望**附补丁（非强制）
7. 报告从提交起即须可行动：证据齐、可立即分诊

对应本插件：`gates.md` Gate R 的 R1–R7 是通用基线；本项目在其上追加第 1–6 条。`templates` 不写武器化 exploit，验证路径即可。

---

## 6. 重复报告判定

| 情形 | 结果 |
| ------ | ------ |
| 首个 **可行动** 报告（含功能性 PoC + 可立即分诊的技术细节） | canonical，通常拿全额 |
| 先交无 PoC 的占坑单，后补 PoC | 若他人或 Google 自动化系统先给出 PoC 与根因 → 占坑单记为重复、不获奖 |
| 后续报告给出更优 PoC / 更完整根因 / 被工程采用的有效补丁 | 面板可 **拆分** 奖金给 canonical 与后续报告者 |
| 后续报告提供实质可行动情报 | 可在最终 CVE 上获 **共享署名** |

---

## 7. 奖金结构（资格对照，不定级）

**顶级利用链**（须新颖、高可靠，并达成指定结果，如零点击远程代码执行或隔离单元数据外带；上限已含针对 Android 开发者预览版演示的加成）：

| 结果 | 上限 |
| ------ | ------ |
| Titan M2 带持久化 | 至 $1,500,000 |
| Titan M2 无持久化 | 至 $750,000 |
| Secure Element 数据外带 | 至 $375,000 |
| 软件层锁屏绕过 | 至 $150,000 |

**单点漏洞**：不再公布静态价目表，改为 **动态乘子** —— 最终奖金 = 可调基线 × 乘子，按下列四维判定：

| 维度 | 拿满乘子的条件 |
| ------ | ---------------- |
| 可行动性（补丁） | 给出功能性代码修复或具体可行的补丁方案，直接命中根因 |
| 可靠性 | PoC 在合格硬件的最新构建上稳定复现，不需复杂手工环境改造 |
| 影响 | 危害真实且绕过现有现代缓解 |
| 时机 | 在 Android 开发者预览版上演示完整链 → 解锁最高档 |

- 卓越单点（真正新颖的研究或此前未知的原语）可至约 **$25,000**
- **Novelty Bonus**：全新攻击原语或未记录的架构性疏漏，面板可另行加成，不受初始归类限制
- 降奖条件：缺补丁方案、复现不可靠 → 乘子大幅下降（可能仅象征性金额）；根因已知名且在全面修复中 → 项目可冻结或封顶该类
- 金额与名额 **不改** `severity`；本插件不写利用链、不写绕过手法

---

## 8. 账号与信噪比（SNR）纪律

- 低信噪比行为：提交无实质的 shell 报告、提交未验证 / 自动化 / AI 幻觉 findings、反复无视已发布威胁模型 → 自动限速（如活跃报告数硬上限），可永久移出计划
- AI 辅助报告：必须人工核对威胁模型 + 可达性 + PoC，与 `gates.md` 报告要求第 5 条一致
- 报告须短、只写已证明的安全问题；一个 finding 一件事

---

## 9. 合法、披露与资格限制

- **授权测试**：只测自己拥有或获明确授权的设备；不得利用或破坏他人设备、账户、数据；不得损害 Google 服务的可用性或完整性
- **停止条款**：误取敏感用户数据或专有基础设施 → 立即停止测试、删除本地副本、上报 Google
- **协调披露**：公开技术细节或发布 exploit 代码前须给 Google 合理修复期，且须事先书面同意；违规 → 立刻取消奖金资格，可能移出计划
- **个人资格**：制裁名单 / 受美国全面禁运地区（古巴、伊朗、朝鲜、叙利亚、克里米亚、卢甘斯克与顿涅茨克）不付；因行政与银行限制，俄罗斯、白俄罗斯不付；仅 18 岁及以上（未成年人由监护人或可信成年人代投）
- **利益冲突**：与 Google 合作的硬件 / 软件厂商雇员，就其雇主与 Google 合作相关的产品、代码、服务无资格；Google 及 Google 合作方（为该计划覆盖设备写代码者）雇员不发奖
- **税务与裁量**：奖金在多数司法辖区为应税收入，申报责任在提交者；计划可随时单方取消或修改，发奖与资格判定为最终决定
- 本插件纪律叠加：未授权目标不测、禁扫描器、禁碰他人数据、发现 PII / shell 立即停止（`gates.md` 禁止条款）

---

## 10. 与其它文件的边界（路由）

```text
目标是哪一层？
├ 应用层（APK / WebView / Deep Link / 组件 / 本地存储 / 网络栈）
│   → 本插件定级：severity-levels.md + mobile-vuln-types.md
├ 系统层（AOSP framework / kernel / 驱动 / TEE / Secure Element / bootloader / 固件）
│   → 档位来源换 vuln-definitions-oh；本文件仍管程序规则与 bounty_eligible
├ 后端 / 服务端
│   → Google and Alphabet VRP（INV24），本文件不适用
└ 上游通用 Linux 且无 Android / Pixel 模块 PoC
    → 范围外（INV23）
```

- `INV19` 约束的是 **档位来源**（系统层缺陷不得按应用层四档定），与资格无关：在 Google 设备项目里这类目标照样在范围内，只是定级走 `vuln-definitions-oh`
- 八类机理（injection / rce / ssrf / authz / deserialization / file-access / xxe / secrets）仍以 `vuln-definitions` 为准
- 目标项目页有明文排除项时 **以项目页为准**，并写进 `rationale`

---

## 11. 现场怎么填

```text
过 Gate T/S/E/C/R 且非 INV
  ├ 定级 → severity + severity_rule（应用层本插件 / 系统层 vuln-definitions-oh）
  ├ 对照本文件
  │    ├ §2：设备不在活跃硬件清单 / 90 天内到 EOL / 非最新公开构建 → bounty_eligible: false
  │    ├ §3：影响不到任一在范围内类别 → 非本项目口径的依据（不得据此抬 severity）
  │    ├ §5：缺功能性 PoC，或内存破坏缺补丁 → bounty_eligible: false
  │    ├ §8/§9：SNR 违规、越权测试、未批准披露 → bounty_eligible: false
  │    ├ §12 触发兜底（未覆盖 / 冲突 / 判不出）→ 回规则页，按其口径定资格
  │    └ 全过 → bounty_eligible: true
  └ 金额：打开规则页，不要背本文件数字
```

---

## 12. 兜底：回本规则页

**本文件是快照，规则页是权威。** 命中下表任一情形 → 打开规则页，按其口径判定。

规则页：<https://bughunters.google.com/about/rules/android-friends/android-and-google-devices-security-reward-program-rules>

**读取路径（本仓环境）**：

```text
① 加代理前缀拿页面
   https://proxy.sumsec.me/https://bughunters.google.com/about/rules/android-friends/android-and-google-devices-security-reward-program-rules
② ⚠️ 该页是 Angular SPA：直连与①都只回 HTML 外壳（约 3.8 KB，正文为空，Grep “Titan”为空即是外壳）
   正文走渲染 reader：https://proxy.sumsec.me/https://r.jina.ai/<原始 URL>
   reader 按 IP 限速（429 Per IP rate limit exceeded）→ 退避重试，不要换标题重试
③ 拿不到正文时：不得凭记忆填 §3 → 按 F5 处理（`bounty_eligible: false`），`rationale` 写「规则页未能读取，日期」
```

| # | 触发情形 | 兜底动作 |
| --- | --------- | --------- |
| F1 | 规则页新增 / 重命名影响类别，§3 无对应行 | 按规则页「Qualifying Vulnerabilities」判资格；**不新增 / 不改写本插件档位** |
| F2 | 规则页改动硬件清单或设备家族，§2 不覆盖 | 按规则页「Scope and Eligibility」判；不在清单 → `bounty_eligible: false` |
| F3 | 规则页改动 PoC / 补丁要求、奖金或 SNR 纪律，§5/§7/§8 与之不一致 | **以规则页为准**；本文件对应节作废，报告 `rationale` 写实际要求 |
| F4 | 本文件与规则页冲突（含译义歧义） | 以规则页为准；在 `rationale` 写出冲突点与规则页小节名 |
| F5 | 本文件与规则页都未覆盖该情形 | `bounty_eligible: false`（不确定不投）；**不得**凭推测定资格或抬档 |
| F6 | 规则页已改版（对照日之后的变更） | 按 F1–F5 处理，并回写本文件 + bump 插件版本 |

**读法（顺序固定）**：`Scope and Eligibility` → `Qualifying Vulnerabilities` → `Published Threat Models and Non-Bugs` → `Submission & PoC Guidelines` → `Reward Amounts & Payout Structure` → `Legal and Policy Guidelines`。

**兜底边界（硬约束）**：

1. 规则页的兜底只定 **资格与「影响类别是否被接受」**，**不定档位**
2. 档位仍由 `severity-levels.md` 条款定；规则页有对应危害但本插件无条款 → `severity_rule` 填最接近条款，并在 `rationale` 标「未覆盖」
3. 不得用规则页的奖金上下限、类别名或「未覆盖」反向抬高 / 压低 `severity`（与 ADJ9 一致）
4. 兜底结论必须落到 finding：`reason` / `rationale` 写「对照规则页 <小节>，对照日 <日期>」
5. 优先级：**规则页 > 本文件 > 本插件其它条款文件**（仅就“资格”部分）；`severity` 部分仍按本插件
