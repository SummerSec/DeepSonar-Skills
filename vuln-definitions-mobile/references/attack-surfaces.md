# 组件攻击面索引（attack-surfaces.md）

从 **移动端组件 / 配置面** 出发索引到形态（`mobile-vuln-types.md`）。挖掘时按目标平台列出攻击面清单，逐项对到形态再定级。

**边界**：本索引只列 **应用层** 面。平台 / 系统层面（AOSP framework / 内核 / 驱动 / TEE / Secure Element / bootloader / 固件）不在本索引：档位定级走 `vuln-definitions-oh`；目标项目为 Google Bug Hunters 的 Android 与 Google 设备项目时，程序规则与资格见 `google-android-devices-rules.md`。

---

# Android 攻击面

## 1. AndroidManifest.xml 组件

| 攻击面 | 检查项 | 形态 |
| -------- | -------- | ------ |
| 导出 Activity | `android:exported="true"`、intent-filter；能否外部启动**进入认证后界面 / 加载任意 URL**。仅打开 launcher / 登录页 → INV26 | AE1（须未授权敏感 sink） |
| 导出 Service | exported service 能否被恶意 App 启动 / 绑定 | AE2 |
| 导出 BroadcastReceiver | exported receiver 接收伪造广播 | AE3 / AB3 |
| 导出 Provider | `content://` 能否被外部读写 | AE4 / AC1 |
| 权限声明 | `<uses-permission>` 是否过度；provider 权限缺失 | AC1 / AE4 |
| `taskAffinity` / `allowTaskReparenting` | 任务栈可被外部 App 叠加 | AT1 |

## 2. Intent / Deep Link

| 攻击面 | 检查项 | 形态 |
| -------- | -------- | ------ |
| intent-filter（action/data） | 隐式 Intent 可被拦截；Deep Link 声明不当。仅声明、无未授权敏感 sink → INV26 | AI2 / AD |
| Deep Link 路径处理 | `getLastPathSegment()`、文件名未净化、`%2f` 解码 | AD1 |
| Deep Link → WebView | 参数未校验直接 `loadUrl`（须实际加载） | AD2 / AD5 |
| Intent extra 二次投递 | 从传入 Intent 取数据再 `startActivity` | AI1 |
| Intent scheme | `<scheme>://` 触发认证流并绕过登录。仅唤起 / 打开登录页 → INV26 | AI5 |
| 入口面本身 | 仅 `exported` / 自定义 scheme / 不校验调用方 / `START` / `onNewIntent` / 打开默认页或官方 SSO Custom Tab | 排除（INV26）；不得填 AD6 |

## 3. WebView

| 攻击面 | 检查项 | 形态 |
| -------- | -------- | ------ |
| JS 配置 | `setJavaScriptEnabled`、`setAllowFileAccess` | AW2 / AW5 |
| JS bridge | `addJavascriptInterface` 注入对象是否暴露敏感方法 | AW1 / AW3 |
| URL 加载 | `loadUrl` / `shouldOverrideUrlLoading` 输入校验 | AW2 / AW5 |
| Cookie | CookieStore API、cookie 作用域 | AW4 |

## 4. 数据与存储

| 攻击面 | 检查项 | 形态 |
| -------- | -------- | ------ |
| SharedPreferences / SQLite | 明文敏感数据、备份可读 | AS1 |
| 外部存储 | `getExternalFilesDir` / 公有存储写敏感数据 | AS1 |
| 源码内嵌 | 硬编码 API key / token / 密钥 | AS2 |
| 日志 / 缓存 | Log.d 打 token、缓存敏感数据 | AS4 |
| 剪贴板 | 敏感数据写剪贴板 | AS4 |
| 文件操作 | File 路径未净化、symlink 攻击 | AF1 / AF2 |

## 5. 网络栈

| 攻击面 | 检查项 | 形态 |
|--------|--------|------|
| SSL/TLS 配置 | 信任所有证书、关闭校验、自签可过 | AS3 |
| 证书固定 | pinning 是否实现、可绕过 | AS3 |

## 6. 其他

| 攻击面 | 检查项 | 形态 |
| -------- | -------- | ------ |
| Broadcast | 隐式广播携带 token、未指定 package | AB1 / AB2 |
| Fragment | 动态 Fragment 类名未校验 | AT2 |
| 原生库（JNI / .so） | 不可信输入进解析器 | AM1 |
| 认证逻辑 | 2FA / OTP 失效、短信重发限速 | AA1 / AA2 |
| 账户绑定 | 手机 / 邮箱归属校验缺失（Confused Deputy） | AA2 / AA3 |

