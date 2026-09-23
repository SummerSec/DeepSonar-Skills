# android-third-party-attack-surfaces — 第三方 Android App 攻击面清单

面向 **已授权的第三方 Android 应用**（普通用户态 App，非系统特权 / 非 ROM）的攻击面枚举与分流清单。  
本文件是 **方法论 checklist**（怎么扫、先看什么、什么不报）；定级仍只引用 `vuln-definitions` + `vuln-definitions-mobile`，**不自产 severity**。

与 `static-manifest.md` / `static-code.md` / `hybrid-and-sdk.md` 互补：那些文件讲阶段怎么做；本文件给 **第三方威胁模型下的优先面与验收纪律**。

---

## 目标

在第三方 / 同设备恶意 App / Web / Deep Link 威胁模型下，快速回答：

> **别的 App、网页或深链，能否驱动本 App 做出敏感动作，或把敏感数据带出？**

不是「能否拿到系统 root / 提权」，也不是「能否让进程崩溃」。

产出：按五层整理的攻击面表 → 高优先候选（导出组件 / Deep Link / WebView / Provider / 本地 Token / 后端越权）→ 移交定级前的 INV1 / INV26 过滤记录。

---

## 1. 威胁模型与框架

### 要点

| 维度 | 约定 |
| ------ | ------ |
| 攻击者 | 同设备恶意 App（默认可安装、默认可声明 queries）、可控网页、可控 Deep Link / Intent、部分场景下同 Wi‑Fi MITM（须授权） |
| 受害者 | 已安装目标 App 的普通用户；目标 **无系统签名 / 无特权** |
| 核心问题 | 外部输入能否驱动 **敏感动作**（支付 / 改绑 / 授权 / 读私有数据 / 任意 URL / 写文件）或 **外泄** Token / PII |
| 不在范围 | 系统特权升级、内核 / TEE、厂商 ROM 专有面 → 路由 `vuln-definitions-oh` |

### 五层框架（入口 → 组件 → 数据 → 网络 → 供应链）

| 层 | 关注 | 第三方场景下的高价值问题 |
| ---- | ------ | -------------------------- |
| **入口** | Deep Link / App Links / 自定义 scheme / 隐式 Intent / 导出组件拉起 | 参数是否当可信输入进 sink（≠ 仅能唤起） |
| **组件** | Activity / Service / Receiver / Provider | 未授权敏感界面、绑定、广播触发、Provider 读写 |
| **数据** | SP / DB / 文件 / 日志 / 剪贴板 / 备份 | 本地 Token、可跨应用读的明文敏感数据 |
| **网络** | TLS、证书、API 鉴权、后端越权 | 凭证误用、接口 IDOR、明文 / 弱校验 |
| **供应链** | 第三方 SDK、打包插件、原生库 | 出货可达的 SDK 组件 / bridge / 网络栈影响宿主（对齐 OWASP **M2**） |

### 陷阱

- **把「能打开 App」当成功利用**：冷启动 / 登录页 / 官方 SSO Custom Tab → **INV26**，不是洞  
- **把系统提权当第三方主线**：普通 App SRC / 审计价值低，且易误路由到 oh 领域  
- **五层平行扫完再分流**：应优先 **入口+组件+本地 Token+后端越权**，供应链与二进制保护后置

---

## 2. INV26 / INV1 纪律（强制）

本清单每条「检查项」在升格为候选前，必须过这两条（全文见 `vuln-definitions-mobile/references/adjustment-and-invalid.md`）：

| 条款 | 纪律 | 第三方场景下的典型误报 |
| ------ | ------ | ------------------------ |
| **INV26** | **入口面本身不是洞**。exported / 自定义 scheme / 不校验调用方 / `am start` 成功 / 打开默认页或官方登录，**无未授权敏感 sink → 不报** | 「MainActivity exported」「自定义 scheme 可唤起」「`getCallingPackage()` 为 null」 |
| **INV1** | **纯本地 DoS 不报**。同设备杀进程 / 纯崩溃 / 本地资源耗尽 → 不报；不得用崩溃撑档 | 「导出组件一调就 crash」「startForegroundService 超时杀进程」 |

### 要点：什么才算「未授权敏感 sink」

