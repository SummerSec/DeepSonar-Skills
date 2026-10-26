# 漏洞类型常见 CVSS v4.0 向量示例（14 类）

> **仅在选定 v4.0 时加载。** 示例仅供锚定，须按现场前提改写。  
> 最终以官方计算器 + 完整向量为准（本文件不预置分数，避免与计算器漂移）。

约定：默认 **公网可达 HTTP 服务**，除非写明本地/邻接。

覆盖 **八类通用机理**（§1–§8，`vuln-definitions`）+ **六类 Web 领域类型**（§9–§14）。v4.0 的 `SC/SI/SA`（后续系统）比 v3.1 的 `S:C` 更细，跨主体影响要靠 `SC/SI/SA` 表达，不能只写 `VC/VI`。

---

## 1. injection

### 1.1 未认证 SQL 注入 → 读全库

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N
```

### 1.2 普通用户盲注 → 敏感数据

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N
```

### 1.3 命令注入 → RCE

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
```

---

## 2. rce

### 2.1 未认证 SSTI → RCE

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
```

### 2.2 管理员后台模板注入

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:H/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
```

---

## 3. ssrf

### 3.1 未认证 SSRF → 云 metadata 凭证

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:H/SI:H/SA:H
```

### 3.2 仅内网端口探测

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:L/VI:N/VA:N/SC:L/SI:N/SA:N
```

---

## 4. authz

### 4.1 未认证认证绕过

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:L/SC:N/SI:N/SA:N
```

### 4.2 水平越权读大量 PII

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N
```

### 4.3 低价值字段越权写

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N
```

---

## 5. deserialization

### 5.1 未认证反序列化 → RCE

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
```

### 5.2 需认证、仅 DoS

```
CVSS:4.0/AV:N/AC:H/AT:P/PR:L/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:N
```

---

## 6. file-access

### 6.1 任意文件读

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N
```

### 6.2 任意写 / 上传 → RCE

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
```

### 6.3 仅公开静态资源

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N
```

---

## 7. xxe

### 7.1 XXE 读敏感文件

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N
```

### 7.2 XXE → SSRF metadata

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:H/SI:L/SA:N
```

---

## 8. secrets

### 8.1 仍有效的云 AKSK / 生产密钥可网络获取

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H
```

### 8.2 dummy / 已轮换密钥

- 不评分或 none  

---

## 9. client-side

XSS / 跨域类要把「落点系统」写进 `SC/SI/SA`：只影响本域时 `SC:N`，能读会话或驱动其他主体时 `SC:H/SI:L` 起。

### 9.1 存储型 XSS 打管理员会话 → 读取后台 token

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:L/VA:N/SC:H/SI:L/SA:N
```

- DeepSonar：`client-side.md#C1` **critical**
- 存储型取 `UI:N`（受害者仅需加载页面）；需点击时改 `UI:P`

### 9.2 反射型 XSS 需受害者点击

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:L/VI:L/VA:N/SC:L/SI:L/SA:N
```

- DeepSonar：多数 `#M1` medium；能稳定窃取他人会话时按 `#H1` high

### 9.3 DOM XSS 读取当前用户敏感数据（认证后）

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N
```

- DeepSonar：`#H2` **high**

### 9.4 postMessage 无 origin 校验 → 驱动敏感操作

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:L/VI:H/VA:N/SC:L/SI:L/SA:N
```

- 能触达改密 / 绑定 / 转账时按 `#C2` 抬到 `critical`，`VI` 与 `SI` 视落点抬到 `H`

### 9.5 开放重定向 → OAuth code 外带

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:H/VI:N/VA:N/SC:H/SI:N/SA:N
```

- DeepSonar：`#C3`（完成账户接管）**critical**；无凭据外带按 `#M2` 降为 `VC:L/SC:N`

### 9.6 self-XSS / 仅自身会话

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N
```

- DeepSonar：`#M1`，正式报告通常不报

---

## 10. logic-flaw

> v4.0 同样抓不到「资金 / 权益逃逸」的量级，`VI` 只能表达单次完整性影响。档位一律以 `logic-flaw.md` 条款为准。

### 10.1 支付回调未验签 → 伪造入账

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:H/VA:N/SC:N/SI:H/SA:N
```

- DeepSonar：`#C1` **critical**（资金可直接损失且可重复）

### 10.2 0 元开通会员 / 无限叠加续期

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:N/VI:L/VA:N/SC:N/SI:L/SA:N
```

- DeepSonar：可无限放大且可脚本化 → `#C3` **critical**；单账号反复 → `#H1` **high**
- **不要**用低分压档

