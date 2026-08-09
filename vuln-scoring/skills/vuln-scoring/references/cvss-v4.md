# CVSS v4.0 指标与取值决策

权威规范：[FIRST CVSS v4.0 Specification](https://www.first.org/cvss/v4.0/specification-document)  
本文件是 **审计/挖洞场景下的操作摘要**，边界争议以官方规范为准。  
**仅在选定 `version: "4.0"` 时加载本文件**（见 SKILL 版本选择）。

---

## 1. 命名与输出

| 名称 | 含义 |
|------|------|
| **CVSS-B** | 仅 Base |
| **CVSS-BT** | Base + Threat |
| **CVSS-BE** | Base + Environmental |
| **CVSS-BTE** | Base + Threat + Environmental |

- 分数范围：`0.0`–`10.0`  
- 必须输出 **完整向量串**，例如：  
  `CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N`  
- Threat / Environmental 未评估时用 `X`（Not Defined），或省略可选段并标明 `nomenclature: CVSS-B`

### CVSS 定性档（分数 → 标签）

| 分数 | 定性 |
|------|------|
| 0.0 | None |
| 0.1 – 3.9 | Low |
| 4.0 – 6.9 | Medium |
| 7.0 – 8.9 | High |
| 9.0 – 10.0 | Critical |

---

## 2. Base：可利用性指标（Exploitability）

### 2.1 Attack Vector — `AV`

| 值 | 含义 | 典型场景 |
|----|------|----------|
| **N** Network | 远程网络栈可达 | 公网/内网 HTTP API |
| **A** Adjacent | 逻辑相邻 | 同链路层、Wi‑Fi/蓝牙、邻接网段 |
| **L** Local | 本地读/写/执行 | 本地文件、本地用户会话 |
| **P** Physical | 物理接触 | USB、调试口 |

以 **脆弱组件的可达方式** 为准。

### 2.2 Attack Complexity — `AC`

| 值 | 含义 |
|----|------|
| **L** Low | 无特殊规避；可重复稳定成功 |
| **H** High | 必须绕过安全机制，或强依赖难控条件 |

不要把「需要登录」算进 AC（→ PR）；不要把「特定部署开关」优先算进 AC（→ AT）。

### 2.3 Attack Requirements — `AT`（v4 特有）

| 值 | 含义 |
|----|------|
| **N** None | 常见部署下即可利用 |
| **P** Present | 依赖特定执行/部署条件：竞态、非默认配置、MITM 位置等 |

### 2.4 Privileges Required — `PR`

| 值 | 含义 |
|----|------|
| **N** None | 未认证 / 匿名 |
| **L** Low | 普通用户 |
| **H** High | 管理员 / 高特权 |

### 2.5 User Interaction — `UI`（v4 细化）

| 值 | 含义 |
|----|------|
| **N** None | 无用户参与 |
| **P** Passive | 有限/非自愿交互（预览、访问恶意页即中） |
| **A** Active | 需用户主动完成步骤（点击危险项、改安全设置等） |

---

## 3. Base：影响指标（Impact）

v4 **取消 Scope**。分别评估：

- **Vulnerable System** → `VC` / `VI` / `VA`  
- **Subsequent System(s)** → `SC` / `SI` / `SA`

每个 CIA 取值：`H` / `L` / `N`。

### 填写原则

1. 按已证明最终后果填，不按幻想链。  
2. 整库拖走 / 任意敏感文件读 → 常 `VC:H`。  
3. 任意命令执行 → 常 `VC:H/VI:H/VA:H`。  
4. SSRF→IMDS 密钥 → 本机影响可能有限，云账号进 Subsequent。  
5. 无跨系统证据时 Subsequent 全 `N`。

---

## 4. Threat — Exploit Maturity `E`

| 值 | 含义 |
|----|------|
| **X** Not Defined | 未评估 |
| **A** Attacked | 野外利用 / 显著武器化 |
| **P** POC | 有公开 PoC |
| **U** Unreported | 无已知 PoC/利用 |

内部复现 ≠ 自动 `E:A`。KEV → 倾向 `E:A`。

---

## 5. Environmental（可选）

`CR/IR/AR` 与 Modified Base（`MAV`、`MPR`、`MVC`…）；涉及人身安全可用 `MSI/MSA=S`。  
无环境信息不要编造。

---

## 6. 决策速查

| 现场观察 | 优先指标 |
|----------|----------|
| 公网匿名 HTTP | `AV:N`, `PR:N` |
| 需登录普通用户 | `PR:L` |
| 仅管理员后台 | `PR:H` |
| 默认配置可打 | `AT:N` |
| 仅非默认/调试 | `AT:P` |
| 稳定一条请求 | `AC:L` |
| 直接 RCE | `VC:H/VI:H/VA:H` |
| SSRF→云密钥 | Subsequent 升高 |
| 需点恶意链接 | `UI:P` 或 `UI:A` |

---

## 7. 向量串格式

```
CVSS:4.0/AV:<N|A|L|P>/AC:<L|H>/AT:<N|P>/PR:<N|L|H>/UI:<N|P|A>/VC:<H|L|N>/VI:<H|L|N>/VA:<H|L|N>/SC:<H|L|N>/SI:<H|L|N>/SA:<H|L|N>
```

可选：`/E:<X|A|P|U>` 与 Environmental。  
**校验**：Base **11** 项齐全。

---

## 8. 分数计算

v4 用等价类与查表，手算易错。  
计算器：https://www.first.org/cvss/calculator/4.0  
无法计算时：给向量 + rationale，`score_confidence` 降为 medium/low。

### 粗检锚点

| 模式 | 粗检 |
|------|------|
| 网络+无认证+低复杂+无交互+三高影响+无后续 | 常 Critical（≥9.0） |
| 网络+低权限+高影响数据 | High～Critical |
| 需高权限管理端 | 分数常下降 |
| 仅本地+主动交互+有限影响 | 常 Medium 及以下 |

---

## 9. 与 v3.1 对照（迁移）

| v4.0 | v3.1 |
|------|------|
| `UI:N/P/A` | `UI:N/R` |
| 无 Scope；`VC/VI/VA`+`SC/SI/SA` | `S:U/C` + `C/I/A` |
| 有 `AT` | 无 AT（条件并入 AC 等） |
| Threat 主为 `E` | Temporal：`E/RL/RC` |
| `CVSS:4.0/` | `CVSS:3.1/` |

对照评分时 **分版本各出一条向量**，禁止混用指标字母集。
