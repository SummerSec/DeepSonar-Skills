# Chrome / Chromium 浏览器漏洞定级规则

本文件为 **浏览器类（Chrome / Chromium）审计** 的定级规则。  
审计目标为 **出货 Chrome / Chromium 浏览器**（Windows / macOS / Linux / Android）时，优先以本文件条款定级；与全局 `severity-levels.md` / `<type>.md` 冲突时，**浏览器语义以本文件为准**。

> 语义基线：[Chromium Severity Guidelines](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/severity-guidelines.md)（对照日 2026-08-23）。  
> 完整形态、沙箱表、门禁、VRP 资格见插件 `vuln-definitions-chrome`。  
> **不是** ChromeOS 系统定级。赏金表 **不** 改本文件档位。

---

## 1. 何时使用

- 目标是 Chrome / Chromium 浏览器（非网站业务、非 ChromeOS 镜像）
- finding 涉及：browser/renderer/GPU/network 进程、V8/Blink、Mojo、Site Isolation、SOP/UXSS、地址栏/权限 UX、扩展、着色器编译器、Chrome 内 AI / Gemini
- 需要对照官方 Critical/High/Medium/Low（S0–S3），或判断是否根本不是安全漏洞
- 已授权投递时：范围 / 报告质量 / `vrp_eligible` 见完整插件 `vrp-rules.md`（本文件不定资格）

---

## 2. 术语（官方）

| 术语 | 定义 |
|------|------|
| 网页内容 | 不可信网页 / 远程内容；主攻击者模型 |
| 已沦陷 renderer | 已在 renderer 内任意代码（可用 MojoJS 模拟）；沙箱逃逸的合法前提 |
| OS 沙箱逃逸 | 从沙箱进程进入未沙箱高权进程或内核 |
| Site Isolation | 跨站执行上下文不得共享 renderer；跨站数据不得进错进程 |
| MiraclePtr PROTECTED | 该 UAF 在常规构建不可利用 → **不是安全漏洞** |
| Security-Impact_None | 未默开启 / 实验；**仍定级**，不走常规 SLO |

同用户本机已控、物理本机、已中毒机器 **不在威胁模型**。

---

## 3. 四档危害（官方条款）