### 10.3 并发超发优惠券 / 额度

```
CVSS:4.0/AV:N/AC:H/AT:P/PR:L/UI:N/VC:N/VI:L/VA:N/SC:N/SI:L/SA:N
```

- DeepSonar：`#H3` **high**；竞态稳定复现时 `AC:L/AT:N`

### 10.4 仅前端展示层限制

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N
```

- 0.0；DeepSonar：`#N1` **none**，不报

---

## 11. ai-agent

`AT`（攻击复杂度里的攻击要求）常用于表达「注入需模型配合 / 需稳定上下文」；跨用户读走 `SC`。

### 11.1 间接提示词注入 → 云凭证泄露 + 跨用户读取

```
CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:N/VC:H/VI:L/VA:N/SC:H/SI:L/SA:N
```

- DeepSonar：`#C1` **critical**；注入不稳定复现时 `AT:P` 保持不变、另在 `score_confidence` 记 medium

### 11.2 记忆文件读取工具跨用户越权

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:H/SI:N/SA:N
```

- DeepSonar：`#C3`（含金融画像 / 证件 / 健康）**critical**；低敏内容落 `#M2`

### 11.3 未上架内部 MCP / 工具可被普通用户调用（写或执行）

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:L/VI:H/VA:N/SC:L/SI:H/SA:N
```

- DeepSonar：`#H2` **high**；工具能取云凭据时按 `#C1`

### 11.4 仅 system prompt / 工具清单外泄

```
CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N
```

- DeepSonar：`#M1` **medium**；可据此进一步利用时 `#H1`

### 11.5 执行容器被全平台用户共享 / 逃逸

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H
```

- DeepSonar：`#C2` **critical**

---

## 12. component

先走三段判定（可达性 / 前提 / 厂商状态）；**不可达即 0 分**。

### 12.1 未认证可达的默认配置缺陷 → 管理员能力

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:L/SC:N/SI:N/SA:N
```

- DeepSonar：`#C1` **critical**；影响其他主体时补 `SC/SI`

### 12.2 组件 CVE 需已认证前提 → 代码执行

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
```

- DeepSonar：`#H1` **high**；需特殊配置才可达时 `AT:P`

### 12.3 组件版本落后，无调用点 / 无暴露路由

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N
```

- 0.0；DeepSonar：`#N1` **none**，不报

---

## 13. cloud-native

### 13.1 桶策略允许其它租户凭据读取私有对象

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:N/VI:N/VA:N/SC:H/SI:N/SA:N
```

- DeepSonar：`#H1` **high**；全量可遍历按 `severity-levels.md` §7 矩阵取 `critical`
- 数据在「后续系统」（其他租户域）→ 用 `SC`，不是 `VC`

### 13.2 metadata 可达并取出有效凭据

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:L/VA:N/SC:H/SI:L/SA:N
```

- DeepSonar：`#C3` **critical**；作用域受限落 `#H2`

### 13.3 容器 / 沙箱逃逸到宿主

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H
```

- DeepSonar：`#C2` **critical**

### 13.4 设计上公开的桶 / 公开元数据

- 不评分或 `none`

---

## 14. crypto

### 14.1 支付回调未验签 → 可伪造通知

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:H/VA:N/SC:N/SI:H/SA:N
```

- DeepSonar：`#C2` **critical**；根因是金额 / 幂等未校验时改归 `logic-flaw`

### 14.2 同态密文任意投毒 / 清零

```
CVSS:4.0/AV:N/AC:H/AT:P/PR:L/UI:N/VC:N/VI:H/VA:N/SC:N/SI:H/SA:N
```

- DeepSonar：跨用户 / 跨租户 → `#C1` **critical**；仅单条记录 → `#H1`

### 14.3 TLS / 证书校验可绕（中间人）

```
CVSS:4.0/AV:A/AC:H/AT:P/PR:N/UI:P/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N
```

- DeepSonar：`#H2` **high**；攻击者可在任意网络位置时 `AV:N`

### 14.4 弱算法 / 弱随机但无伪造路径

```
CVSS:4.0/AV:N/AC:H/AT:P/PR:L/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N
```

- 0.0；DeepSonar：`#M1` 或 `none`，视是否演示拼接路径

---

## 15. Threat 附加

```
# 公开 PoC
.../E:P

# 野外利用 / KEV
.../E:A

# 未观察到
.../E:U
```

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N/E:A
```

→ `nomenclature: CVSS-BT`
