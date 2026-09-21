# Chrome 资产范围（浏览器 vs 非浏览器）

本文件是 **vuln-definitions-chrome 的资产范围**：落点必须是 **出货 Chrome / Chromium 浏览器** 的安全边界，才按本插件四档出正式 finding。

**权威口径**（实时以官网 / 源码为准，不检入名单快照）：

- 定级：[Severity Guidelines](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/severity-guidelines.md)
- 威胁模型 / AI 是否安全洞：[Security FAQ](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/faq.md)
- 沙箱表：[process-sandboxes-by-platform.md](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/process-sandboxes-by-platform.md)
- **VRP 规则与奖金表**（资格，不定级）：[Chrome VRP Rules](https://bughunters.google.com/about/rules/chrome-friends/chrome-vulnerability-reward-program-rules)（短链 https://g.co/chrome/vrp）
- 投递入口（已授权）：[Google Bughunters → Chrome VRP](https://bughunters.google.com/report/vrp)（直接打 Chromium tracker **已弃用**）
- VRP 习惯：[vrp-faq.md](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/vrp-faq.md)
- 本插件摘要：[`vrp-rules.md`](vrp-rules.md)

本插件 **不替代** ChromeOS 系统定级文档，也不覆盖「任意网站自己的 XSS」。  
**赏金 ≠ 定级**：`severity` 只走 Severity Guidelines；`vrp_eligible` 只回答「能不能按 Chrome VRP 投」。

---

## 1. 怎么判「在范围内」

1. 先定 **产品**：用户安装的 Chrome / 可独立出货的 Chromium 浏览器
2. 再定 **通道**：Stable / Beta / Dev 优先；Canary / 落地未满 7 天的 HEAD 默认对内
3. 再定 **配置**：默认或已推给部分用户；带警告的 unsafe 旗标、`--single-process` 默认出局
4. 再定 **进程**：该 OS 上是否沙箱（`process-sandbox.md`）

模块名与产品不一致时：用「用户会不会在出货浏览器里走到」判断，不要用目录名瞎猜。

---

## 2. 分桶

| 桶 | 如何认 | 处理 |
|----|--------|------|
| **出货浏览器（默认）** | Chrome / Chromium，Stable 默认配置 | 按本插件类型 + 四档 + Gate |
| **出货但未默认** | 已推给部分用户的旗标 / 源试用 | 仍定级；标 `security_impact: none` 或 head/beta；SLO 不同 |
| **Dev 通道** | 官方仍感兴趣 | 可评；修复预期低于 Stable |
| **Canary / 过新 HEAD** | 落地未满约 7 天、trunk-churn | 默认不按可投递；对内 |
| **三方库（出货路径可达）** | libxml / sqlite / 编解码等，Chrome 默认走到 | 按 Chrome 后果定级；建议同时走上游 |
| **三方库（Chrome 走不到）** | 仅测试、仅实验、被 ifdef 掉 | INV / 非本资产 |
| **ChromeOS 系统** | Ash、登录、verified boot、`chronos`→root | **不是**本插件主模型 |
| **iOS Chrome** | WebKit 壳，安全模型不同 | **不是**本插件主模型 |
| **Chrome for Testing / headless-shell** | 不自动更新，只应用可信内容 | 打不可信网 → 范围外 |
| **测试二进制** | `unit_tests`、`browser_tests` 等 | INV12 |
| **嵌入方私有编译** | 不同工具链 / 标准库 / 额外组件 | 以 **出货 Chrome 配置** 是否表现为安全问题为准；仅嵌入方能打到 → 非本档 |
| **VRP 常排除配置** | V8 `--experimental` 专属、SwiftShader、WebNN 未出货、unsafe 警告旗标、`--single-process` | `vrp_eligible: false`；若仍要语义定级，标 Impact_None 并写清 |
| **Chrome 内 AI / Gemini** | 浏览器里随 Chrome 出货的 AI 表面（间接注入导致未确认动作 / 敏感数据外带 / AI UI XSS） | 可评，见 `chrome-vuln-types.md` A1–A3；越狱/幻觉/对齐 **不是** 安全洞（INV19） |
| **GPU 驱动 / Mesa / Mali** | 从出货 Chrome（常是 renderer）可触发的驱动损坏 | 须证明 Chrome 走得到；纯驱动通病且 Chrome 不可达 → 非本资产 |
| **ChromeOS 系统 VRP** | 登录、verified boot、`chronos`→root | **另一计划**，不是 Chrome 浏览器 VRP |
| **Extensions VRP** | 扩展商店 / 扩展 API 专项 | **另一计划**，不是本插件主模型 |

---

## 3. 与类型表的关系

| 问题 | 看哪里 |
|------|--------|
| 这个目录挖什么形态 | `attack-surfaces.md` → `chrome-vuln-types.md` |
| 这个进程算不算未沙箱 | `process-sandbox.md` |
| 算不算安全漏洞 | `adjustment-and-invalid.md` |
| 定级 | `severity-levels.md` |
| 能不能按 Chrome VRP 投 | `vrp-rules.md`（`vrp_eligible`） |

范围只解决 **「算不算 Chrome 浏览器安全问题」**，不解决档位，也不决定奖金。

---

## 4. 审计时怎么用

```
产品是不是出货 Chrome/Chromium 浏览器
  ├ 否（ChromeOS 系统 / iOS 主模型 / CfT / 测试件 / 扩展商店专项）→ 停或换计划
  ├ 仅过新 HEAD（落地未满约 7 天）/ 仅 Canary / 仅 unsafe 旗标 → 对内或 Impact_None；vrp_eligible: false
  ├ 三方库但出货走不到 → 停
  ├ AI 越狱 / 幻觉 / 仅系统提示词 → INV19，停
  └ 是 → 认进程沙箱 → Gate T/P/D/C/R → 四档 → 对照 vrp-rules.md 填 vrp_eligible
```

Finding 建议写：

```yaml
chrome_process: renderer
chrome_sandbox: sandboxed
security_impact: stable | beta | dev | head | none
vrp_eligible: true | false
subject_revision: "chromium@<sha-or-version>"
live_checked: "stable 128.x <日期> | not_checked"
```
