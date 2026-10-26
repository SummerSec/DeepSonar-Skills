# 漏洞类型常见 CVSS v3.1 向量示例（14 类）

> **仅在选定 v3.1 时加载。** 示例仅供锚定，须按现场前提改写 PR/UI/S/C/I/A 等。  
> 分数为常见锚点（已按 v3.1 公式核算）；最终以官方计算器 + 完整向量为准。

约定：下列示例默认 **公网可达 HTTP 服务**，除非写明本地/邻接。

覆盖 **八类通用机理**（§1–§8，`vuln-definitions`）+ **六类 Web 领域类型**（§9–§14）。Web 领域六类的档位以 `vuln-definitions/references/<type>.md` 条款为准，**CVSS 不得抬档也不得压档**。

---

## 1. injection

### 1.1 未认证 SQL 注入 → 读全库

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N
```

- 粗检 Base ≈ **7.5** High；DeepSonar：常 **critical**（整库机密性语义）  
- 若可写库/堆叠命令执行，抬高 `I`/`A`（可至 9.8）  

### 1.2 普通用户盲注 → 稳定抽敏感数据

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N
```

- 粗检 ≈ **6.5** Medium 或视实现抬 I；DeepSonar：常 **high**  

### 1.3 命令注入 → 直接 RCE

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
```

- 粗检 Base = **9.8** Critical；DeepSonar：通常 **critical**  

---

## 2. rce

### 2.1 未认证 SSTI / 表达式注入 → RCE

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
```

- **9.8** Critical  

### 2.2 管理员后台模板注入

```
CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H
```

- 粗检 ≈ **7.2** High；DeepSonar：常 **high**（前提已是管理员）  

---

## 3. ssrf

### 3.1 未认证 SSRF → 云 metadata 读到可滥用凭证

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H
```

- `S:C`：影响跨到云账号/其它资源边界  
- 粗检可达 **9.x–10.0**；DeepSonar：常 **critical**  

### 3.2 SSRF 仅能打通内网非敏感端口探测

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:L/I:N/A:N
```

- DeepSonar：常 **medium**（默认不报）或 **high**（若已证明关键内网服务可进一步利用）  

---

## 4. authz

### 4.1 未认证认证绕过 → 任意用户/管理员会话

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:L
```

- DeepSonar：常 **critical**  

### 4.2 水平越权读大量他人 PII

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N
```

- DeepSonar：**high** 或 **critical**（规模与敏感度）  

### 4.3 仅越权改自己资源边界外的低价值字段

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N
```

- DeepSonar：常 **medium** / **none**  

---

## 5. deserialization

### 5.1 未认证危险反序列化 → RCE

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
```

- **9.8** Critical  

### 5.2 需认证且 gadget 受限、仅 DoS

```
CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:N/A:H
```

- DeepSonar：常 **medium** 或视业务可用性 **high**  

---

## 6. file-access

### 6.1 任意文件读（/etc/shadow、云密钥、源码配置）

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N
```

- ≈ **7.5** High  

### 6.2 任意文件写 / 上传解析 → RCE

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H
```

- ≈ **8.8** High  

### 6.3 路径问题仅能读公开静态资源

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N
```

- DeepSonar：常 **none** / **medium**  

---

## 7. xxe

### 7.1 XXE 读服务器敏感文件

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N
```

### 7.2 XXE 变 SSRF 打 metadata

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:L/A:N
```

- Scope Changed；C/I 按是否拿到密钥再定  

---

## 8. secrets

### 8.1 仓库/响应泄露仍有效的云 AKSK / 生产 DB 密码

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H
```

- 密钥可网络获取且滥用跨资源边界 → `S:C`  
- 若仅本地文件、需已入侵主机才能读 → 下调 `AV`，DeepSonar 也可能降级  

### 8.2 文档中的 dummy / 已轮换密钥

- 不评分或 `none`；**不要**套 Critical 模板  

---

## 9. client-side

定档锚点是「能否取得会话、跨域执行、链到可接管凭据」，不以「能弹窗」定档；但 CVSS 仍按实际读/写/可用影响打分。

