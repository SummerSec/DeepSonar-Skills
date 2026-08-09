# 八类漏洞常见 CVSS v3.1 向量示例

> **仅在选定 v3.1 时加载。** 示例仅供锚定，须按现场前提改写 PR/UI/S/C/I/A 等。  
> 分数为常见锚点；最终以官方计算器 + 完整向量为准。

约定：下列示例默认 **公网可达 HTTP 服务**，除非写明本地/邻接。

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

## 9. Temporal 附加示例

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

## 10. 使用方式

1. 先选最接近的示例族  
2. **逐项改** PR / UI / S / C/I/A，使其匹配证据  
3. 与 `vuln-definitions` 条款对表  
4. 输出最终向量 + 分数 + `alignment`  