须证明外部方可驱动至少一类实害（摘要，定级时对具体 `mobile_class`）：

1. 深链 / Intent **直接**执行登录态敏感操作（改密 / 支付 / 绑定 / 授权 / 改设置），且无二次确认与登录检查  
2. URI / extra 被当可信输入：`url`→WebView、path→读写文件、extra→二次 `startActivity`、token/code 当凭据  
3. OAuth / Magic Link 回调走自定义 scheme 且可截获一次性码（无 PKCE / 校验不足）  
4. 带登录态加载攻击者 URL；或导出 Provider / 文件路径读出敏感数据  

仅唤起、公开首页、仍要登录+确认、参数有白名单 → **INV26**。

### 陷阱

- 把 INV26 写成 Medium/Low「信息性」——**禁止**；`reportable: false`  
- 同一入口既崩溃又泄密：本地崩溃走 INV1 剔除；**机密性/完整性**另按 sink 定档，不得混报成 DoS  
- 破坏性 **远程** DoS（恢复出厂级等）不是 INV1，按移动端 H8 / AP4 移交定级（第三方 App 极少见）

---

## 3. 五层检查表（总表）

| 层 | 优先检查 | 常见 `mobile_class`（示例） | 初判 |
| ---- | ---------- | ----------------------------- | ------ |
| 入口 | Deep Link / App Links / scheme 参数 sink | AD* / AI* | 有敏感 sink → 候选；仅唤起 → INV26 |
| 组件 | 四大组件导出与权限；Provider paths | AE* / AC* / AB* | 未授权读写下发；仅 exported → INV26 |
| 数据 | 本地 Token、可备份/可读明文、日志 | AS* / AA4 / AF* | 可接管凭据优先；纯路径存在 ≠ Critical |
| 网络 | API 鉴权、IDOR、TLS/pinning | AA* / AS3 + 后端 authz | 后端越权常比本地 crash 更有 SRC 价值 |
| 供应链 | 出货可达 SDK 导出组件 / WebView / 硬编码 | 按宿主影响映射 AE/AW/AS…；对齐 **M2** | 不可达 / 项目不覆盖 SDK → INV18 |

---

## 4. Manifest 与四大组件

### 目标

从 `AndroidManifest.xml` 得到完整导出面，区分「入口声明」与「敏感能力」。

### 要点

| 面 | 查什么 | 升格条件 |
| ---- | -------- | ---------- |
| Activity | `exported`、intent-filter、权限、taskAffinity | 进认证后界面 / 任意 URL / 特权操作 → AE1 / AT*；仅 launcher → INV26 |
| Service | exported / 绑定 / foreground | 未授权启动导致敏感操作或数据面 → AE2 |
| Receiver | exported action、有序广播 | 伪造广播触发敏感逻辑 → AE3 / AB3 |
| Provider | authority、读写权限、`grantUriPermissions`、`file_paths` | 外部 query/openFile 读敏感或写越界 → AE4 / AC* |
| 权限与 meta-data | dangerous 权限、推送/地图 key 痕迹 | 痕迹记草稿；有效性验证须授权 |

### 陷阱

- `exported` 缺省随 `targetSdk` 变化，勿凭「没写」推断  
- FileProvider `root-path` / 过宽 path → 比「Provider 存在」更值得追  
- 把「组件可启动」写进正式报告（INV26）

---

## 5. Deep Link / App Links

### 目标

区分「能打开」与「参数驱动敏感逻辑」。

### 要点

| 检查项 | 说明 |
| -------- | ------ |
| scheme / host / path / pathPrefix | 全量录入 `components.json` |
| autoVerify / Digital Asset Links | App Links 校验是否真实生效 |
| 参数 sink | `url`/`token`/`code`/`path`/`id` 是否进 WebView、文件、路由、认证 |
| OAuth / 魔法链回调 | 自定义 scheme 回调是否可被抢占截获一次性码 |

### 陷阱

- 官方登录 Custom Tab / 冷启动默认页 ≠ 钓鱼成功（INV26）  
- 「本 App 吃掉了 Intent」≠ scheme 抢占证明；须证明截获一次性凭据  

---

## 6. WebView

### 目标

确认外部可控 URL / HTML / bridge 是否触及宿主能力。