> 官方四档为 Critical/High/Medium/**Low**（S0–S3）；本仓报告模型为 critical/high/medium/low。  
> 走 `vuln-definitions-chrome` 时 **官方四档均可写入正式 finding**。仓级「只报 C/H」不适用。非安全 / Gate 不过仍不报，不要把低危写成 `none`。

| 档 | 本仓映射 | 一句话 |
|----|----------|--------|
| 严重 | `critical` | 网页直达未沙箱高权 / 任意本地文件 / 完整链出沙箱 |
| 高危 | `high` | 沙箱内 ACE；已沦陷 renderer 逃逸；UXSS / Site Isolation；地址栏源完全可控 |
| 中危 | `medium` | 有限信息、V8 分层正确性、特定扩展、HSTS/插页、完整历史、Metal 编译器 |
| 低危 | `low` | 单字节/renderer OOB 读、特定手势、部分 CSP、弱沙箱、有限 UX 骗、clickjacking |

### 严重（Critical / S0）

| # | 判定条件 |
|---|----------|
| C1 | 浏览器进程（及该平台上同样未沙箱的高权进程，如 Win/Linux/Android 的 Network）内存破坏，网页内容可直接或间接到达 |
| C2 | 未沙箱 GPU 内存破坏，网页可达且不必先沦陷 renderer |
| C3 | 多洞链整体能在沙箱外执行代码（单洞各自低档） |
| C4 | 网页内容读任意本地文件 |

### 高危（High / S1）

| # | 判定条件 |
|---|----------|
| H1 | renderer 内任意代码（内存破坏） |
| H2 | V8 内存破坏或 DCHECK 正确性失败 |
| H3 | 已沙箱 GPU 内存破坏 |
| H4 | 已沦陷 renderer 触发的高权未沙箱进程内存破坏（沙箱逃逸） |
| H5 | 已沦陷 renderer 受控读 browser/GPU/network ≥16 字节 |
| H6 | 高权未沙箱进程内存破坏，需具体但常见的用户交互（如授权限） |
| H7 | 内核内存破坏，可被已沦陷 renderer 用作逃逸 |
| H8 | MojoJS 触发的可利用 browser 崩溃 |
| H9 | 完全 SOP 绕过 / UXSS |
| H10 | Site Isolation：跨站执行上下文共享 renderer |
| H11 | Site Isolation：跨站数据泄露 |
| H12 | 完全控制地址栏显示的源 |
| H13 | 标准安装、无前提的系统提权 |

关浏览器 / 毁 profile：**最高 High**。

### 中危（Medium / S2）

| # | 判定条件 |
|---|----------|
| M1 | V8 不同编译层结果不一致 |
| M2 | 必须安装特定扩展才内存破坏 |
| M3 | browser 损坏需非标准旗标 + 用户交互 |
| M4 | 独立沙箱 Metal 着色器编译器上本应 High 的洞 |
| M5 | HSTS 绕过 |
| M6 | SOP 绕过但须多项前提 |
| M7 | 任意页绕过安全插页 |
| M8 | 稳定读取或推断完整浏览历史 |
| M9 | 标准安装无前提打破 OS 用户/用户边界 |

### 低危（Low / S3）

| # | 判定条件 |
|---|----------|
| L1 | 任一进程不受控单字节越界读 |
| L2 | renderer 内任意越界读（ASAN READ 除非小读，按 WRITE） |
| L3 | renderer 损坏需特定交互（如拖拽） |
| L4 | browser 损坏由关浏览器触发且不可靠 |
| L5 | 已沦陷 renderer 打到的 browser 损坏还须关浏览器 |
| L6 | browser 损坏须带 debugger 权限的扩展 |
| L7 | 高权进程不受控未初始化读，经 IPC 给已沦陷 renderer |
| L8 | 网页画到浏览器 UI 上 |
| L9 | 降低沙箱有效性但未逃出 |
| L10 | 绕过用户手势要求 |
| L11 | 部分 CSP 绕过 |
| L12 | 有限扩展权限绕过 |
| L13 | 有缓解的地址栏欺骗 |
| L14 | 非地址栏/站点信息面板的 UI 欺骗 |
| L15 | 有限浏览历史推断 |
| L16 | 重要警告被其它明显 UI 挡住 |
| L17 | 分栏对话框混淆 |
| L18 | 任何 clickjacking / enterjacking（复杂手势 → 非安全） |

---

## 4. 级别调整（命中即下调或改非安全）

| # | 条款 | 对本模块含义 |
|---|------|--------------|
| ADJ1 | 非网页可达，只靠直接 UI | 降档或非模型 |
| ADJ2 | 罕见用户交互 | 通常降一档 |
| ADJ3 | 须关浏览器或毁 profile | 通常降一档；封顶 High |
| ADJ4 | MiraclePtr PROTECTED | **非安全** |
| ADJ5 | 特定扩展 / 非标准旗标 / debugger / 特定手势 | 落到 M/L |
| ADJ6 | 仅 Metal 独立着色器编译器 | 本应 High → Medium |
| ADJ7 | Security-Impact_None | 仍定级，不走常规 SLO |
| ADJ8 | 只影响部分用户 | **不降档** |
| ADJ9 | 利用链上的单洞 | 不要每环都标 C3 |
| ADJ10 | 野外利用 | 只提优先级，不改档 |

---

## 5. 非安全（官方 FAQ，命中即停）

| # | 条款 |
|---|------|
| INV1 | MiraclePtr PROTECTED |
| INV2 | 仅悬空指针检测、未解引用 |
| INV3 | 纯 DoS / CHECK / 标签页崩溃（不当安全漏洞） |
| INV4 | 空指针 + 一致小固定偏移（≤32KB） |
| INV5 | 普通栈溢出（未跳过 guard page） |
| INV6 | tint ICE |
| INV7 | 物理本机 / 同用户已控 / 已中毒机器 |
| INV8 | 不合理交互 |
| INV9 | 隐私 / 指纹 / Incognito |
| INV10 | 站点自身 XSS / XSS 过滤器绕过 |
| INV11 | 无安全决策的 UI 欺骗 |
| INV12 | 测试二进制 / CfT 打不可信内容 |
| INV13 | Safe Browsing 未收录 / 预加载列表未同步 |
| INV14 | File System Access 黑名单被用户点选绕过 |
| INV15 | 企业策略被本机用户绕过 |
| INV16 | javascript: / DevTools / 书签对自己文档执行脚本 |
| INV17 | 无 PoC 的理论报告 |
| INV18 | 其它应属非安全 |
| INV19 | AI 越狱 / 幻觉 / 对齐 / 仅系统提示词（间接触发未确认动作或敏感数据外带才评） |

**复现**：出货通道 + 符号化 ASAN（含 MiraclePtr Status）+ 文件型 PoC。完整门禁见 `vuln-definitions-chrome` 的 `gates.md`。  
**投递**：Bughunters 选 Chrome VRP；资格见 `vrp-rules.md`，**不**用奖金改档。

---

## 6. 浏览器类型与攻击面（摘要）

完整定义见 `vuln-definitions-chrome` 的 **`chrome-vuln-types.md`**。  
沙箱分平台见 `process-sandbox.md`；目录索引见 `attack-surfaces.md`。

| 类型簇 | 例 | 条款倾向 |
|--------|-----|----------|
| 网页直达未沙箱高权 | browser / Android GPU / Win·Linux·Android network | C1 / C2 |
| 沙箱内 ACE | renderer / V8 / 已沙箱 GPU | H1–H3 |
| OS 沙箱逃逸 | 已沦陷 renderer → browser/内核 | H4 / H7 / H8 |
| 源与隔离 | UXSS、跨站同进程、跨站数据 | H9–H11 |
| UX | 地址栏完全可控 vs 有限骗 | H12 / L13–L18 |
| 着色器 | 仅 Metal 编译器 | M4 |
| AI / Gemini | 未确认 Rogue Actions / 敏感数据外带 / AI UI XSS | 按实害；越狱幻觉 → INV19 |
| 非安全 | DoS、PROTECTED、物理本机、AI 越狱 | INV |

iframe/`sandbox` 与 CSP sandbox **不是** OS 沙箱逃逸。

---

## 7. 报告与定级纪律

- 定级前先跑 Gate：**威胁模型 → 资产范围 → 进程沙箱 → 出货可达 → 安全实害 → 可复现**。
- `severity_rule` 填本文件锚点，如 `chromium.md#H4`、`chromium.md#INV3`（完整插件亦可用 `severity-levels.md#H4`）。另填 `chrome_class` / `chrome_process` / `chrome_sandbox`；可选 `vrp_eligible`（见 `shared/finding-schema.md`）。
- 与 CVSS：本文件定性；量化用 `vuln-scoring`（默认 v3.1）。CVSS **不得**单独抬档；官方低危按 `low` 报。
- **不收录具体 case**：无 CVE / crbug 清单。
