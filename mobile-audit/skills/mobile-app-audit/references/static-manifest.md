# static-manifest — Manifest / 组件攻击面

## 目标

产出完整、可复核的 **组件攻击面清单**（`components.json`）与相对基线/上版的 diff，供代码追踪与动态验证使用。  
**入口面本身不是漏洞**（见 INV26）。

## 章节

### 1. AXML / arsc（Android）与 Info.plist（iOS）

- 使用正式工具还原二进制 Manifest / 资源表；记录工具版本以便复现  
- iOS：URL types、LSApplicationQueriesSchemes、ATS 例外、关键 entitlements 摘要

### 2. 组件表

- Activity / Service / Receiver / Provider：名称、`exported`、权限、intent-filter  
- 注意 `exported` **缺省随 targetSdk 变化**；显式与隐式导出分开标注

### 3. Deep Link / App Links / URL Scheme

- scheme / host / path / pathPrefix / autoVerify（Android App Links）  
- iOS URL Scheme 与 Universal Links（apple-app-site-association 若在范围内可核）  
- 记录「仅打开」vs「带参数进入业务」——后者才进入 sink 追踪

### 4. Provider 与 FileProvider paths

- authority、读写权限、`grantUriPermissions`  
- `file_paths` / root-path / external-path 等是否过宽

### 5. 广播与其它入口

- 导出 Receiver、高权限 action、有序广播敏感点  
- 少见入口：附带的 Device Admin、Accessibility、VPN、Tile 等（按授权记录）

### 6. 网络安全配置（NSC）与 ATS

- cleartext 例外、自定义 TrustManager 指向、debug-overrides 是否混入 release

### 7. meta-data 凭据痕迹

- API Key、渠道秘钥、推送密钥等 **痕迹** 记入候选草稿；有效性验证遵守授权，不把「存在字符串」直接当 Critical

## 产出

- `components.json`：组件全表 + Deep Link + Provider paths + NSC/ATS 摘要  
- 基线 diff（若有上一版/官方包）：新增导出组件、新增 scheme、放宽 paths

## 陷阱

- **exported 缺省随 SDK 变**：凭「没写 exported」推断不安全或安全都会错  
- **资源未还原**：错误组件名/字符串导致漏报或误报  
- **把导出当漏洞（INV26）**：无未授权敏感 sink 的 exported / 自定义 scheme / 仅能打开 App → **不报**