### 要点

| 检查项 | 说明 | 形态倾向 |
| -------- | ------ | ---------- |
| JS / file access | `setJavaScriptEnabled`、`setAllowFileAccess`、content access | AW2 / AW5 |
| JS bridge | `addJavascriptInterface` 敏感方法 | AW1 / AW3 / AD5 |
| URL 入口 | Deep Link / Intent extra → `loadUrl` / `shouldOverrideUrlLoading` | AD2 / AW5 |
| Cookie / 会话 | 跨源 cookie、file 域会话 | AW4 |

### 陷阱

- 仅配置「开启 JS」无外部可控入口 → 通常不够报  
- debug 包 WebView 调试开关混入 release → 记清构建类型（INV16）

---

## 7. Intent 模式

### 目标

抓住二次投递、隐式劫持与「URI 当可信输入」。

### 要点

| 模式 | 查什么 | 形态倾向 |
| ------ | -------- | ---------- |
| Intent Redirection | extra 取出再 `startActivity` / `sendBroadcast` | AI1 |
| 隐式 Intent | 可被第三方拦截的敏感数据 | AI2 / AB1 |
| URI 注入 | scheme/host 注入且进入 loadUrl / 路由 | AI4（须敏感 sink；仅投递 → INV26） |
| 认证 scheme | 触发认证流并进入已认证状态 | AI5（仅打开登录 → INV26） |
| 路径类 extra | 未净化路径读写 | AI6 / AF* |

### 陷阱

- PendingIntent 可变 / 隐式 → 按实际落地组件验证，勿停在静态吓唬  

---

## 8. 存储与本地 Token

### 目标

优先找 **可导致会话接管或 PII 批量外泄** 的本地数据，而非「磁盘上有个文件」。

### 要点

| 位置 | 查什么 | 形态倾向 |
| ------ | -------- | ---------- |
| SharedPreferences / MMKV / DataStore | token、cookie、密钥明文 | AS1 / AA4 |
| SQLite / Room | 账号、会话、支付凭证 | AS1 |
| 外部存储 / 媒体目录 | 可被其他 App 读的敏感文件 | AS1 / AF* |
| 日志 / 剪贴板 / 备份 | `Log` 打 token、`allowBackup` | AS4 |
| 硬编码 | 源码 / 资源 / so 内 API key、私钥 | AS2（须证明可滥用） |

### 陷阱

- root 后读私有目录 → INV15，第三方模型默认不靠 root  
- 「存在 API key 字符串」无证明可接管服务 → 勿直接抬 Critical  

---

## 9. 网络与后端 API

### 目标

客户端只是入口；**后端越权 / 凭证误用** 往往比本地 DoS 更有第三方 SRC 价值。

### 要点

| 检查项 | 说明 |
| -------- | ------ |
| TLS / NSC | cleartext、信任所有证书、错误 TrustManager → AS3 |
| 证书固定 | 有无 pinning；仅「可 Frida 绕过」通常不够单独成洞 |
| 鉴权头 / Token | 重放、固定设备码、可预测会话 |
| 对象级越权 | 改 `userId`/`orderId` 读他人数据（IDOR） |
| 批量导出 / 未授权管理接口 | 客户端隐藏入口仍打到后端 |

### 陷阱

- 把「Burp 能解 HTTPS（用户已装证书）」写成漏洞  
- 只报客户端缺 pinning、无会话窃取实害 → 价值低，对照项目页  

---

## 10. 硬编码与密钥

### 要点

- 区分：**可直接调用厂商/支付/推送开户能力的密钥** vs 无害的 client id / 渠道号  
- 云存储 / 推送 / 地图 / 热更签名密钥：验证权限范围后再进候选  
- 与 M1（凭证误用）、M10（弱密码学）交叉，但 **定级仍走 definitions**

### 陷阱

- 公开 SDK 的 sample key、明显占位符 → 不报  
- 把密钥清单当「依赖清单式发现」（近 INV11）——须 PoC 到实害  

---

## 11. SDK 与供应链（对齐 OWASP M2）

### 目标

评估 **出货路径可达** 的第三方 SDK 是否扩大宿主攻击面。

### 要点

