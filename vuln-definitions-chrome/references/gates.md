# 挖掘门禁 Gate T、S、P、D、C、R 与报告要求

发现可疑点后 **按顺序回答**；任一「否」→ 不进入深度 PoC，最多记对内缺陷。  
形态见 `chrome-vuln-types.md`；沙箱见 `process-sandbox.md`；范围见 `asset-scope.md`；VRP 资格见 `vrp-rules.md`。

> **Gate 字母仅在本域内有效**（Chrome 用 `T`、`S`、`P`、`D`、`C`、`R`）。不要套用其它域的字母含义（OH 的 `A`–`D` / `V`，DB 与 Mobile 的 `E` 等）。

## Gate T · 攻击者是谁？（威胁模型）

- [ ] **T1** 攻击者可以是：**网页内容**（打开页面 / 默认打开的远程文件），或 **已沦陷 renderer**（MojoJS 模拟）？
- [ ] **T2** 不需要：同一 OS 用户已控、投放 DLL、改 PATH、物理接触、已中毒机器、开着调试端口？
- [ ] **T3** 交互不是「普通用户不会做、网页也劝不动」的那种？
- [ ] **T4** 不需要再叠一个**未证明**的第二洞，才让当前洞有安全含义？（已沦陷 renderer 本身算已证明前提）

## Gate S · 是不是本插件的浏览器资产？

对照 `asset-scope.md`。

- [ ] **S1** 目标是出货 **Chrome / Chromium 浏览器**，不是 ChromeOS 系统镜像、不是 iOS WebKit 壳当主模型？
- [ ] **S2** 不是 `unit_tests` / `browser_tests` / 其它测试二进制？
- [ ] **S3** 不是只在 Chrome for Testing / `chrome-headless-shell` 上打不可信内容？
- [ ] **S4** 三方库问题已证明在 **出货 Chrome 路径**可达？
- [ ] **S5** 不是 VRP 明文排除且用户只关心赏金的配置（V8 `--experimental` 专属、SwiftShader、WebNN 未出货、`--single-process`、带警告的 unsafe 旗标）？仍要定级时可标 `security_impact: none`，并写 `vrp_eligible: false`（见 `vrp-rules.md` §3）
- [ ] **S6** 不是 ChromeOS 系统计划、不是 Extensions VRP 专项、不是仅 WebKit 的 iOS 洞？
- [ ] **S7** 若落在 Chrome 内 AI / Gemini：是未确认 Rogue Action / 敏感数据外带 / AI 表面 XSS，而不是越狱、幻觉、对齐或仅系统提示词（INV19）？

## Gate P · 进程与沙箱认清了吗？

- [ ] **P1** 写清落点进程：`browser` / `renderer` / `gpu` / `network` / `utility` / `kernel` / `other`
- [ ] **P2** 按 **最弱沙箱的出货平台** 填写 `chrome_sandbox`（见 `process-sandbox.md`）
- [ ] **P3** 没有把「已沙箱 GPU RCE」写成 Critical，也没有把「网页直达 Android 未沙箱 GPU」写成 High
- [ ] **P4** 没有把 Site Isolation / iframe sandbox / CSP sandbox 写成 OS 沙箱逃逸

## Gate D · 默认、出货、可达？

- [ ] **D1** 出货通道（Stable / Beta / Dev）或至少已推给部分用户的配置可走到？仅 HEAD 落地未满 7 天 → 对内
- [ ] **D2** 不是必须 `--single-process`、带警告的 unsafe 旗标、仅测试构建？
- [ ] **D3** `Security-Impact_None` 已标明，但仍按四档定了级（未默开启 ≠ 非漏洞）
- [ ] **D4** 现网 / 所审计的当前公开版本仍在？只在已修旧版本上成立 → 对内

## Gate C · 有没有「安全实害」？

至少命中一条，且能演示（Chrome FAQ：纯崩溃不是安全实害）：

| 实害类型 | 合格例子 | 不合格例子 |
|----------|----------|------------|
| 平台权限 | 网页或以用户权限读写任意本地资源 | 标签页崩溃、CHECK |
| 沙箱内代码 | renderer / V8 ACE（ASAN 可利用损坏） | MiraclePtr PROTECTED；空指针小固定偏移 |
| 源 / 隔离 | UXSS、跨站同 renderer、跨站数据 | 站点自己的 XSS |
| 跨进程原语 | 已沦陷 renderer 受控 ≥16B 读；可利用 browser 损坏 | 「可能泄露布局」且无受控读 |
| 安全决策 UX | 理性用户把源/权限/安装认错 | 骗复制、骗下载、骗导航 |
| 提权 | 标准安装无前提系统提权 | 已用管理员跑 Chrome |
| AI / Gemini | 间接触发未确认有害动作，或敏感数据外带到攻击者处 | 越狱、幻觉、自己会话越狱、仅系统提示词 |

