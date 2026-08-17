# 攻击面索引（Phone OS 类型 × OH 组件）

**漏洞类型定义**见 [`phone-os-vuln-types.md`](phone-os-vuln-types.md)（Android / iOS / OH 通用形态）。  
**落点仓是否在 bounty 范围内**见 [`asset-scope.md`](asset-scope.md)（官方名单精确匹配）。  
本文件只做 **OpenHarmony 组件落点索引**，便于选模块；不收录 CVE/历史公告。

定级：`severity-levels.md` + `adjustment-and-invalid.md`。

---

## 1. OH 组件族 → 通用类型

| OH 组件族（示意模块） | 优先对照类型 ID | 审计要点 |
|----------------------|-----------------|----------|
| `kernel_liteos_*` / `kernel_uniproton` / 关键驱动 | K1–K5 | **在册自研**；普通 App 可达的 syscall/ioctl/驱动节点；**默认节点过宽** |
| 上游 `kernel_linux` / `_4.19` / `_5.10` / `_6.6` | — | **默认 INV4**；不按本表挖通用 CVE |
| `kernel_linux_patches` / `common_modules*` / `newip` | K1–K5 | 可证 OH 独有路径才按自研；`kernel_linux_config` / `_build` 非运行时 |
| `drivers_hdf_*` / 板级·SoC 驱动 | K3、K5 | HDF/HAL 用户态可达接口；默认设备节点 DAC |
| `startup_appspawn` / `startup_init*` / param | S3、I1、K 边缘 | 路径穿越、缺鉴权改参、孵化参数 |
| SA / SAMGR / `communication_ipc` | I1–I5、P1–P5 | caller 校验、**SA 中继**、Parcel 内存安全、反序列化鉴权 |
| `security_access_token` / tokensync / 安全组件管理 | P1–P5 | 跨应用权限画像、token 同步、权限实现错误 |
| `communication_dsoftbus` / BT / Wi‑Fi / WLAN / `netmanager` | N1–N6、I1 | 未认证报文、**近场/软总线实现**、组网、跨设备、网络管理越权 |
| `arkcompiler_*` / `arkui_*` | W4–W6、M3a | 运行时/UI **内存破坏与类型混淆**；远程内容 vs 本地；**受限场景 ACE 不抬档** |
| `web_webview` / nweb | W1–W3 | 引擎 RCE、JS 桥、file/origin；纯上游默认 INV4 |
| multimedia / camera / `av_codec` / `av_session` / audio | M1a–M3a、P1、P5、I3 | 编解码远程入口；SA 未授权开相机；会话/音频服务 UAF |
| telephony / 短信 / 蜂窝 / `cellular_call` | N3、B1、M1a、P5 | 消息入口解析；电话栈入参；敏感广播 |
| bundlemanager / bms / `app_domain_verify` / 安装更新 | U1–U2、U6、E2、S3、F3 | 静默装、签名、**仍需用户确认的管控绕过不按 C4**、域名校验组件 |
| `update_*` / `sys_installer` | U6、I2、F3 | OTA 安装器缺鉴权 / TOCTOU / UAF；半链中继不报 |
| `ability_ability_runtime` | E1、E3、E4 | Ability/Want 拉起与传参越权 |
| download / `filemanagement_*` / hmdfs / storage_service | F1–F4、S1 | 任意文件、存储服务路径、分布式文件隔离 |
| pasteboard / UDMF / inputmethod | F5、X2–X3、I2 | 统一数据面、剪贴板、输入法 stub |
| window / 通知 / 公共事件 / `background_task` | B1–B3、X1、X5、P5 | 广播敏感字段、通知、窗口属性、后台任务权限 |
| `base_location` / 传感器 | P1、P5、X4 | 位置/传感器权限实现；低敏感侧信道 |
| `ai_neural_network_runtime` | W4、W6 | NN 运行时内存破坏；默认须证普通模型可达 |
| keystore / HUKS / 安全启动 | U4–U5、M7、N2 | 密钥导出；跨设备 PIN/明文；BL 解锁多为 ADJ6 |

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
| OH 自研系统/框架/默认预置（在册） | 按本插件四档 + Gate S/A–D |
| 三方库 / 上游 linux 通用树 | 默认 INV4；**OH 默认路径可独立 e2e 实害** 才报 |
| 名单外 / 厂商 / 测试文档工具链 | 不投递 / ADJ2（见 `asset-scope.md`） |
| 公告 CVSS 3.1 | 与仓内默认 v3.1 对齐；需要时可另出 v4.0 对照 |

---

## 4. OH 相对 Android/iOS 的增量面

下列在通用 Phone OS 类型中已有对应，但 OH 产品形态上更突出，审计时勿漏：

| 增量点 | 归入类型 | 说明 |
|--------|----------|------|
| 分布式软总线 / 设备组网 | N4、N6、N1 | 授权前跨设备、弱设备→富设备（C6/H11）；近场报文打实现层 |
| SA 中继链 / callback stub | I2、I5 | 与 Binder confused deputy 同型；半链不报 |
| 多设备资料同步 | S2、F2、F5、H4 | 跨设备也要看用户/资料隔离；UDMF/剪贴板 |
| Ark / ACE 运行时 | W4–W6 | 远程内容打任意应用进程才是 H2；「受限/特定场景」走 L1/M1 |
| HDF / 默认设备节点 | K3、K5 | 普通 App 默认可达才算；调试节点 ADJ6/7 |
| OTA / 包管理 / Ability | U6、U2、E4 | 升级安装器、仍需确认的管控绕过、元能力传参 |

其余类型（媒体远程、Web 引擎、权限、沙箱、内核等）与 Android/iOS **同型**，按 `phone-os-vuln-types.md` 挖。  
**不按** 单一月报或三方库清单裁剪类型；`kernel_linux_*` / `third_party_*` / 上游引擎默认走 INV4。
