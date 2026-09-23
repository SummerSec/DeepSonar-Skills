# Chrome VRP 规则（赏金资格，不定级）

本文件对齐 Chrome Vulnerability Reward Program：**算不算计划资产、能不能投、报告够不够格**。  
**不定级。** 档位仍以 `severity-levels.md`（[Severity Guidelines](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/severity-guidelines.md)）为准。

**权威（实时以官网为准，对照日 2026-08-23）**：

| 用途 | URL |
|------|-----|
| 规则与奖金表 | https://bughunters.google.com/about/rules/chrome-friends/chrome-vulnerability-reward-program-rules （短链 https://g.co/chrome/vrp） |
| 投递入口 | https://bughunters.google.com/report/vrp → 选 **Chrome VRP**（直接打 Chromium tracker **已弃用**） |
| 习惯 / FAQ | https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/vrp-faq.md |
| AI 是否安全洞 | https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/faq.md （AI Features） |
| 2026-04 结构调整 | https://bughunters.google.com/blog/evolving-the-android-chrome-vrps-for-the-ai-era |

**纪律**：不得用奖金表或「全链利用奖金」抬 `severity`。金额会改，现场以规则页为准；下表只作资格与量级对照。  
**不写**武器化 exploit；完整链 / MiraclePtr bypass 奖金只记「存在、有名额上限」，不写利用步骤。

---

## 1. 与本插件字段的关系

| 问题 | 看哪里 | 字段 |
|------|--------|------|
| 是不是安全漏洞、哪一档 | `severity-levels.md` + ADJ/INV | `severity` / `severity_rule` |
| 算不算 Chrome 浏览器资产 | `asset-scope.md` | `chrome_process` 等 |
| 能不能按 **Chrome VRP** 投递领奖 | **本文件** | `vrp_eligible` |
| 报告怎么写才过机器人/Shepherd | 本文件 §4 + `gates.md` Gate R | — |

`severity: low` 仍可写正式 finding；VRP 面板通常只认真看 **High / Critical**，低危/中危不因此改成 `none`。  
`Security-Impact_None`（未默开启 / 部分用户旗标）**仍定级**，官方写明 **不压奖金**，只是不走 30/60 天 SLO。

---

## 2. 范围内（资格）

同时满足才标 `vrp_eligible: true`（再叠加 §4 报告质量）：

1. **产品**：出货 Chrome / Chromium 浏览器（Windows / macOS / Linux / Android；Chrome 里随浏览器出货的组件）。**不是** ChromeOS 系统计划、**不是** Extensions VRP。
2. **通道**：Stable / Beta / Dev。鼓励 bisect。
3. **可达**：网页内容，或官方承认的已沦陷 renderer（MojoJS）。出货路径上的三方库（libxml / sqlite / 编解码 / PDFium / Skia 等）须证明 **Chrome 走得到**。
4. **可复现**：能在 Google 基础设施上复现；内存安全须符号化 ASAN / MTE（或 crash ID）+ MiraclePtr Status。
5. **安全实害**：见 `gates.md` Gate C。纯崩溃不是资格。
6. **首次可行动报告**：最小化 PoC、步骤、符号化栈等齐了才算「可行动」。内部工具在报告后 **7 天内**扫到 → 视为已知，无奖。
7. **未向第三方私下披露**（经纪商 / 非修复目的）。公开讨论须符合 Google 披露惯例。

也可评、但常标 `security_impact: none` 仍可能有奖：

- 已推给部分用户的旗标 / 源试用 / 未默认功能（**例外**：V8 `--experimental` 专属）
- 未沙箱 GPU 驱动 / Mesa / Mali 等，须证明从 Chrome（常是 renderer）触发

---

## 3. 范围外 / 无奖（常见）

| 情况 | 本插件 |
|------|--------|
| HEAD / Trunk 落地未满约 **7 天** | 可对内定级；`vrp_eligible: false` |
| 只在 Canary / 本地自编译 / 测试二进制上成立 | 范围外或对内 |
| V8 **Experimental** 专属、SwiftShader、WebNN 未出货加固、`--single-process`、弹出不安全提示的 unsafe 旗标 | `vrp_eligible: false`；仍可对内定级并标 `security_impact: none`（ADJ7） |
| MiraclePtr `PROTECTED` | **非安全**（INV1）；bypass 奖金另见 §8，不是把 PROTECTED 当洞报 |
| 纯理论 / 静态分析无演示 | 不可行动，WontFix |
| 站点自己的 XSS、隐私指纹、物理本机、无安全决策 UI 骗 | INV，不是 VRP |
| iOS 上 **仅 WebKit** 的洞 | 走 Apple；本插件主模型外。Chrome iOS 壳自身实现另论 |
| ChromeOS 系统（登录、verified boot、`chronos`→root） | **ChromeOS VRP**，不是本计划 |
| 扩展商店 / 扩展 API 专项 | **Chrome Extensions VRP** |
| 用 unittest / `browser_tests` / 自定义 harness / CDP 包一层当唯一证据 | 无奖，须 `chrome` / `d8` / `pdfium_test` + 文件 PoC |

面板对奖金有最终裁量；低于基线的报告会降奖或零奖，反复提交可封号。

---

## 4. 报告质量基线（2026-03 起更严）

过不了这一节 → 即使洞是真的，也按不可投递 / 降奖处理。