| 检查项 | 说明 |
| -------- | ------ |
| 组件导出 | SDK 自带 exported Activity/Provider/Receiver |
| WebView / 网络栈 | 广告/统计 SDK 的 JS bridge、明文、错误证书处理 |
| 热更 / 插件化 | 任意代码加载、未校验签名的动态下发 |
| 依赖真实性 | 伪造包名、遭投毒的构建插件（有证据才升级） |

与 `hybrid-and-sdk.md` 分工：那边讲提取与可达性手法；这里强调 **M2 优先级与 INV18**。

### 陷阱

- SDK 缺陷但出货不可达 / 项目声明不覆盖 → **INV18**  
- 过时依赖 CVE 清单无目标内 PoC → **INV11**  

---

## 12. Native / JNI

### 要点

- 不可信输入进入 `.so` 解析器（协议、图片、字体、压缩包）→ AM1 方向  
- JNI 桥接手 Deep Link / 文件路径时，按 AF/AD 一样追 source→sink  
- 第三方场景优先 **稳定可复现的文件/协议解析面**；纯本地 crash → INV1  

### 陷阱

- 未证明外部输入可达的「理论上的 UAF」→ INV13 / ADJ4  

---

## 13. 对照表：OWASP Mobile Top 10 2024 × MASVS × DeepSonar

> 对照用于沟通与覆盖率，**不替代** `severity_rule` / `mobile_class`。MASVS 列为常用控制域缩写（按目标版本微调）。

| OWASP 2024 | 含义（英） | MASVS 域（示意） | DeepSonar `mobile_class` / 面（示意） | 第三方优先备注 |
| ------------ | ------------ | ------------------ | --------------------------------------- | ---------------- |
| **M1** | Improper Credential Usage | MASVS-AUTH / STORAGE | AS2、AA4、硬编码与 Token 误用 | 高：可接管密钥/会话 |
| **M2** | Inadequate Supply Chain Security | MASVS-CODE / RESILIENCE | SDK 导出组件、热更、插件；映射 AE/AW/AS | 高：出货可达才追 |
| **M3** | Insecure Authentication/Authorization | MASVS-AUTH | AA*、AE1、AI5、后端 IDOR | 高：后端越权 |
| **M4** | Insufficient Input/Output Validation | MASVS-PLATFORM / CODE | AD*、AI*、AF*、AC2/AC3、AW* | 高：Deep Link/WebView/Provider |
| **M5** | Insecure Communication | MASVS-NETWORK | AS3、明文、错误 TrustManager | 中高：须有窃取/篡改实害 |
| **M6** | Inadequate Privacy Controls | MASVS-PRIVACY | AS4、过度权限、日志/剪贴板 PII | 中：按项目隐私条款 |
| **M7** | Insufficient Binary Protections | MASVS-RESILIENCE | 加固/反调试缺失本身通常不报 | 低（第三方 SRC） |
| **M8** | Security Misconfiguration | MASVS-PLATFORM | Manifest 误配、NSC、备份、debuggable | 配置须连到敏感 sink；入口面→INV26 |
| **M9** | Insecure Data Storage | MASVS-STORAGE | AS1、AC1、外部存储明文 | 高：本地 Token |
| **M10** | Insufficient Cryptography | MASVS-CRYPTO | 弱算法/硬编码密钥配合 AS2 | 中：须证明可利用 |

「Unprotected Endpoints（Deeplink/Activity/…）」在 2024 正式 Top 10 正文外讨论区出现：本清单仍覆盖，但 **必须** 落到 M3/M4/M8/M9 的实害与 INV26 过滤。

---

## 14. 实操分流顺序（建议）

第三方 Android App 建议 **2–4 小时初筛** 顺序（可与工作流 stage 1–2 并行）：

1. **包指纹与 SDK 盘点**（`recon-and-triage.md`）— 标出混合栈与 **出货路径可达** 的 SDK  
2. **Manifest 导出面 + Deep Link 全表**（本清单 §4–§5 + `static-manifest.md`）— 标 INV26 候选 vs 待追 sink  
3. **WebView / Provider / Intent 二次跳转**（§6–§7）— 静态 source→sink  
4. **本地 Token / 备份 / 日志**（§8）  
5. **授权范围内抓包：API 鉴权与 IDOR**（§9）  
6. **出货可达 SDK 面**（§11，M2）  
7. Native / 二进制保护 / 纯配置项 — 后置  

