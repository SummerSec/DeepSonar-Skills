# 移动端漏洞形态主表（mobile-vuln-types.md）

按形态归类移动端（Android App + iOS App）应用层漏洞。先定形态（本文件），再映射八类 `vuln_type`（`vuln-definitions`），再按 `severity-levels.md` 定档。组件索引见 `attack-surfaces.md`。

形态 ID 供 finding 的 `mobile_class` 字段使用。平台前缀：**AD**–**AP** 为 Android，**IU**–**IA** 为 iOS。

> 形态来自 [s7safe/android-h1](https://github.com/s7safe/android-h1) 的 android.md / IOS.md（100+ 份 HackerOne 报告）与移动平台架构归纳。`条款倾向` 只是方向，最终档位由 `severity-levels.md` 的矩阵定。

---

# Android 族

## AD · Deep Link / 深度链接（Android）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| AD1 | 路径遍历 → 任意文件读写 / 导出 / 上传 / RCE | `Uri.getLastPathSegment()` 解码 `%2f`、文件名未净化，写到私有目录外或覆盖 `.so`（对照 Evernote `..%2f..%2f` 系） | C1（写 .so→RCE）/ H2（文件读写） |
| AD2 | 验证绕过 → WebView 劫持 / 注入 / XSS / UXSS | Deep Link 参数未校验直接 `loadUrl`，任意 URL 或 `javascript:` | H3 / H2（UXSS） |
| AD3 | 会话劫持 / 账户接管 | 令牌 / cookie 经 Deep Link 参数传递，外部可控 | C2（完整接管） |
| AD4 | CSRF | 深链接触发敏感操作（改绑手机 / 发消息），无来源校验 | M / H（按实害） |
| AD5 | JS bridge 接口滥用 | 深链接带参调 `addJavascriptInterface` 暴露方法 | H / C1（若可达 RCE） |
| AD6 | **已废止（入口面本身）** | 仅证明 exported MainActivity / 自定义 scheme / 不校验调用方可被外部拉起；打开默认页或官方登录页。未证明未授权敏感 sink | 排除（INV26）；新 finding 不得填 `AD6` |

映射：`file-access`（AD1）、`injection`（AD2/AD5 XSS）、`authz`（AD3/AD4）、`rce`（AD1 写 .so / AD5）。AD6 已废止（INV26，入口面本身不定漏洞）。

## AW · WebView（Android）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| AW1 | WebView RCE | `setJavaScriptEnabled(true)` + `addJavascriptInterface` 注入对象 → JS 反射 `Runtime.exec`（对照 OwnCloud #87835、CVE-2013-4710 族） | C1（主路径稳定）/ 按版本 ADJ |
| AW2 | WebView XSS / UXSS | 任意 URL 加载、`shouldOverrideUrlLoading` 未校验、同源边界 | H3 |
| AW3 | JS bridge 接口滥用 | 注入对象暴露 `getClass` / 敏感方法，JS 侧任意调用 | H / C1 |
| AW4 | CookieStore / 会话泄露 | CookieStore API 时间戳精度、cookie 作用域越界 | M / H |
| AW5 | 任意 URL 加载 / 无校验 | 外部输入进 `loadUrl`，无协议白名单 | H |

映射：`rce`（AW1）、`injection`（AW2）、`secrets`（AW4）、`file-access`（AW 加载 file://）。

## AI · Intent（Android）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| AI1 | Intent Redirection | 从传入 Intent 的 extra 取数据再 `startActivity`，二次投递任意 Intent | H |
| AI2 | Intent 劫持 → XSS | 隐式 Intent 被恶意 App 拦截，替换数据 | M / H |
| AI3 | Intent 重放 / 组件劫持 | 粘性 Intent、可预测 Intent 重放敏感操作 | M |
| AI4 | URI 注入 | Intent 的 URI 未校验，注入 scheme / 主机，**且**被二次跳转 / `loadUrl` / 路由当可信输入 | H（须未授权敏感 sink）；仅投递 URI → INV26 |
| AI5 | Scheme 认证绕过 | intent scheme 触发认证流并**绕过登录进入认证后状态**。仅打开登录页不算 | H（须未授权敏感 sink）；仅唤起 → INV26 |
| AI6 | Path Traversal（读写） | Intent 携带路径，未净化 | H2 |

映射：`authz`（AI1/AI5）、`injection`（AI2）、`file-access`（AI6）。

## AE · 组件导出（Exported Components，Android）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| AE1 | Activity 认证绕过 / 任意 URL 加载 | `exported` + 无权限校验，外部启动**进入认证后界面**或加载任意 URL。仅能打开 launcher / 登录页 / 公开内容不算 | H（须未授权敏感 sink）；仅入口面 → INV26 |
| AE2 | Service 未授权启动 / 绑定 | exported service 被恶意 App 启动 / 绑定，越权操作 | M / H |
| AE3 | Receiver 导出 | exported receiver 接收伪造广播 | M |
| AE4 | Provider 导出 → 数据访问 | exported provider 被外部读写 | H |
| AE5 | 非导出组件被任意启动 / Intent Redirect 加固绕过 | 系统本应拒绝的启动路径可达非导出敏感 Activity；Intent Redirect 防护被有效绕过 | H（原 H6 / H3） |

映射：`authz`（AE1/AE2/AE5）、`file-access`（AE4）。

## AC · Content Provider（Android）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| AC1 | 信息泄露 / 安全锁绕过 | provider 无权限声明、锁屏 / 应用锁绕过 | H（敏感数据） |
| AC2 | SQL 注入 | ContentResolver 查询拼接 | H3 |
| AC3 | 路径遍历（任意文件读） | `openFile` 未校验路径，越界读私有文件 | H2 |
| AC4 | 权限重委托 | 高权限 App 转发 provider 调用（Confused Deputy 的 Provider 侧） | M / H |

映射：`injection`（AC2）、`file-access`（AC3）、`secrets`（AC1/AC4）。

## AB · 广播（Broadcast，Android）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| AB1 | 广播劫持 / 敏感信息泄露 | 隐式广播携带 token / 敏感数据，可被恶意 App 接收 | M / H |
| AB2 | 未受保护隐式广播 | 未指定 package / component 的敏感广播 | M |
| AB3 | 导出的 Receiver 脆弱性 | exported receiver 无权限，接收恶意广播触发敏感操作 | M |

映射：`secrets`（AB1）、`authz`（AB3）。

## AF · 文件与路径遍历（Android）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| AF1 | 任意文件读写 | File 操作未净化输入路径 | H2 |
| AF2 | 符号链接攻击 | 私有目录文件被 symlink 重定向，跨应用读写 | H2 |
| AF3 | 目录遍历 RCE | 下载文件名路径遍历写 `.so` / 覆盖合法库 | C1 |
| AF4 | 任意文件上传 | 上传 / 保存路径未校验，写任意位置 | H |

映射：`file-access`（AF1–AF4）、`rce`（AF3）。

## AA · 认证与账户逻辑（Android）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| AA1 | 2FA / OTP 绕过 | 验证码不失效、可暴力破解、缺少失败锁定 | H |
| AA2 | 短信重发逻辑缺陷 / 限速 | Confused Deputy 绑定他人号码 + 全局限速；**仅账户锁定 / 短信轰炸** 按 INV1 不报；能接到接管链才报 | 排除（INV1）/ H（若接管） |
| AA3 | 账户覆盖（邮箱大小写） | 归一化缺失，邮箱大小写变体覆盖他人账户 | H（接管） |
| AA4 | 认证令牌泄露 | 令牌落日志 / 缓存 / 搜索引擎索引 | H（secrets） |
| AA5 | 认证绕过 | 认证链缺陷，无凭据进入 | C2 |

映射：`authz`（AA1/AA3/AA5）、`secrets`（AA4）。

## AS · 数据存储与密钥（Android）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| AS1 | 不安全数据存储 | SharedPreferences / 明文 SQLite / 外部存储存敏感数据 | M / H（可接管凭据） |
| AS2 | 硬编码密钥 / API key | 源码内嵌密钥，可直接接管服务 | H（secrets） |
| AS3 | 不安全 SSL 配置 | 信任所有证书 / 关闭校验 | H（MITM） |
| AS4 | 日志 / 缓存 / 剪贴板泄露 | 敏感数据落日志、缓存、剪贴板 | M |

映射：`secrets`（AS1/AS2）、`ssrf`（AS3 配合）、`file-access`。

## AT · 任务与窗口（Android）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| AT1 | Task Hijacking / StrandHogg | `taskAffinity` + 未校验来源，恶意 App 叠加界面钓鱼 / 收集输入 | H（需确认最新版本仍受影响） |
| AT2 | Fragment Injection | 动态 Fragment 注入，未校验类名 | H |
| AT3 | 混淆代理（Confused Deputy） | 高权限组件被外部恶意调用，执行越权操作 | H |
| AT4 | UI 覆盖 / 点按劫持（tapjacking） | 叠加窗口覆盖隐私与安全敏感界面、伪造 UI 真实性、隐藏隐私敏感系统指示器 | H10（捕获凭据 / 安全确认）/ M8 |
| AT5 | `FLAG_SECURE` / 截屏保护绕过 | 敏感界面可被截屏 / 录屏或内容外流 | H10 / M8 |

映射：`authz`（AT1–AT4）、`file-access`（AT5 内容落盘时）。

## AP · 权限与访问控制（Android）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| AP1 | 权限绕过 / 保留 | 绕过系统 / signature / dangerous 权限取得敏感数据；一次过 / 使用时（WIU）权限跨进程死亡或重启后保留；后台非法启动 FGS 取得 WIU 权限 | H9 |
| AP2 | Special App Access | 未授权取得权限类 Special App Access，或阻止其撤销 | H9（取得敏感数据）/ M9 |
| AP3 | 跨用户 / Private Space 越界 | 跨用户读取敏感数据；未用指定锁定因子解锁 Private Space | H11 |
| AP4 | **已废止** | 原「破坏性远程 DoS」。可用性攻击一律 INV1，不再定档、不报。编号保留以免旧 `mobile_class` 断裂；新 finding 不得填 `AP4` | 排除（INV1） |
| AP5 | 企业管理面绕过 | 未授权移除 Device Policy Controller（DPC） | M9（有限面）/ H（越权触及企业数据） |

映射：`authz`（AP1–AP3、AP5）。AP4 已废止（INV1）。

## AM · 内存安全（Android 原生）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| AM1 | UAF / 堆溢出 / 越界读 | JNI / 原生库解析不可信输入 | C1 / H1（按前提） |

映射：`rce`（内存破坏归 rce 机理）。

---

# iOS 族

## IU · URL Scheme / Deep Link（iOS）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| IU1 | 劫持（授权码 / 令牌 / 敏感操作） | `openURL` 处理未验证来源，token / 授权码经 URL 被劫持（对照 Uber `uber://` 系） | C2（授权码 → 完整接管）/ H |
| IU2 | 不当授权（来源验证缺失） | `application:openURL:options:` 未检查 `sourceApplication`，**且** URL 参数驱动敏感逻辑。仅能唤起 App / 打开默认页 → INV26 | H（须未授权敏感 sink） |
| IU3 | CSRF / 跨应用请求伪造 | URL Scheme 触发敏感操作（关注 / 发消息 / 改配置），无 state / 来源校验 | M / H |
| IU4 | 敏感信息泄露 | URL 参数携带 token / 凭据 | H |
| IU5 | 应用内 XSS | URL 参数 → UIWebView / WKWebView 未净化 | H |
| IU6 | 本地文件泄露 | scheme → 文件访问 / 路径遍历 | H2 |

映射：`authz`（IU1/IU2/IU3）、`secrets`（IU4）、`injection`（IU5）、`file-access`（IU6）。

## IO · OAuth 流程（iOS）

| ID | 形态 | 典型机理 | 条款倾向 |
|----|------|----------|----------|
| IO1 | 令牌伪造（callback 验证缺陷） | OAuth callback 未验证 `state` / 来源，令牌替换（对照 Twitter #136382） | H |
| IO2 | Redirection URI 劫持 | `ASWebAuthenticationSession` / scheme 回调可被恶意 App 劫持 | H |

映射：`authz`（IO1/IO2）。

## IL · SSL/TLS 与证书（iOS）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| IL1 | 证书验证缺失（MITM） | 信任任意证书 / 自定义网络栈未校验（对照 Twitter #136357，泄露 oauth_token） | H（MITM 窃取会话） |
| IL2 | 证书验证绕过（逻辑错误） | `NSURLSessionDelegate` 错误处理 | H |
| IL3 | 证书固定绕过 | pinning 未实现 / 可绕过 | H |
| IL4 | 任意重定向滥用 | 301 → http，绕过 HSTS | M / H |

映射：`secrets`（IL1 泄露令牌）、`ssrf`（配合）。

## ID · 数据存储与隐私（iOS）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| ID1 | 不安全数据存储 | NSUserDefaults / 明文 plist / SQLite 存敏感数据（对照 Uber / Twitter 大量 case） | M / H（可接管凭据） |
| ID2 | Keychain 误用 | `kSecAttrAccessible` 设置不当，备份 / 同组可读 | M |
| ID3 | 信息泄露 / 隐私侵犯 | 日志 / 备份 / 剪贴板 / 私有 API 追踪 | M / H |
| ID4 | 本地敏感数据存储 | 明文凭证 / token 落盘 | H |

映射：`secrets`（ID1/ID4）、`authz`（ID2）。

## IW · WebView（iOS）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| IW1 | WebView XSS | `loadHTMLString` / `loadRequest` 未净化 | H |
| IW2 | Stored XSS | 持久化数据未净化，注入到 WebView | H |
| IW3 | 信息泄露（通过 Deep Link） | WebView 加载含敏感数据的页面 | M / H |

映射：`injection`（IW1/IW2）、`secrets`（IW3）。

## IM · 内存 / 内核（iOS）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| IM1 | 内存消耗 / 无限制分配 | 无限制分配导致崩溃或卡死 | 排除（INV1） |
| IM2 | 内存破坏 / UAF | WebKit / 解析器 | C / H（按前提） |
| IM3 | 内核损坏 / 提权 / 竞态 | 内核驱动 / 恶意 App 触发 | C（需本地触发前提）/ 通常走系统层 |

> IM3 若属 iOS 系统内核缺陷，语义上更接近 `vuln-definitions-oh`（Phone OS 系统层）；本插件只在**应用触发内核**且目标项目覆盖系统组件时才定。

映射：`rce`（IM2/IM3）。

## IA · 其他（iOS）

| ID | 形态 | 典型机理 | 条款倾向 |
| ---- | ------ | ---------- | ---------- |
| IA1 | 不当认证 | 认证逻辑缺陷（对照 Okta Verify #136276） | H |
| IA2 | 跨应用资源访问（CARA） | scheme 跨应用访问资源 | H |
| IA3 | 路径遍历 | 文件路径未净化（对照 Evernote #136306） | H2 |
| IA4 | 私有 API 滥用 / 持久化追踪 | 私有 API 逃逸沙箱 / 追踪 | M |

映射：`authz`（IA1/IA2）、`file-access`（IA3）。

---

## 归类优先级（边界情况）

1. **跨平台同形**：同一缺陷 Android 与 iOS 同形（如 Deep Link / URL Scheme 劫持）时，`mobile_class` 按目标平台前缀写（AD vs IU），`platform` 字段写实际平台
2. **组件导出优先**：同一现象既可归「Deep Link」又可归「组件导出」时，问「入口在哪」——入口是深链接 → AD；入口是 exported 组件 → AE。**仅入口面、无未授权敏感 sink → INV26，不定 AD/AE 档**
3. **数据存储 vs 泄露**：本地存储泄露在未提权访问前多为 M；含可接管级凭据（API key / token 直接接管服务）才抬到 H
4. **WebView 优先 RCE**：`addJavascriptInterface` 可达反射执行 → AW1 / `rce`，不受「还需要用户点击」过度降档（仍看前提）
5. **系统层剥离**：内核 / 系统服务 / 框架 / TEE / Secure Element / bootloader / 固件缺陷 → `vuln-definitions-oh`；应用层缺陷（WebView / Deep Link / 组件 / 权限 / UI 覆盖）→ 本插件。目标项目为 Google Bug Hunters 的 Android 与 Google 设备项目时，系统层目标仍在范围内，只是档位来源换成 `vuln-definitions-oh`（见 `google-android-devices-rules.md` §10）
6. 拿不准归哪类 → `classification.md`（`vuln-definitions`）
