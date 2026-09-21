# 历史漏洞模式库（history-patterns.md）

把历史真实案例提炼为 **模式**，用于两件事：① 挖掘时的高 ROI 切入点；② 定级校准（赏金项目对同类问题的真实档位）。

> 纪律：本文件是 **模式归纳**，不是报告清单；案例仅作定级锚点，不替代 `severity-levels.md` 条款。
> 数据基线：[s7safe/android-h1](https://github.com/s7safe/android-h1) 的 [android.md](https://github.com/s7safe/android-h1/blob/main/android.md) / [IOS.md](https://github.com/s7safe/android-h1/blob/main/IOS.md)（100+ 份 HackerOne 公开报告归纳，对照日 2026-08-30）。
> 形态 ID 见 `mobile-vuln-types.md`；条款见 `severity-levels.md`。报告号仅用于追溯原始案例，不收录为定级依据。

---

## 1. Android 历史案例模式（android.md 归纳）

| 模式 | 案例锚点 | 形态 | 条款倾向 |
|------|----------|------|----------|
| **深链接路径遍历 → 文件写 / RCE** | Evernote `..%2f..%2f` 系（#1362313 / #1416969 / #1377748）——`getLastPathSegment()` 解码 `%2f` 后文件名越界，写 `.so` 覆盖库 | AD1 / AF3 | C1（写 .so）/ H2（写普通文件） |
| **深链接验证绕过 → WebView 任意 URL / XSS / UXSS** | Google / Evernote 大量 case（#1416942 / #1416955 / #1416984）——参数未校验 `loadUrl` | AD2 / AW2 | H3（会话 / UXSS） |
| **深链接会话劫持 → 账户接管** | Target / Evernote 系（#1416945 / 深链接会话劫持族）——token 经深链接参数 | AD3 | C2（完整接管） |
| **深链接 CSRF** | 深链接触发敏感操作 | AD4 | M / H（按实害） |
| **WebView RCE（addJavascriptInterface 反射）** | OwnCloud #87835、Snapchat #54631（客户端 JS 注入）——JS 反射 `Runtime.exec` | AW1 | C1（主路径）/ ADJ11（版本） |
| **WebView CookieStore / 会话泄露** | Chromium #1416988（时间戳精度）、#1417017 | AW4 | M / H |
| **Intent Redirection** | Uber Rider #1416970——从传入 Intent 取 extra 再 `startActivity` 二次投递 | AI1 | H |
| **Intent 劫持 → XSS / 组件劫持** | Quora #189793、Slack #200427（Intent 重放） | AI2 / AI3 | M / H |
| **组件导出 → 认证绕过 / 任意文件读** | Nextcloud #631206（Activity 认证绕过）、Quora #258460、ownCloud #1454002、IRCCloud #288955（+符号链接） | AE1 / AE4 / AC3 | H |
| **Content Provider SQL 注入 / 路径遍历** | Nextcloud #291764（SQL 注入）、Google #1416948（路径遍历） | AC2 / AC3 | H3 / H2 |
| **广播劫持 / 隐式广播泄露** | Nextcloud #167481、Shopify #56002、Bitwarden #289000（导出 Receiver） | AB1 / AB2 | M / H |
| **不安全数据存储 / 明文凭据** | Vine #44727、Coinbase #201855、Whisper #57918 | AS1 | M（默认）/ H4（接管凭据） |
| **硬编码 API 密钥** | Reverb #351555、Coinbase #5786 | AS2 | H4 |
| **2FA / OTP 绕过** | Grab #202425（2FA 暴力破解）、Shopify #1416964（短信重发；**仅轰炸 / 锁定按 INV1 不报**） | AA1 / AA2 | H（接管）/ 排除（INV1，纯 DoS） |
| **账户覆盖（邮箱大小写）** | Vine #187714 | AA3 | H（接管） |
| **认证令牌泄露（含搜索引擎缓存）** | Grab #221558 | AA4 | H |
| **StrandHogg / Task Hijacking** | Reddit #1325649 | AT1 | H（须确认最新版仍受影响，K7） |
| **混淆代理（Confused Deputy）提权** | Google #1416961 | AT3 | H |
| **目录遍历 / 任意文件上传** | Grafana #1416959、Nextcloud #1416976 | AF | H2 / H |

**方向启示**（Android）：

1. **深链接是最大入口面**：android.md 约四成案例落在深链接（路径遍历 / 验证绕过 / 会话劫持）——`getLastPathSegment()`、`loadUrl`、URL 解码不一致是高频缺陷点
2. **导出组件是第二入口面**：manifest 里 `exported="true"` 的 Activity / Provider / Receiver，优先看认证与路径校验
3. **WebView 历史缺陷按版本校准**：`addJavascriptInterface` RCE 族多数已修复，须证明目标当前版本仍暴露
4. **本地存储默认低档**：明文存储多数是 Medium，只有含可接管凭据才抬档
5. **单点无害的链式组合**：深链接路径遍历（写文件）× 覆盖代码文件 = RCE；审计时把「写原语」和「执行原语」连起来看

---

## 2. iOS 历史案例模式（IOS.md 归纳）

| 模式 | 案例锚点 | 形态 | 条款倾向 |
|------|----------|------|----------|
| **URL Scheme 不当授权 / 来源验证缺失** | Uber #136274（Custom URL Scheme）——`openURL:options:` 未查 `sourceApplication` | IU2 | H |
| **URL Scheme 劫持（授权码 / 令牌）** | Uber 系（#136284 / #136314 / #136358 / #136265）——`uber://` 触发敏感操作 / 偷授权码 | IU1 | C2（授权码→接管）/ H |
| **URL Scheme CSRF / 跨应用请求伪造** | Periscope #136286、Uber #136345、TikTok #136359、Twitter #136365 | IU3 | M / H |
| **URL Scheme 敏感信息泄露** | Uber #136300 | IU4 | H |
| **OAuth 令牌伪造（callback 验证缺陷）** | Twitter #136382 | IO1 | H |
| **OAuth redirection URI 劫持** | Uber #136361（ASWebAuthenticationSession） | IO2 | H |
| **SSL/TLS 证书验证缺失 / 绕过（MITM）** | Twitter 系（#136357 / #136256 / #136364 / #136372 / #136310 / #136376）+ Apple #136292 | IL1 / IL2 | H5（窃会话）/ M2（无实害） |
| **证书固定绕过** | Twitter Kit SDK #136373（影响数万集成 App） | IL3 | H |
| **不安全数据存储 / 信息泄露** | Uber / Twitter / Square 大量 case（#136261 / #136266 / #136326 / #136374 …） | ID1 / ID3 | M / H4 |
| **WebView XSS / Stored XSS** | Quora #189793、ThisData #136396、Nextcloud #136318 | IW1 / IW2 | H |
| **WebView 信息泄露（通过深链接）** | Grab #136271（iOS/Android） | IW3 | M / H |
| **深链接 / URI Scheme 处理不当** | Uber #136349、Microsoft OneDrive #136251、Grab #136313 | IU5 / IU4 | M / H |
| **内存消耗 DoS** | Safari #136299 | IM1 | 排除（INV1） |
| **内存破坏 / UAF（WebKit）** | WebKit #136344、Telepat #136259 | IM2 | C / H（按前提） |
| **内核损坏 / 提权 / 竞态** | Apple iOS Kernel #136320 / XNU #136375 / #136363 / #136351 | IM3 | 系统层（走 `vuln-definitions-oh`） |
| **跨应用资源访问（CARA）** | Evernote #136316 | IA2 | H |
| **路径遍历** | Evernote #136306 | IA3 | H2 |
| **不当认证** | Okta Verify #136276 | IA1 | H |
| **私有 API 滥用 / 持久化追踪** | Uber #136370 | IA4 | M |

**方向启示**（iOS）：

1. **URL Scheme 是最大入口面**：IOS.md 约六成案例落在 URL Scheme / 深链接（劫持 / CSRF / 信息泄露）——`openURL:options:` 的来源验证与参数校验是核心
2. **SSL/TLS 是第二大族**：证书验证缺失 / 绕过是 Twitter 系高发，MITM 前提下档位看「能窃到什么」
3. **OAuth 回调是账户层高价值面**：state 验证、redirection URI 劫持直接关系账户接管档位
4. **数据存储默认低档**：与 Android 一致，明文存储多数 Medium，含接管凭据才 H
5. **内核 / WebKit 内存缺陷偏系统层**：非目标项目覆盖范围时剥离到 `vuln-definitions-oh` / 浏览器领域

---

## 3. 定级校准要点（历史案例反推）

历史案例给出了赏金项目对边界情况的 **真实口径**，与 `severity-levels.md` 条款配合使用：

| # | 校准 | 依据 | 落到条款 |
|---|------|------|----------|
| K1 | **深链接 → WebView 任意 URL 加载，即使无完整会话接管也 H**（UXSS / 登录态 / 本地文件面），不必强求完整接管才定高 | android.md 大量 WebView 劫持 case 口径 | AD2/AW2 → H3 |
| K2 | **URL Scheme / 深链接类默认算「远程诱导点击」前提**，不按未认证远程抬档；能偷授权码换完整账户才 C2 | Uber URL Scheme 劫持族 | IU1 → C2（接管）/ H（有限） |
| K3 | **`addJavascriptInterface` 旧版 RCE 族按版本校准**：平台已修复则须证明目标当前版本仍暴露，否则 ADJ11 排除 | OwnCloud #87835 类系 2013 后多已全局修复 | AW1 → C1 前提强；否则降 / 排除 |
| K4 | **SSL/TLS 证书验证缺失 = MITM 前提的 H**，能窃可接管级会话才 H5；无实害数据 → M2 / 排除 | Twitter 证书验证族 | IL1 → H5 / M2 |
| K5 | **不安全数据存储默认 M3**（本地未提权），只有含可接管级凭据（API key / token 直接接管）才 H4 | Vine / Uber / Twitter 存储族 | AS1/ID1 → M3 / H4 |
| K6 | **需已越狱 / root 前提 → 降档或排除**；本地读取类通常不报 | 移动端赏金惯例（默认设备未越狱） | ADJ1 / INV15 |
| K7 | **StrandHogg / Task Hijacking 历史型 → 确认目标最新版本仍受影响才报**，否则排除 | Reddit #1325649（2020 后多数大厂已修） | AT1 → H（前提强）/ INV |

**写 finding 时**：命中 K1–K7 任一校准，在 `rationale` 里写明「对照 history-patterns.md#K_」。

---

## 4. 挖掘切入点（按 ROI 排序）

### Android（当前）

1. **深链接处理链**（`Uri.getLastPathSegment`、`loadUrl`、URL 解码不一致、`shouldOverrideUrlLoading`）：约四成历史产出；产出 AD / AW 族
2. **导出组件清单**（manifest 扫描 `exported="true"`）：Activity 认证绕过、Provider 任意文件读、Receiver 伪造广播；产出 AE / AC / AB
3. **WebView 配置审计**（`setJavaScriptEnabled` + `addJavascriptInterface`、任意 URL 加载）：产出 AW 族（按版本校准）
4. **Intent 重定向链**（从传入 Intent 取 extra 再 `startActivity`）：产出 AI1
5. **认证逻辑**（2FA / OTP 失效、短信重发限速、账户绑定归属校验、邮箱归一化）：产出 AA 族
6. **数据存储与日志**（SharedPreferences / 明文 SQLite / Log 打 token / 硬编码 key）：产出 AS 族

### iOS（当前）

1. **URL Scheme 处理链**（`CFBundleURLTypes` + `openURL:options:` 来源验证 / 参数校验）：约六成历史产出；产出 IU 族
2. **OAuth 回调**（`state` 验证、`ASWebAuthenticationSession` redirection URI）：产出 IO 族
3. **SSL/TLS / 证书固定**（自定义网络栈、`NSURLSessionDelegate` 错误处理、pinning 实现）：产出 IL 族
4. **数据存储**（NSUserDefaults / 明文 plist / SQLite / Keychain 访问性）：产出 ID 族
5. **WebView 加载**（`loadHTMLString` / `loadRequest` 未净化、深链接参数注入）：产出 IW 族
