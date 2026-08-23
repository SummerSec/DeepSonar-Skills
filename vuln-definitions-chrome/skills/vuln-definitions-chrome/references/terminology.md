# 术语与威胁模型（官方口径）

本文件对齐 Chromium [Severity Guidelines](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/severity-guidelines.md) 与 [Security FAQ](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/faq.md)。  
定级时先认清 **攻击者是谁** 和 **越过哪条边界**，再打开 `severity-levels.md`。

| 术语 | 定义 | 挖掘时的含义 |
|------|------|--------------|
| **网页内容（web content）** | 不可信网页 / 远程内容，用户浏览即可触达 | 主攻击者模型；能从网页直达未沙箱高权进程 → 严重向 |
| **已沦陷 renderer** | 攻击者已在 renderer / 等价沙箱进程里执行任意代码（可用 MojoJS 模拟） | 沙箱逃逸、跨进程受控读写的**前提**，不是再叠一个未证明洞 |
| **浏览器进程（browser process）** | 未沙箱、持用户完整权限的主进程 | 网页直达的内存破坏 / 任意本地文件读 → Critical |
| **渲染进程（renderer）** | 沙箱内处理网页；含扩展页、PDF renderer | 其内任意代码执行是 High，不是 Critical |
| **OS 沙箱逃逸** | 从 renderer（或其它沙箱）进入未沙箱高权进程或内核，拿到用户完整权限 | 单洞通常 High（前提是已沦陷 renderer）；完整利用链出沙箱可以是 Critical |
| **Site Isolation** | 不同站点的执行上下文不应共享同一 renderer；跨站数据不应进错进程 | 违背 = High；**不是** OS 沙箱逃逸 |
| **同源策略（SOP）** | 网页只能以本源身份行事 | 完全绕过 / 通用 XSS（UXSS）= High |
| **未沙箱 GPU / Network** | 该进程在**至少一种**出货平台上未沙箱（见 `process-sandbox.md`） | 网页直达其内存破坏按 Critical；仅从已沦陷 renderer 触发按 High |
| **MiraclePtr PROTECTED** | ASAN 标明该 UAF 被 `raw_ptr` 挡住、常规构建不可利用 | **不是安全漏洞**（功能缺陷） |
| **Security-Impact_None** | 实验 / 未默开启 / 出货用户碰不到 | **仍按本指南定级**，但不走常规修复 SLO |
| **不合理交互** | 普通用户不会做、网页也很难说服其去做的操作 | 一般降成功能缺陷，不算安全漏洞 |
| **罕见但可能的交互** | 偶尔会发生，但不是平均用户使用该功能的典型路径 | 通常降一档 |
| **关浏览器 / 毁 profile** | 必须先关掉浏览器或毁掉用户配置才触发 | 通常降一档；以此为前提的洞 **最高 High** |

## 攻击者模型（易混点）

| 场景 | 归类 | 说明 |
|------|------|------|
| 打开恶意网页 / 恶意广告 / 被 XSS 的站点 | **网页内容** | 主模型；0-click 或一次正常导航都算 |
| 恶意文件被 Chrome 默认处理器打开（PDF、媒体等） | **网页内容（或等价远程内容）** | 用户一次打开文件仍算浏览器威胁模型内 |
| MojoJS / 补丁模拟已控 renderer 后再打 browser | **已沦陷 renderer** | 官方承认的逃逸前提；不要再要求一个未证明的 renderer RCE |
| 已安装的恶意扩展（普通用户可装的商店扩展） | **扩展前提** | 常降档（见 M 档「特定扩展」）；带 debugger 权限更低 |
| 本机已登录的同一 OS 用户、投放 DLL、改 PATH | **物理本机 / 同用户已控** | **不在威胁模型** |
| 企业策略管理员在已托管设备上 | **特权本机** | 视托管程度；绕过企业策略对终端用户通常不是安全洞 |
| Chrome for Testing / `chrome-headless-shell` | **测试发行版** | 不自动更新；只应用可信内容，不当生产浏览器 |

> 「已沦陷 renderer」是官方写进 High 档的**合法前提**。  
> 「再叠一个未证明的第二个洞才能出沙箱」则是链不完整，按已证明的单洞定级。

## 两条边界（不要混）

| 边界 | 破了通常是 | 不是 |
|------|------------|------|
| **站点隔离 / 源** | High（UXSS、跨站同进程、跨站数据） | 不是出沙箱、不是读任意本地文件 |
| **OS 进程沙箱** | 网页直达未沙箱高权 → Critical；已沦陷 renderer 再逃 → High | iframe/`sandbox` 属性、CSP sandbox 不是这条边界 |

`//content` 口径：逃出 `<iframe sandbox>` 或 CSP sandbox 是 **源 / Site Isolation** 问题，不是 host OS 沙箱逃逸。

## 常见判定速记

- **网页内容 + 未沙箱高权进程内存破坏 / 任意本地文件** → 严重向
- **沙箱内（renderer / V8 / 已沙箱 GPU）任意代码** → 高危
- **已沦陷 renderer + 高权进程内存破坏或 ≥16 字节受控读** → 高危
- **Site Isolation / 完全 SOP 绕过 / 地址栏源完全可控** → 高危
- **完整浏览历史可稳定推断** → 中危；有限历史 → 低危
- **MiraclePtr PROTECTED / 纯 DoS / 空指针小固定偏移 / 不合理交互** → 非安全
- **只影响部分用户（仅 Linux、仅开了无障碍）** → **不降档**
