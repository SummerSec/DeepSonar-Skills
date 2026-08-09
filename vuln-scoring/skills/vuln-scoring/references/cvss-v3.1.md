# CVSS v3.1 指标与取值决策

权威规范：[FIRST CVSS v3.1 Specification](https://www.first.org/cvss/v3.1/specification-document)  
本文件是 **审计/挖洞场景下的操作摘要**，边界争议以官方规范为准。  
**仅在选定 `version: "3.1"` 时加载本文件**（见 SKILL 版本选择）。

---

## 1. 命名与输出

| 名称 | 含义 |
|------|------|
| **Base** | 固有特征：可利用性 + 影响（必填） |
| **Temporal** | 随时间变化：利用成熟度、修复级别、报告可信度（可选） |
| **Environmental** | 环境修正：业务 CIA 要求 + Modified Base（可选） |

- 分数范围：`0.0`–`10.0`  
- 必须输出 **完整向量串**，例如：  
  `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`  
- Temporal / Environmental 未评估时不要编造；仅 Base 时标明只出 Base 分  

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
| **A** Adjacent | 逻辑相邻网络 | 同链路层、同 Wi‑Fi/蓝牙、邻接网段 |
| **L** Local | 本地读/写/执行 | 本地文件、本地用户会话、需先登录主机 |
| **P** Physical | 物理接触 | USB、调试口、拆机 |

**决策**：以 **脆弱组件如何被触达** 为准。远程服务解析恶意文件 → 常 `AV:N`；仅本地打开文件才触发 → `AV:L`。

### 2.2 Attack Complexity — `AC`

| 值 | 含义 |
|----|------|
| **L** Low | 无特殊条件；可重复稳定成功 |
| **H** High | 需攻击者无法完全控制的条件：竞态、稀有配置、目标侧秘密、难稳定内存布局等 |

**不要**把「需要登录」算进 AC（那是 `PR`）。  
**不要**把「需要用户点击」算进 AC（那是 `UI`）。

### 2.3 Privileges Required — `PR`

| 值 | 含义 |
|----|------|
| **N** None | 未认证 / 匿名即可 |
| **L** Low | 普通用户、基础角色；能力受控 |
| **H** High | 管理员、高特权服务账户 |

「自助注册后的普通账号」→ 通常 `PR:L`，不是 `PR:N`。  
「仅管理员后台可触发」→ `PR:H`。  
**注意**：`PR` 与 `S` 组合时，Scope=Changed 下 PR:L/H 的分值权重与 Unchanged 不同（见官方公式）。

### 2.4 User Interaction — `UI`

| 值 | 含义 |
|----|------|
| **N** None | 无任何用户参与即可利用 |
| **R** Required | 需要除攻击者以外的用户完成某一步（点击链接、打开文件、确认对话框等） |

v3.1 **无** Passive/Active 细分；凡需受害者侧操作一律 `UI:R`。

### 2.5 Scope — `S`

| 值 | 含义 |
|----|------|
| **U** Unchanged | 影响仅限于脆弱组件自身的安全权限边界 |
| **C** Changed | 影响可波及 **其它** 安全权限边界的组件（跨权限域） |

示例：

- 本进程 RCE、本库数据泄露 → 常 `S:U`  
- 沙箱逃逸到宿主、虚拟机逃逸、通过漏洞拿到另一安全域权限 → `S:C`  
- SSRF 读到云 IMDS 密钥导致 **其它云资源** 沦陷 → 常 `S:C`（跨授权边界）  

Scope=Changed 时，Impact 按 **受影响的最严重组件** 评估，且 Base 分公式不同。

---

## 3. Base：影响指标（Impact）— `C` / `I` / `A`

| 值 | 机密性 C | 完整性 I | 可用性 A |
|----|----------|----------|----------|
| **H** High | 全部敏感信息严重泄露 / 攻击者可自由读取 | 可完全篡改或失控 | 服务完全不可用或严重瘫痪 |
| **L** Low | 有限信息泄露 | 有限篡改 | 性能降级、部分中断 |
| **N** None | 无影响 | 无影响 | 无影响 |

### 3.1 填写原则

1. 按 **已证明或高度可信的最终后果** 填，不按幻想 exploit 链。  
2. 整库拖走 / 任意文件读敏感路径 → 通常 `C:H`。  
3. 任意命令执行 / webshell → 通常 `C:H/I:H/A:H`。  
4. 纯 DoS → 常 `A:H`，`C:N/I:N`。  
5. 跨权限域后果用 `S:C` + 相应 CIA，不要用 v4 的 Subsequent 指标（v3.1 无 SC/SI/SA）。

### 3.2 与「链式漏洞」

- 单 finding 评 **本缺陷直接后果**；  
- 明确一跳后续（如 SSRF→IMDS→密钥）且证据充分 → 可抬高 C/I/A 并视情况 `S:C`；  
- 需第二个独立 0day 才成立的链 → **不要**写入，除非用户要求「假设链」。

---

## 4. Temporal（可选）

| 指标 | 值 | 含义 |
|------|-----|------|
| **E** Exploit Code Maturity | X / U / P / F / H | 未定义 / 未证明 / PoC / 功能性 / 高危武器化 |
| **RL** Remediation Level | X / O / T / W / U | 未定义 / 官方修复 / 临时修复 / 缓解措施 / 不可用 |
| **RC** Report Confidence | X / U / R / C | 未定义 / 未知 / 合理 / 已确认 |

审计现场：

- 仅内部复现 → 常 `E:U` 或省略 Temporal  
- 公开 PoC → `E:P`  
- KEV / 野外活跃 → `E:H` 或 `E:F`（视武器化程度）  
- 厂商已发补丁 → `RL:O`  

未评估时不要填假 Temporal 分。

---

## 5. Environmental（可选）

仅当用户/资产上下文明确时填写：

| 指标 | 含义 |
|------|------|
| **CR / IR / AR** | 组织对机密性/完整性/可用性的业务要求：H/M/L/X |
| **Modified Base（M\***）** | 环境缓释或放大后的修正：`MAV`、`MAC`、`MPR`、`MUI`、`MS`、`MC`、`MI`、`MA` |

无环境信息 → 不要编造 Environmental 分。

---

## 6. 决策速查（审计常用）

| 现场观察 | 优先指标 |
|----------|----------|
| 公网匿名 HTTP 入口 | `AV:N`, `PR:N` |
| 需登录普通用户 | `PR:L` |
| 仅管理员后台 | `PR:H` |
| 稳定一条请求复现 | `AC:L` |
| 强依赖竞态/难稳布局 | `AC:H` |
| 接口直接 RCE | `C:H/I:H/A:H`，`S:U` 或横向后 `S:C` |
| 仅越权读他人订单 | `C:L` 或 `C:H`（看敏感与规模），`S:U` |
| SSRF→云 metadata 密钥 | 常 `S:C`，`C:H` 等 |
| 需用户点击恶意链接 | `UI:R` |
| 跨沙箱/跨 VM | `S:C` |

---

## 7. 向量串格式

```
CVSS:3.1/AV:<N|A|L|P>/AC:<L|H>/PR:<N|L|H>/UI:<N|R>/S:<U|C>/C:<H|L|N>/I:<H|L|N>/A:<H|L|N>
```

可选追加 Temporal：

```
/E:<X|U|P|F|H>/RL:<X|O|T|W|U>/RC:<X|U|R|C>
```

可选 Environmental：`CR`/`IR`/`AR` 与 `MAV`… 等。

**校验**：Base 段 **8 项** 缺一不可（AV/AC/PR/UI/S/C/I/A）；字母大小写按规范大写。

---

## 8. 分数计算说明

CVSS v3.1 Base 分由可利用性子分 + 影响子分经官方公式计算（含 Scope 分支），**手算易错**。

本 skill 要求：

1. 按上表 **正确选定指标**（主责）；  
2. 分数用官方计算器复核：https://www.first.org/cvss/calculator/3.1 ；  
3. 若环境无法打开计算器：给出向量 + 指标 rationale，并标注 `base_score` 为 **估算** 且 `score_confidence` 降为 medium/low；  
4. 禁止编造与向量明显矛盾的分数。

### 常见锚点（粗检，非完整表）

| 模式 | 粗检 Base |
|------|-----------|
| `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` | **9.8** Critical |
| `AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H` | **10.0** Critical |
| `AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H` | **8.8** High |
| `AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H` | **7.2** High |
| `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N` | **7.5** High |
| `AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N` | 常 **Medium** |
| `AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H` | 常 **High**（本地+用户交互） |

---

## 9. 与 CVSS v4.0 的差异（迁移备忘）

| v3.1 | v4.0（本仓不再默认使用） |
|------|--------------------------|
| `UI:N/R` | `UI:N/P/A` |
| `S:U/C` + `C/I/A` | 无 Scope；`VC/VI/VA` + `SC/SI/SA` |
| 无 `AT` | 有 `AT:N/P` |
| Temporal: E/RL/RC | Threat: 主要为 `E` |
| 向量前缀 `CVSS:3.1/` | `CVSS:4.0/` |

本仓 **默认 v3.1**；用户指定或需 FIRST v4 时加载 `cvss-v4.md` 另评；双版本对照时分两条向量输出。