本地 DoS、仅 exported、仅 scheme 可打开 — **记录后丢弃**，不进正式候选。

---

## 15. 验证用 adb 示例（非武器化）

仅用于 **已授权** 目标上确认组件可解析、参数是否进入业务；成功启动 ≠ 漏洞（INV26）。完整 PoC 见 `poc-attacker-app.md` / `runtime-harness.md`。

```bash
# 包与版本
adb shell dumpsys package <pkg> | head

# 解析可导出 Activity（人工对照 Manifest，勿把列表当 finding）
adb shell cmd package query-activities --brief -a android.intent.action.VIEW

# 触发 Deep Link（验证是否到达预期 Activity；再人工看参数是否进 sink）
adb shell am start -a android.intent.action.VIEW -d 'https://example.com/path?x=1' <pkg>

# 显式组件（仅当 Manifest 已标 exported；观察是否进敏感界面）
adb shell am start -n <pkg>/<activity.ClassName> --es url 'https://example.invalid/'

# 只读查询 Provider（authority 来自 Manifest；勿盲写）
adb shell content query --uri content://<authority>/...

# 过滤验证日志（配合 POC-ATTACKER 或目标 tag）
adb logcat -d | rg 'POC-ATTACKER|WebView|DeepLink'
```

### 陷阱

- 把 `Activity` `START` 成功截图当 PoC 终态  
- 对非导出组件反复 `am start` 刷崩溃当「高危 DoS」（INV1）  
- 未声明 `<queries>` 导致解析失败，误判「不可利用」

---

## 16. SRC / 报告接受矩阵（第三方）

用于分流「值不值得写成候选 / 提交」；最终仍以目标项目页 + `adjustment-and-invalid.md` 为准。

| 情形 | 建议 | 依据 |
| ------ | ------ | ------ |
| 导出组件 / 自定义 scheme **仅能唤起**或打开登录/公开页 | **不接受** | INV26 |
| Deep Link / Intent 参数进 WebView / 文件 / 二次 Intent / 敏感操作 | **接受（候选）** | AD* / AI* / AE* / AW* |
| 导出 Provider 未授权读 Token / PII / 私有文件 | **接受** | AE4 / AC* |
| 本地明文会话 Token（无需 root，同用户备份或其他 App 可读模型成立） | **接受** | AS1 / AA4 |
| 硬编码且可滥用的云/支付/推送密钥 | **接受** | AS2 / M1 |
| 后端 API 越权 / IDOR / 认证绕过（经客户端发现） | **接受** | M3 / AA* + 八类 authz |
| 出货可达 SDK 导致宿主数据外泄或任意码执行 | **接受** | M2；不可达 → INV18 |
| 纯本地崩溃 / 杀进程 / 资源耗尽 | **不接受** | INV1 |
| 缺 pinning / 缺加固 / 可 hook / CVE 清单无 PoC | **通常不接受** | INV11 / ADJ / 项目 OOS |
| root/越狱后读私有目录、debug 包、系统层缺陷 | **不接受（本模型）** | INV15 / INV16 / INV19 |

---

## 产出

- 填入或增补 `components.json` 的「第三方优先」标记（入口 / 组件 / 数据 / 网络 / 供应链）  
- `candidates.md` 草稿：仅含通过 INV1/INV26 过滤、具备敏感 sink 的项  
- 工作笔记中的 **INV 否决表**（不进正式报告）  
- 需要动态证伪时，转入 `runtime-harness.md` + `poc-attacker-app.md`

## 相关引用

- `../SKILL.md` 工作流 stage 1–2  
- `recon-and-triage.md`、`static-manifest.md`、`static-code.md`、`hybrid-and-sdk.md`  
- `../../../vuln-definitions-mobile/references/attack-surfaces.md`（条款索引，引用不复制）  
- `../../../vuln-definitions-mobile/references/adjustment-and-invalid.md`（INV1 / INV26 全文）  
- `../../../vuln-definitions-mobile/references/mobile-vuln-types.md`（`mobile_class`）
