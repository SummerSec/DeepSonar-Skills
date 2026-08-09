# 攻击面索引（Phone OS 类型 × OH 组件）

**漏洞类型定义**见 [`phone-os-vuln-types.md`](phone-os-vuln-types.md)（Android / iOS / OH 通用形态）。  
本文件只做 **OpenHarmony 组件落点索引**，便于选模块；不收录 CVE/历史公告。

定级：`severity-levels.md` + `adjustment-and-invalid.md`。

---

## 1. OH 组件族 → 通用类型

| OH 组件族（示意模块） | 优先对照类型 ID | 审计要点 |
|----------------------|-----------------|----------|
| `kernel_liteos_*` / `kernel_linux_*` / 关键驱动 | K1–K4 | 普通 App 可达的 syscall/ioctl/驱动节点；本地提权 |
| `startup_appspawn` / `startup_init*` / param | S3、I1、K 边缘 | 路径穿越、缺鉴权改参、孵化参数 |
| SA / SAMGR / `communication_ipc` | I1–I4、P1–P3 | caller 校验、中继、Parcel 内存安全 |
| `security_access_token` / tokensync | P1–P4 | 跨应用权限画像、token 同步 |
| `communication_dsoftbus` / BT / Wi‑Fi / WLAN | N1–N4、I1 | 未认证报文、组网、跨设备 |
| `arkcompiler_*` / `arkui_*` | W4、M3a | 运行时/UI 内存破坏；远程内容 vs 本地 |
| `web_webview` / nweb | W1–W3 | 引擎 RCE、JS 桥、file/origin |
| multimedia / camera / `av_codec` | M1a–M3a、P1、H8 类 | 编解码远程入口；SA 未授权开相机 |
| telephony / 短信 / 蜂窝相关 | N3、B1、M1a | 消息入口解析；敏感广播 |
| bundlemanager / bms / 安装更新 | U1–U2、S3、F3 | 静默装、签名、安装路径 TOCTOU |
| download / filemanagement / hmdfs | F1–F4、S1 | 任意文件、分布式文件隔离 |
| pasteboard / inputmethod | X2–X3、I2 | 剪贴板、输入法 stub |
| window / 通知 / 公共事件 | B1–B3、X1 | 广播敏感字段、通知、叠加层 |
| keystore / HUKS / 安全启动 | U4–U5、M7 | 密钥导出；BL 解锁多为 ADJ6 |

---

## 2. 与 Phone OS 类型的使用关系

```
选模块（本文件）→ 选类型（phone-os-vuln-types.md）
  → 条款（severity-levels.md）→ Gate / ADJ·INV → 只报 C/H
```

不要因为「某组件历史上出过洞」就预设有洞；按 **当前默认配置 + 可演示实害** 判定。

---

## 3. 一 / 三方与评分

| 来源 | 处理 |
|------|------|
| OH 自研系统/框架/默认预置 | 按本插件四档 + Gate |
| 三方库 / 上游通用组件 | 默认 INV4；**OH 默认路径可独立 e2e 实害** 才报 |
| 公告 CVSS 3.1 | 与仓内默认 v3.1 对齐；需要时可另出 v4.0 对照 |

---

## 4. OH 相对 Android/iOS 的增量面

下列在通用 Phone OS 类型中已有对应，但 OH 产品形态上更突出，审计时勿漏：

| 增量点 | 归入类型 | 说明 |
|--------|----------|------|
| 分布式软总线 / 设备组网 | N4、N1 | 授权前跨设备、弱设备→富设备（C6/H11） |
| SA 中继链 | I2 | 与 Binder confused deputy 同型 |
| 多设备资料同步 | S2、F2、H4 | 跨设备也要看用户/资料隔离 |

其余类型（媒体远程、Web 引擎、权限、沙箱、内核等）与 Android/iOS **同型**，按 `phone-os-vuln-types.md` 挖，不按 OH 公告子集裁剪。
