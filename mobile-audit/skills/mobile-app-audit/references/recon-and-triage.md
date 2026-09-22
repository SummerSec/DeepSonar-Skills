# recon-and-triage — 指纹与可审计性初判

## 目标

在约 **30 分钟**内产出：目标 **可审计性** 判断 + **攻击面初判** + `assets.json` 初稿与审计计划，供后续静态/动态阶段消费。

## 章节

### 1. 获取与校验

- 确认包来源（官方渠道 / 授权交付 / 构建产物）；记录文件哈希（SHA-256）与获取时间  
- 校验扩展名与实际格式（APK/AAB/XAPK、IPA、解密后的 Payload）  
- 多变体时标明渠道包 / ABI 分包 / instant 变体，避免审错包

### 2. 指纹

- Android：`packageName`、`versionName`/`versionCode`、`minSdk`/`targetSdk`、签名证书主体与指纹、主 Activity  
- iOS：Bundle ID、短/长版本、最低 OS、 entitlements 摘要、Team ID（若可得）  
- ABI / 架构：armeabi-v7a、arm64-v8a、x86_64；模拟器与真机差异记入计划

### 3. 加固 / 壳 / 混淆

- 识别常见加固/壳迹象（多 dex 加载器、异常 Application 名、SO 壳特征）与 ProGuard/R8/混淆程度  
- **可审计性分级**：可直接 jadx / 需有限度脱壳隔离 / 仅动态黑盒为主  
- 脱壳若必须：仅在隔离目录、不落生产凭据；细节见 `tooling.md`（禁止公开武器化对抗教程）

### 4. 混合栈识别

- 是否含 React Native / Flutter / Cordova / Capacitor / UniApp / 自研 WebView 壳  
- 标记 JS bundle / 资源路径，供 `hybrid-and-sdk.md` 深入

### 5. 第三方 SDK 盘点

- 从包名、meta-data、已知 SDK 特征类粗盘点（推送、支付、广告、统计、地图、风控）  
- 记录 SDK 是否可能导出组件或自带 WebView / 网络栈

### 6. 范围与合规初判

- 对照授权：可否真机安装、可否 MITM、账号类型、是否允许攻击者 App  
- 标记疑似 OOS（系统特权、厂商 ROM 专有、越狱/root 前提）→ 系统层路由 `vuln-definitions-oh`；资格问题引用 mobile definitions 的项目规则文件

## 产出

- `assets.json` 初稿：哈希、指纹、ABI、加固/混合栈/SDK 列表、可审计性、建议工作流路径  
- 审计计划：静态优先组件列表、是否需要真机/PoC、工具缺口（对照 `tooling.md`）

## 陷阱

- **把加固当无法审计**：仍可做 Manifest/动态/IPC 面；完全放弃会漏 INV 以外的真实 sink  
- **debug 当 release**：debuggable、test 通道、内测签名与正式包攻击面不同，须分列  
- **忽略 ABI / 版本差异**：只审 x86 模拟器或旧 versionCode，结论不可外推到用户主流 arm64 正式版