- [ ] **C1** 危害大于攻击者已有能力（网页本来就能做的事不算）
- [ ] **C2** 不依赖不合理社工；允许一次正常导航或一次打开文件
- [ ] **C3** 能用一句话说清：**谁、在什么出货配置下、越过哪条边界、造成什么可观测结果**

## Gate R · 能否按官方习惯复现？

- [ ] **R1** 内存安全：符号化 ASAN，含 MiraclePtr Status 与全部 additional information；`PROTECTED` → 停
- [ ] **R2** PoC 是单独附件（`poc.html` / `index.html`），不是外链站点、不是 zip/tar
- [ ] **R3** 用 `chrome` / `d8` / `pdfium_test`，不用 `unit_tests` / `browser_tests`、不用 CDP/自定义 harness 包一层
- [ ] **R4** 已沦陷 renderer 用 MojoJS，而不是随意改 browser 补丁充数（补丁须解释为何 MojoJS 不够，且带 `--type=renderer` 守卫）
- [ ] **R5** finding 写清 `subject_revision` 与 `live_checked`
- [ ] **R6** 受控 r/w（若声称）：首报就附 `vrp-flag.json` + `poc-asan.html` + `poc.html`，只打已发布 Stable/Beta/Dev，不用 Canary/本地编、不用补丁 renderer、不多文件多服务器
- [ ] **R7** 报告只写已证明的安全问题（不要把 UAF 和安全 CHECK 写在同一份）；空首评 / 占坑单按不可投递

## 决策

```
Gate T 不过     → 非威胁模型，停
Gate S 不过     → 非本插件资产 / 测试件，停
Gate P 不过     → 进程/沙箱没认清，不定档
Gate D 不过     → 仅 HEAD 过新 / 仅旧版 / 仅 unsafe 旗标 → 对内或 Impact_None
Gate C/R 不过   → 无安全实害或不可复现，停
全过            → 四档定级，可写正式 finding；再对照 vrp-rules.md 填 vrp_eligible
```

---

## 报告要求（对齐 Chrome VRP，供已授权投递）

投递走 [Bughunters](https://bughunters.google.com/report/vrp) 选 **Chrome VRP**。细则见 `vrp-rules.md`。

1. **人工验证**；空描述 / 纯理论静态分析会被关；空首评可导致封号
2. **版本与 OS**：Chrome/Chromium 版本、通道、OS/架构；鼓励 bisect
3. **最小化 PoC 文件**单独附上（`poc.html` / `index.html`）；不要 zip；不要外链站点或外链视频当唯一 PoC
4. 示例 HTTP 服务 **只许 Python**，且不要要求 root
5. **内存安全**：符号化 ASAN + 全部 additional information + MiraclePtr Status；用 Chrome 标准缓解/加固旗标编 sanitizer
6. **已沦陷 renderer**：优先 MojoJS；受控读写首报就带 `vrp-flag.json`（官方 `vrp_flags.mojom`）
7. 不要完整武器化 exploit；验证路径与受控 r/w 证明即可。全链 / MiraclePtr bypass 奖金不改 `severity`
8. **AI 代写报告**须人工核威胁模型 + 可达 + PoC/ASAN；批量低质量按刷屏

**禁止**：未授权目标、对真实用户数据破坏性验证、上报前公开利用细节。

---

## 实害话术模板

```text
【攻击者】网页内容 / 已沦陷 renderer（MojoJS）…
【前提】出货 Stable/Beta/Dev；默认沙箱；无需 --single-process …
【进程】browser | renderer | gpu | network …；该 OS 上 sandboxed/unsandboxed
【步骤】1 … 2 … 3 …
【可观测危害】
  - 平台：以用户权限读/写 …
  - 源/隔离：在 origin B 执行 / 读到跨站 …
  - 原语：受控读 ≥16B / ASAN 可利用损坏 …
【边界】不能 …（主动写清，避免按过高档驳回）
【对照条款】severity-levels.md#H4（已沦陷 renderer → browser 内存破坏）…
【MiraclePtr】NOT PROTECTED | n/a
```

### 合格 vs 不合格表述

| 不合格 | 合格 |
|--------|------|
| “renderer 崩了所以是 RCE” | “ASAN use-after-free NOT PROTECTED，网页可达，按 H1” |
| “GPU 洞一律 Critical” | “Android 上 GPU 未沙箱且网页直达 → C2；Windows 已沙箱 → H3” |
| “iframe sandbox 逃逸 = 出沙箱” | “源隔离问题，按 H9/H10，不是 C1/C2/H4” |
| “可能读到 browser 内存” | “已沦陷 renderer 受控读 ≥16 字节（H5）或仅未初始化 IPC（L7）” |
| “MiraclePtr PROTECTED 也报高危” | **不投递**；功能缺陷 |
