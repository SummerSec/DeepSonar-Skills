# 八类漏洞常见 CVSS v4.0 向量示例

> **仅在选定 v4.0 时加载。** 示例仅供锚定，须按现场前提改写。  
> 最终以官方计算器 + 完整向量为准。

约定：默认 **公网可达 HTTP 服务**，除非写明本地/邻接。

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

## 9. Threat 附加

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
