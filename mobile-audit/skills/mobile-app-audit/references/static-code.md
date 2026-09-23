# static-code — 代码与数据流（source→sink）

## 目标

对 Manifest 中标出的 **exported / 深链 / 缺权限保护** 入口，追踪到 **敏感 sink**，形成可验证的 source→sink 候选，写入 `candidates.md`（仍 **不定级**）。

## 章节

### 1. 工具链

- 反编译 / 浏览：jadx、apktool、IDE 索引；iOS 在授权下使用 class-dump / Hopper 等（见 `tooling.md` 缺口标注）  
- 搜索：ripgrep 于反编译树；注意字符串加密与反射调用

### 2. 入口到 sink 范式

- 入口：导出组件、Deep Link 参数、Provider query、WebView URL、IPC Binder、推送 payload  
- 中间：校验、编码、鉴权 Session、特征开关  
- Sink：命令执行、文件读写、SQL、鉴权决策、WebView 加载、密钥使用、任意 Intent 转发等  
- 每条候选记录：入口 → 变换 → sink → 所需前提（同设备恶意 App / 用户点击 / 网络等）

### 3. 高危 API 面（检查清单，非漏洞表）

- **WebView**：`addJavascriptInterface`、`setAllowFileAccess`、`setAllowUniversalAccessFromFileURLs`、不安全 `shouldOverrideUrlLoading`  
- **密码学**：硬编码密钥、ECB、禁用证书校验、自定义 TrustAll  
- **网络信任**：HostnameVerifier 放行、明文传票据  
- **存储**：世界可读文件/SharedPreferences、未加密令牌、外部存储敏感数据  
- **IPC**：不安全 Forward、PendingIntent 可变、未校验调用方 UID/包名  
- **日志**：token / PII 进 logcat  
- **文件**：路径拼接、zip slip、任意 content Uri 读取

### 4. 调用方校验

- `getCallingUid` / `getCallingPackage` / 签名校验 / 自定义 permission 保护是否真实生效  
- 缺校验 alone ≠ finding；须接到敏感 sink 且符合 definitions 形态

### 5. JNI / NDK

- 导出 JNI 方法、SO 内网络/文件/加解密符号粗览  
- 不展开武器化 native exploit；能说明「可控输入进危险 native sink」即可进入候选

## 产出

- `candidates.md`：每条含 source、sink、文件/方法定位、前提、建议动态验证步骤  
- 可选：调用图摘录或关键反编译片段（打码密钥）

## 陷阱

- **字符串加密漏判**：只搜明文 API 名会漏；结合动态与 bridge  
- **只看方法名**：同名包装可能已校验或不可达  
- **存在 API ≠ 可利用**：无可控 source 或不可达路径 → 不进正式候选，或标 confidence 不足待动态