## 7. 权限、UI 与多用户

| 攻击面 | 检查项 | 形态 |
| ----------------------- | ------------------------------------------------------------------- | -------- |
| 权限声明 / 运行时权限 | `uses-permission` 过度申请；系统 / signature / dangerous 权限检查缺失；敏感权限可被阻止撤销 | AP1 |
| 一次性 / 使用时（WIU）权限 | 跨进程死亡或重启后权限未回收；后台启动 FGS 取得 WIU 权限 | AP1 |
| Special App Access | 未授权取得或阻止撤销特权 Special App Access | AP2 |
| 多用户 / Private Space | 跨用户访问敏感数据；未用指定锁定因子解锁 | AP3 |
| 覆盖窗口 / 点按劫持 | 叠加 Activity / overlay 覆盖隐私与安全敏感界面、隐藏隐私指示器、伪造 UI 真实性 | AT4 |
| `FLAG_SECURE` / 截屏保护 | 敏感界面可截屏 / 录屏或内容外流 | AT5 |
| 组件启动路径 | 非导出敏感 Activity 可被任意启动；Intent Redirect 加固可绕过 | AE5 / AI1 |
| 拒绝服务面 | 本地崩溃 / 杀进程 / 资源耗尽 → INV1 不报；破坏性远程 DoS（恢复出厂级）→ AP4 / H8 | AP4（远程破坏性）；本地 → 排除（INV1） |
| 企业管理 / DPC | 未授权移除 Device Policy Controller | AP5 |

---

# iOS 攻击面

## 1. Info.plist / 注册面

| 攻击面 | 检查项 | 形态 |
| -------- | -------- | ------ |
| `CFBundleURLTypes` | 注册的自定义 scheme、可被外部唤起。仅唤起 / 打开默认页 → INV26 | IU1 / IU2（须未授权敏感 sink） |
| Universal Links | associated domains 校验 | IU1 |
| ATS（App Transport Security） | `NSAllowsArbitraryLoads`、例外域 | IL 前提 |

## 2. URL 处理

| 攻击面 | 检查项 | 形态 |
| -------- | -------- | ------ |
| `application:openURL:options:` | 是否检查 `sourceApplication`、参数是否驱动未授权敏感 sink。仅唤起 → INV26 | IU1 / IU2 |
| `scene(_:openURLContexts:)` | `sourceApp` 未验证 | IU2 |
| OAuth 回调 | `state` 验证、回调 URL 可被劫持 | IO1 / IO2 |
| `ASWebAuthenticationSession` | redirection URI 劫持 | IO2 |
| URL 参数 → WebView | 参数注入 `loadHTMLString` / `loadRequest` | IU5 / IW1 |

## 3. WebView

| 攻击面 | 检查项 | 形态 |
| -------- | -------- | ------ |
| `UIWebView`（已废弃） | 同进程执行 JS，任意 URL | IW1 |
| `WKWebView` | JS 注入、消息处理校验 | IW1 / IW2 |
| 本地内容 | `loadFileURL` / 资源目录加载 | IW3 |

## 4. 数据与存储

| 攻击面 | 检查项 | 形态 |
| -------- | -------- | ------ |
| NSUserDefaults / plist | 明文敏感数据 | ID1 |
| Keychain | `kSecAttrAccessible` 误用、同组共享 | ID2 |
| 文件目录 | `Library/`、`Documents/` 明文凭证 | ID4 |
| 日志 / 备份 | 敏感数据落日志、iTunes 备份可读 | ID3 |
| 剪贴板 / 私有 API | 追踪、数据外带 | IA4 |

## 5. 网络栈

| 攻击面 | 检查项 | 形态 |
| -------- | -------- | ------ |
| 自定义网络栈 | 证书校验缺失 / 逻辑错误 | IL1 / IL2 |
| 证书固定 | pinning 未实现 / 可绕过 | IL3 |
| 重定向处理 | 301 → http 绕过 HSTS | IL4 |

## 6. 其他

| 攻击面 | 检查项 | 形态 |
| -------- | -------- | ------ |
| 跨应用资源访问（CARA） | scheme 跨应用读数据 | IA2 |
| 文件路径 | 路径未净化 | IA3 |
| 认证逻辑 | 认证链缺陷 | IA1 |
| 第三方 SDK | 集成的 SDK 网络栈 / 存储缺陷 | 厂商 reference（按项目加） |