- **短、只写已证明的安全问题**。不要把 UAF 和安全 CHECK 崩溃写在同一份里（机器人会关）。
- **附件**：`poc.html` / `index.html` 等**单独文件**；禁止整包 zip/tar；禁止外链站点或外链视频当唯一 PoC。
- 示例 HTTP 服务 **只许 Python**，且不要要求 root。
- 内存安全：符号化 ASAN，含全部 additional information；用 Chrome 标准缓解/加固旗标编出来的 sanitizer。
- 已沦陷 renderer：**MojoJS**。补丁须解释为何 MojoJS 不够，且带 `--type=renderer` 进程守卫。
- **不要**自定义 harness、改 `browser_tests`、用 CDP/调试器包一层跑 Chrome。
- 受控读/写：首报就附 `vrp-flag.json` + `poc-asan.html` + `poc.html`，走官方 `vrp_flags`；只接受已发布 Stable/Beta/Dev；不接受 Canary/本地编、补丁 renderer、多文件多服务器。支持 OS 以 FAQ 为准（对照日：Win11 x64/ARM64、最新 macOS ARM64、Debian stable + Wayland x64/ARM64）。
- 空首评 / 占坑单会被关，可导致账号暂停。
- **AI 代写报告**：须人工验证威胁模型 + 可达 + PoC/ASAN。批量低质量 AI 报告按刷屏封号。

公开：多数安全 bug 在标 Fixed（合入 main）后约 **14 周**自动公开（Chromium Issue Tracker，不是 bughunters 个人页）。

---

## 5. 内存安全奖金形态（摘要，不定级）

对照 2026-04 结构调整：基线约 **$500**，再按落点 × 网页/MojoJS/补丁 renderer × ASAN 读/写/受控 r/w 乘。  
**完整乘数与金额以规则页表格为准。** 下面只记本插件用得着的资格含义：

| 形态 | 资格要点 | 条款倾向（定级另走） |
|------|----------|----------------------|
| 网页 → browser / 未沙箱 network / GPU | 须网页可达、可靠、未被缓解 | C1 / C2 / H6 |
| 已沦陷 renderer → 高权进程 | MojoJS；补丁 renderer 档更低且受控 r/w 常无效 | H4 / H5 / H8 |
| renderer / 已沙箱进程 ASAN | 小 OOB 读 / use-after-poison 常按 Read；其它写、UAF、指针宽读常按 Write | H1 / L1 / L2 |
| V8 逻辑 / **V8 sandbox** | 引擎内沙箱，**不是** OS 沙箱。bypass 报告须按官方 d8 旗标（如 `--sandbox-testing`），标题标 `[V8 Sandbox Bypass]` | H2 / 见类型 M8a |
| 须重交互、装扩展、关浏览器/毁 profile、异常旗标、纯竞态 | 常封顶基线奖 | ADJ2 / ADJ3 / L3–L6 |

须 **未缓解** 才拿满额。MiraclePtr PROTECTED = 已缓解 = 非安全，不是「降奖的内存洞」。

---

## 6. 其它漏洞类（奖金量级，不定级）

规则页对「能证明用户危害」的非纯内存类另设上限（对照日，**以官网为准**）：

| 类 | 量级（约） | 本插件条款 |
|----|------------|------------|
| UXSS / Site Isolation 绕过 | 可至约 $10k | H9–H11 |
| 用户信息泄露、LPE、omnibox 源完全可控、Web 平台提权 | 可至约 $5k | H12 / H13 / M8 等 |
| 未单列但有用户危害 | 面板按危害与报告质量裁量 | 仍须先定级 |

只报「可能」「布局像能读」而无受控原语或可演示跨源/权限后果 → 不够格。

---

## 7. Chrome 内 AI / Gemini

Chrome 把误导、未对齐、不安全的**模型输出本身**不当漏洞（走产品反馈）。

**可评（须无用户确认即发生、能演示）**：

| ID | 类型 | 是 | 不是 |
|----|------|----|------|
| A1 | **Rogue Actions** | 间接触发，改受害者账号/数据，有安全后果（未预期付款、删号、实质性损坏） | 自己会话里越狱、让模型说脏话/违法内容 |
| A2 | **敏感数据外带** | 把受害者 SPII/PII/跨站敏感数据送到攻击者可控处，且无有效确认 | 系统提示词套话、无敏感数据的 preamble |
| A3 | **AI 表面 XSS** | 可信 AI UI 上下文执行脚本（须消毒失败的演示） | 用 DevTools 往可信面硬塞代码 |

奖金按影响 × 可扩展/可靠（对照日 Rogue 高影响+可靠可至约 $20k，外带约 $10k）。可附 ASR 数据拿小额可靠度奖。须新会话录像 + 附件；有 Gemini 会话则分享会话与模型版本。

**非安全 / 非本计划**（INV19）：越狱、幻觉、自己输入导致不当输出、拷贝粘贴提示词、仅控制输出措辞、不可见页面内容影响输出、点了才泄露的链接、合规/IP。后端滥用走 Google Abuse / Google VRP，不走 Chrome VRP。

---

## 8. 利用奖金（不改档）

2026 年起部分旧「RCE / 任意 r/w」附加奖已收束。仍可能存在、且 **有年度名额上限** 的包括：

- **完整链**（最新 64 位 OS、硬件缓解开、Stable/Beta、从网页内容）：高额；须 MojoJS 则较低一档
- **MiraclePtr bypass**（新颖手法；直接吃 zapped `\xef` 字节不算新）

这只改修复优先级与奖金，**不改** `severity`。本插件 **不写** 利用链、不写 bypass 手法。有利用要后补时，走官方 exploit 评估热表，且须打已发布构建。

---

## 9. 现场怎么填

```
过 Gate T/S/P/D/C/R 且非 INV
  ├ 定级 → severity + severity_rule
  ├ 对照本文件 §2–§4
  │    ├ 通道/7 天/排除旗标/报告质量不过 → vrp_eligible: false（仍可 reportable）
  │    └ 全过 → vrp_eligible: true
  └ 金额：打开规则页，不要背本文件数字
```
