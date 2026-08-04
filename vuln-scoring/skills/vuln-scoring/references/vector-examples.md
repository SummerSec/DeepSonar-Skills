# 八类漏洞常见 CVSS v4.0 向量示例

> **示例仅供锚定**，不是自动模板。真实评分必须按现场前提与影响改写 PR/UI/AT/Subsequent 等。  
> 分数为常见区间说明；最终以官方计算器 + 完整向量为准。

约定：下列示例默认 **公网可达 HTTP 服务**，除非写明本地/邻接。

---

## 1. injection

### 1.1 未认证 SQL 注入 → 读全库

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N
```

- DeepSonar：常 **critical**（整库机密性）  
- 若可写库/堆叠命令执行，抬高 `VI`/`VA`  

### 1.2 普通用户盲注 → 稳定抽敏感数据

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N
```

- DeepSonar：常 **high** 或 **critical**（看数据范围）  

### 1.3 命令注入 → 直接 RCE

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
```

- DeepSonar：通常 **critical**  

---

## 2. rce

### 2.1 未认证 SSTI / 表达式注入 → RCE

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
```

### 2.2 管理员后台模板注入

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:H/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
```

- DeepSonar：常 **high**（前提已是管理员）  

---

## 3. ssrf

### 3.1 未认证 SSRF → 云 metadata 读到可滥用凭证

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:H/SI:H/SA:H
```

- 说明：本机直接机密性可能有限（`VC:L`），云账号沦陷进 Subsequent  
- DeepSonar：常 **critical**  

### 3.2 SSRF 仅能打通内网非敏感端口探测

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:L/VI:N/VA:N/SC:L/SI:N/SA:N
```

- DeepSonar：常 **medium**（默认不报）或 **high**（若已证明关键内网服务可进一步利用）  

---

## 4. authz

### 4.1 未认证认证绕过 → 任意用户/管理员会话

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:L/SC:N/SI:N/SA:N
```

- DeepSonar：常 **critical**  

### 4.2 水平越权读大量他人 PII

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N
```

- DeepSonar：**high** 或 **critical**（规模与敏感度）  

### 4.3 仅越权改自己资源边界外的低价值字段

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N
```

- DeepSonar：常 **medium** / **none**  

---

## 5. deserialization

### 5.1 未认证危险反序列化 → RCE

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
```

### 5.2 需认证且 gadget 受限、仅 DoS

```
CVSS:4.0/AV:N/AC:H/AT:P/PR:L/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:N
```

- DeepSonar：常 **medium** 或视业务可用性要求 **high**  

---

## 6. file-access

### 6.1 任意文件读（/etc/shadow、云密钥、源码配置）

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N
```

### 6.2 任意文件写 / 上传解析 → RCE

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N
```

### 6.3 路径问题仅能读公开静态资源

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N
```

- DeepSonar：常 **none** / **medium**  

---

## 7. xxe

### 7.1 XXE 读服务器敏感文件

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N
```

### 7.2 XXE 变 SSRF 打 metadata

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:H/SI:L/SA:N
```

- Subsequent 按是否拿到密钥再抬 `SI/SA`  

---

## 8. secrets

### 8.1 仓库/响应泄露仍有效的云 AKSK / 生产 DB 密码

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H
```

- 说明：密钥本身暴露在可网络获取的载体上；滥用影响可同时落在后续系统  
- 若仅本地文件、需已入侵主机才能读 → 下调 `AV`，DeepSonar 也可能降级  

### 8.2 文档中的 dummy / 已轮换密钥

- 不评分或 `none`；**不要**套 Critical 模板  

---

## 9. Threat 附加示例

在 Base 后追加利用成熟度：

```
# 公开 PoC
.../E:P

# 野外利用 / KEV
.../E:A

# 未观察到利用
.../E:U
```

完整示例：

```
CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N/E:A
```

→ `nomenclature: CVSS-BT`

---

## 10. 使用方式

1. 先选最接近的示例族  
2. **逐项改** PR / UI / AT / 影响，使其匹配证据  
3. 与 `vuln-definitions` 条款对表  
4. 输出最终向量 + 分数 + `alignment`  