### 9.1 存储型 XSS 打管理员会话 → 读取后台 token

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:L/A:N
```

- 粗检 ≈ **8.5** High；DeepSonar：常 **critical**（`client-side.md#C1`，可读取会话凭据）
- `UI:N` 取自存储型（受害者仅需加载页面）；若需额外交互改 `UI:R`（分数下浮）

### 9.2 反射型 XSS 需受害者点击链接

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N
```

- 粗检 ≈ **6.1** Medium；DeepSonar：多数 **medium**（`#M1`），能稳定窃取他人会话时抬到 `#H1`

### 9.3 DOM XSS 读取当前用户敏感数据（认证后页面）

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N
```

- 粗检 ≈ **6.5** Medium；DeepSonar：`#H2`（读本人敏感数据）常 **high**

### 9.4 postMessage 无 origin 校验 → 第三方站点驱动敏感操作

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N
```

- 粗检 ≈ **6.1**；能触达改密 / 绑定 / 转账时按 `#C2` 抬档，分数改 `S:C/C:H/I:H/A:N`

### 9.5 开放重定向 → OAuth code 外带

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:N/A:N
```

- 粗检 ≈ **7.4** High；DeepSonar：`#C3`（完成账户接管）**critical**；无凭据外带按 `#M2` 记 `S:U/C:L/I:N/A:N`

### 9.6 self-XSS / 仅自身会话

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:L/A:N
```

- 粗检 ≈ **5.4**；DeepSonar：`#M1`，正式报告通常不报

---

## 10. logic-flaw

> **CVSS 对业务逻辑类系统性偏低**（无 CIA 三元组可表达「资金 / 权益逃逸」）。定档一律以 `logic-flaw.md` 条款为准，CVSS 只描述技术面。

### 10.1 支付回调未验签 → 伪造入账

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N
```

- 粗检 ≈ **7.5** High；DeepSonar：`#C1`（资金可直接损失且可重复）**critical**
- 资金类建议同时给 v4 对照（`VC:N/VI:H` 同样抓不到资金量级，须在 `rationale` 写明）

### 10.2 0 元开通会员 / 无限叠加续期

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N
```

- 粗检 ≈ **4.3** Medium；DeepSonar：可无限放大且可脚本化 → **critical**（`#C3`）/ 单账号反复 → **high**（`#H1`）
- **不要**因为分数 4.3 把它降成 medium：档位由条款定

### 10.3 并发超发优惠券 / 额度

```
CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:L/A:N
```

- 粗检 ≈ **3.1** Low（`AC:H` 源自竞态）；DeepSonar：`#H3` **high**（可超发高价值权益）
- 竞态稳定可复现时 `AC` 改 `L`（4.3），档位不变

### 10.4 仅前端展示层限制，服务端同样限制

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:N
```

- **0.0**；DeepSonar：`#N1` **none**，不报

---

## 11. ai-agent

前提轴固定四值（未认证 / 普通用户 / 同租户他人 / 跨租户），`PR` 与之对应：`N` / `L` / `L`（跨用户仍走 `S:C`）/ `L`。

### 11.1 间接提示词注入 → 云凭证泄露 + 跨用户读取

```
CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:C/C:H/I:L/A:N
```

- 粗检 ≈ **7.1** High；DeepSonar：`#C1`（取得云凭证或跨租户数据）**critical**
- `AC:H` 源自注入需上下文构造与稳定复现；已稳定时改 `AC:L`（8.5）

### 11.2 记忆文件读取工具跨用户越权

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:N/A:N
```

- 粗检 ≈ **7.7** High；DeepSonar：`#C3`（含金融画像 / 证件 / 健康）**critical**；低敏内容落 `#M2` medium

### 11.3 未上架内部 MCP / 工具可被普通用户调用（具备写或执行）

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:L/I:H/A:N
```

- 粗检 ≈ **8.5** High；DeepSonar：`#H2` **high**；工具能拿到云凭据时按 `#C1` 抬档

### 11.4 仅 system prompt / 工具清单外泄

```
CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:L/I:N/A:N
```

- 粗检 ≈ **3.1** Low；DeepSonar：`#M1` **medium**（无可进一步利用面）；可据此构造进一步利用时 `#H1` high

