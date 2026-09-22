# hybrid-and-sdk — 混合栈与内嵌 SDK

## 目标

梳理 **混合栈（WebView / RN / Flutter 等）** 与 **内嵌第三方 SDK** 的攻击面，判断对 **宿主 App** 的可达影响，并入 `components.json` / `candidates.md`。

## 章节

### 1. Bundle 提取

- 定位 JS bundle、Flutter assets、H5 离线包路径；记录版本与是否可热更新  
- 对本地 H5：注意 `file://` 与 WebView 文件访问组合

### 2. JS bridge

- 枚举 `@JavascriptInterface` / WKScriptMessageHandler / 自研 bridge 方法表  
- 标注方法是否可达敏感能力（文件、IPC、Token、支付）  
- 反射注册的 bridge 易漏，结合运行时 hook 观测（验证用）

### 3. SDK 组件枚举

- SDK 自带 Activity/Service/Provider/Receiver 是否 exported、是否带 Deep Link  
- 与宿主同进程/同 UID 时的权限继承关系简述

### 4. SDK 网络栈对宿主影响

- SDK 是否禁用证书校验、是否共用 Cookie / WebView、是否可被恶意页面驱动宿主接口  
- 流量归属：分清宿主业务域与 SDK 域，避免混报

### 5. SDK 凭据

- SDK 配置中的 app key / secret 痕迹；是否导致账户或云资源接管（验证须授权）  
- 仅「密钥出现在包内」按 definitions 条款判断，不自动抬档

### 6. 可达性

- 出货配置下用户/恶意 App/远程页是否真实触达 SDK 危险路径  
- 对照 `vuln-definitions-mobile` 调整/排除条款（如 INV18 类第三方不可达排除）——**引用条款号，不复制全文**

## 产出

- 更新 `components.json`（SDK/bridge 入口）  
- 更新 `candidates.md`（影响宿主的可达路径）  
- bridge 方法表附件（可放 `evidence/hybrid/`）

## 陷阱

- **一律 INV18 排除**：漏掉「出货即达且影响宿主」的 SDK 路径  
- **混宿主 / SDK 流量**：MITM 证据张冠李戴  
- **忽略反射 bridge**：静态搜不到接口名就以为无 bridge
