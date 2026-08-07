# 真实复现案例库（2026-08 批次）

用于 **用实例校验定级**：新发现先对照本库，看是否同类「有效」或同类「无效」。  
语义基线：OpenHarmony 安全漏洞奖励计划 + 本仓实战复测（3 有效 + 1 争议 + 15 无效/强前提）。

---

## 一、有效向（L3 已复现，可投递/可继续挖同型）

| ID | 现象 | 官方预判 | 条款 | 为什么有效 |
|----|------|----------|------|------------|
| c2b59cf5 | WebSocket NAPI 默认 WSS 信自签、跳主机名 | **高危** | severity-levels.md#H5 / #H7 | 默认路径 + 远程 MITM 读改业务流量（token/会话）；无需 skip |
| ea1ccbf5 | Native WebSocket（OH_WebSocketClient）默认不验服务器 | **高危** | severity-levels.md#H5 / #H7 | 同网 MITM 读改；比 NAPI 更弱（flags 0x17 默认） |
| 9cdaacf4 | 跨应用 checkAccessToken 查权限状态（CAM=GRANTED/MIC=OFF） | **中危**（可降低危） | severity-levels.md#M5 + ADJ9 | 无 GET_SENSITIVE 的普通 App 用公开 API 跨查；本地权限画像 |

**立住的共同特征**：

1. 调用面在 **普通应用或远程网络**，不先要 native/SA
2. **默认路径**触发，不靠开发者主动关校验
3. 能写出「攻击者具体得到什么 / 改了什么」
4. 能在 Phone 模拟器或标准设备上 e2e

---

## 二、争议项（最小 e2e 验证后再决定投递）

| ID | 现象 | 预判 | 条款 | 争议点 | 下一步 |
|----|------|------|------|--------|--------|
| d0d68f16 | 无 hardening 时默认放行 `http://` 明文 | **中危→可降/争议** | ADJ5 | 易被审方认定为「产品策略」而非漏洞 | 模拟器默认 Http 请求 http + 抓包对照；写清「默认配置」与应用可 hardening |

---

## 三、无效 / 强前提（命中即停，不排复现）

### A. 原无效（非默认 / 自触发 / 特权等价）

| ID | 短标题 | 命中条款 |
|----|--------|----------|
| 11679b88 | HTTP `remoteValidation=skip` | ADJ5、INV5（App 主动 skip，非默认） |
| 174e82c9 | TLSSocket `skipRemoteValidation` | ADJ5、INV5（显式开关） |
| dd40990f | RegisterSecCompEnhance 无调用方鉴权 | INV1（绑自身 pid，自攻击；链不完整） |
| 7bcfe1dd | IsSACall 只认 TOKEN_NATIVE（ForceExitApp） | ADJ3、INV7、INV8（特权依赖/权限等价；临时 DoS） |
| d482ade5 | AppSpawn 白名单 SA 协议过宽 | ADJ3、INV7（须先控特权 SA） |

### B. 强前提迁入

| ID | 短标题 | 强前提类型 | 命中条款 |
|----|--------|------------|----------|
| f0108554 | lite HTTP 编译关证书校验 | 环境：仅 lite 产品 | ADJ2（影响面有限；不可 e2e） |
| f9c97bce | SoftBus 落盘 AES-CBC 无完整性 | 能力：写落盘 blob | ADJ3（普通 HAP 写不到） |
| f7a03e95 | HUKS lite AES key-as-IV | 环境：lite + 省略 IV | ADJ2、ADJ4（lite-only + 特定调用） |
| 9e4ef49c | ATM 读接口仅 TOKEN_NATIVE | 能力：必须 native | ADJ3、INV7 |
| 61c905d8 | SAMGR CanRequest 仅 TOKEN_NATIVE | 能力：必须 native | ADJ3、INV7 |
| a276e0b5 | NWebSpawn 套接字 DAC 0666 | 能力+缓解：SELinux 收窄 | ADJ1、ADJ8（DAC 宽但 MAC 收窄） |
| 5fd75702 | SoftBus RSA-OAEP MGF1=SHA-1 | 利用：单独难成链 | ADJ4、INV2（密码学卫生） |
| addbfd20 | 代码签名跳过时间校验 | 场景：过期/未生效证 | ADJ4（场景过窄） |
| 596c55ff | nosharefs 下 CAP_DAC_OVERRIDE | 环境：nosharefs 开启 | ADJ5、ADJ10（默认多为 false） |
| 7d45d650 | Data Group 路径校验不足 | 能力：上游 SA 构造消息 | ADJ3、INV9（依赖 foundation/BMS） |

---

## 四、模式总结

### 立住的模式（继续挖同型）

| 模式 | 代表 | 实害怎么说 |
|------|------|------------|
| **默认安全控件失效** | c2b59cf5、ea1ccbf5 | 同网 MITM 读改应用业务流量（token、会话、用户数据） |
| **普通三方默认可调 API 越权读** | 9cdaacf4 | 本地恶意 App 做权限画像（相机/麦是否已授） |
| **默认策略过宽（争议）** | d0d68f16 | 明文窃听；须证明真实默认流量 + 抓包，否则易被当产品策略 |

### 永久避坑的模式（一票否决）

| 模式 | 代表 ID | 一票否决原因 |
|------|---------|--------------|
| App 主动 `skip` | 11679b88、174e82c9 | 非默认；自触发/设计 |
| 接口无鉴权但只能绑自己 / 自攻击 | dd40990f | 无外部路径 |
| 门禁只认 TOKEN_NATIVE | 9e4ef49c、61c905d8 | 特权依赖 / 权限等价 |
| 先控特权 SA 再 spawn/杀进程 | d482ade5、7bcfe1dd | 特权依赖；ForceExit ≈ 应用临时 DoS |
| 仅 lite 产品形态 | f0108554、f7a03e95 | 影响面有限 + 复现环境过强 |
| 须写系统落盘 / 特殊路径 | f9c97bce | 普通 HAP 写不到 → 能力前提 |
| DAC 宽但 SELinux 收窄 | a276e0b5 | 缓解后不可达；单点链不完整 |
| 密码学“不优雅”但无独立利用 | 5fd75702 | 无完整攻击路径 |
| 非默认 param / 过期证等窄场景 | 596c55ff、addbfd20 | 场景过窄 / 非默认 |
| 消息只能由 foundation/BMS 构造 | 7d45d650 | 上游特权依赖；证据不足 |

---

## 五、本批金样板 / 废样板

- **金样板**：默认弱 TLS（远程 MITM）＞ 普通 API 跨应用敏感状态查询
- **废样板**：skip 类 API、TOKEN_NATIVE 门禁、lite-only、无写权的落盘加密、0666+SELinux