### 11.5 执行容器被全平台用户共享 / 逃逸

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H
```

- 粗检 ≈ **9.9** Critical；DeepSonar：`#C2` **critical**

---

## 12. component

三段判定（可达性 / 攻击前提 / 厂商状态）先走完再打分：**不可达即 0 分**。

### 12.1 未认证可达的默认配置缺陷（Actuator 无认证 / 无认证注册）→ 管理员能力

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
```

- 粗检 = **9.8** Critical；DeepSonar：`#C1` **critical**
- 跨主体生效时改 `S:C`（10.0 上限内按计算器取）

### 12.2 组件 CVE 需已认证前提 → 代码执行

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H
```

- 粗检 = **8.8** High；DeepSonar：`#H1` **high**
- 需特殊配置才可达 → `AC:H`（7.2），DeepSonar 仍 `#H1`，须在 `rationale` 写明前提

### 12.3 组件版本落后，无调用点 / 无暴露路由

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:N
```

- **0.0**；DeepSonar：`#N1` **none**，不报（不要按「依赖清单告警」打分）

---

## 13. cloud-native

### 13.1 桶策略允许其它租户凭据读取私有对象

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:N/A:N
```

- 粗检 ≈ **7.7** High；DeepSonar：`#H1` **high**（非全量凭据）；全量可遍历按 `severity-levels.md` §7 矩阵取 `critical`
- **前提**：不是「拒绝匿名即 none」，须验证所有未授权身份（见 `cloud-native.md#N2`）

### 13.2 metadata 可达并取出有效凭据

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:L/A:N
```

- 粗检 ≈ **8.5** High；DeepSonar：`#C3`（凭据可创建资源 / 读全量密钥）**critical**；作用域受限落 `#H2` high

### 13.3 容器 / 沙箱逃逸到宿主

```
CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H
```

- 粗检 ≈ **9.9** Critical；DeepSonar：`#C2` **critical**

### 13.4 设计上公开的桶 / 公开元数据

- 不评分或 `none`（`cloud-native.md#N2` 的反面）；**不要**套 13.1 模板

---

## 14. crypto

### 14.1 支付回调未验签 → 可伪造通知

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N
```

- 粗检 ≈ **7.5** High；DeepSonar：`#C2`（资金报文可伪造且可重复）**critical**
- 与 `logic-flaw.md#10.1` 同一现象：**根因是验签缺失 → 本类**；根因是金额 / 幂等未校验 → `logic-flaw`

### 14.2 同态密文任意投毒 / 清零（影响他人数据完整性）

```
CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:C/C:N/I:H/A:N
```

- 粗检 ≈ **6.3** Medium；DeepSonar：跨用户 / 跨租户 → `#C1` **critical**；仅单条记录 → `#H1` high

### 14.3 TLS / 证书校验可绕（中间人）

```
CVSS:3.1/AV:A/AC:H/PR:N/UI:R/S:U/C:H/I:H/A:N
```

- 粗检 ≈ **6.4** Medium；DeepSonar：`#H2` **high**（需受害者网络前提）
- 攻击者在任意网络位置时 `AV` 改 `N`（8.1），须有路径证据

### 14.4 弱算法 / 弱随机但无伪造路径

```
CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:N/A:N
```

- **0.0**；DeepSonar：`#M1` medium 或 `none`，视是否演示拼接路径

---

## 15. Temporal 附加示例

在 Base 后追加：

```
# 公开 PoC
.../E:P/RL:X/RC:C

# 野外利用 / KEV（高成熟度）
.../E:H/RL:O/RC:C

# 未观察到利用
.../E:U/RL:X/RC:C
```

完整示例：

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H/E:H/RL:O/RC:C
```

→ 同时给出 Base 与 Temporal 分（若计算）

---

## 16. 使用方式

1. 先选最接近的示例族  
2. **逐项改** PR / UI / S / C/I/A，使其匹配证据  
3. 与 `vuln-definitions` 条款对表  
4. 输出最终向量 + 分数 + `alignment`  
5. **六类 Web 领域类型（§9–§14）档位以条款为准**：CVSS 对业务逻辑、权益逃逸、内部规则外泄系统性偏低，不得用分数压档；反之也不得用分数抬档  
