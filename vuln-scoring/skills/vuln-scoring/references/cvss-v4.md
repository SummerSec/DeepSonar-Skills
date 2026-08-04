# CVSS v4.0 指标与取值决策

权威规范：[FIRST CVSS v4.0 Specification](https://www.first.org/cvss/v4.0/specification-document)  
本文件是 **审计/挖洞场景下的操作摘要**，边界争议以官方规范为准。

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
- Threat / Environmental 未评估时用 `X`（Not Defined），或省略可选段并在文案标明 `nomenclature: CVSS-B`

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

评估对象是 **脆弱系统（Vulnerable System）** 上发起利用的难易。

### 2.1 Attack Vector — `AV`

| 值 | 含义 | 典型场景 |
|----|------|----------|
| **N** Network | 远程网络栈可达 | 公网/内网 HTTP API、无物理邻接限制 |
| **A** Adjacent | 逻辑相邻 | 同链路层、同蓝牙/Wi‑Fi、受限邻接网段 |
| **L** Local | 本地读/写/执行 | 本地文件、本地用户会话、需先登录主机 |
| **P** Physical | 物理接触 | 插 USB、拆机、接触调试口 |

**决策**：攻击者载荷最终从哪一层进入脆弱组件？浏览器里点开远程链接触发的本地解析漏洞常为 `AV:N`（若漏洞在远程可达服务）或 `AV:L`（若仅本地打开文件）——以 **脆弱组件的可达方式** 为准。

### 2.2 Attack Complexity — `AC`

| 值 | 含义 |
|----|------|
| **L** Low | 无特殊规避；可重复稳定成功 |
| **H** High | 必须绕过安全机制（如 ASLR/CFG 利用原语）、或依赖目标侧秘密/竞态中的强约束且难稳定 |

**不要**把「需要登录」算进 AC（那是 PR）。  
**不要**把「需要特定配置开关」优先算进 AC（更常是 AT）。

### 2.3 Attack Requirements — `AT`（v4 新增）

| 值 | 含义 |
|----|------|
| **N** None | 在常见部署下即可利用 |
| **P** Present | 依赖特定执行/部署条件：竞态窗口、非默认配置、中间人位置、特定负载特征等 |

示例：

- 默认开启的反序列化入口 → `AT:N`  
- 仅 `DEBUG=true` 才暴露的控制台 → `AT:P`  
- 需要攻击者处于路径上的明文会话固定 → `AT:P`

### 2.4 Privileges Required — `PR`

| 值 | 含义 |
|----|------|
| **N** None | 未认证 / 匿名即可 |
| **L** Low | 普通用户、基础角色；能力受控 |
| **H** High | 管理员、高特权服务账户等显著特权 |

「自助注册后的普通账号」→ 通常 `PR:L`，不是 `PR:N`。  
「仅管理员后台可触发」→ `PR:H`（影响再大也可能与 DeepSonar「管理员前提」降级逻辑一致）。

### 2.5 User Interaction — `UI`（v4 细化）

| 值 | 含义 |
|----|------|
| **N** None | 无任何用户参与 |
| **P** Passive | 有限/非自愿交互（如渲染预览、访问恶意页即中） |
| **A** Active | 需目标用户主动完成具体步骤（点击危险项、改安全设置、导入不可信文件并确认等） |

---

## 3. Base：影响指标（Impact）

v4 **取消 Scope**。分别评估：

- **Vulnerable System**：直接被利用的组件 → `VC` / `VI` / `VA`  
- **Subsequent System(s)**：利用成功后波及的其它系统/组件 → `SC` / `SI` / `SA`

每个 CIA 维度取值：

| 值 | 含义 |
|----|------|
| **H** High | 机密性/完整性/可用性遭受严重损失（全量敏感数据、完全失控、核心服务不可用等） |
| **L** Low | 有限损失（部分数据、有限篡改、性能降级等） |
| **N** None | 无可观察影响 |

### 3.1 填写原则

1. 按 **已证明或高度可信的最终后果** 填，不按「幻想 exploit 链」。  
2. 整库拖走 / 任意文件读敏感路径 → 通常 `VC:H`。  
3. 任意命令执行 / 写 webshell → 通常 `VC:H/VI:H/VA:H`（视是否已证明三性皆失）。  
4. SSRF 仅打到 metadata 且读到云密钥 → 脆弱系统影响可能有限，**后续云账号** 进 Subsequent（`SC/SI/SA`）。  
5. 纯本机 DoS 无数据影响 → 常 `VA:H`，`VC:N/VI:N`。  
6. 无跨系统证据时，Subsequent 全 `N`。

### 3.2 与「链式漏洞」

- 单 finding 只评 **本缺陷直接后果**；  
- 明确的一跳后续（如 SSRF→IMDS→密钥）且证据充分，可写入 Subsequent；  
- 需要第二个独立 0day 才能成立的链 → **不要**写入影响，除非用户要求「假设链」。

---

## 4. Threat 指标组

### Exploit Maturity — `E`

| 值 | 含义 |
|----|------|
| **X** Not Defined | 未评估；计算时规范按最坏情况处理——输出中必须说明 |
| **A** Attacked | 已有野外利用报告，或公开/可获取的利用工具显著降低利用成本 |
| **P** POC | 有公开 PoC，但无已知活跃利用/武器化工具 |
| **U** Unreported | 无已知 PoC、利用与活跃攻击 |

审计现场自研复现 **不等于** 自动 `E:A`；除非已确认野外或公开武器化，否则：

- 仅内部验证 → 常 `E:U` 或 `E:X`  
- 跟随公开 CVE 且有 PoC → `E:P`  
- KEV / 威胁情报确认活跃利用 → `E:A`

---

## 5. Environmental（可选）

仅当用户/资产上下文明确时填写：

| 指标 | 含义 |
|------|------|
| **CR / IR / AR** | 组织对机密性/完整性/可用性的业务要求：H/M/L/X |
| **Modified Base（M\***）** | 环境缓释或放大后的修正指标，如 `MAV`、`MPR`、`MVC`… |
| **MSI / MSA = S** | 涉及人身安全时的 Safety 取值（工控/医疗等） |

无环境信息 → 不要编造 Environmental 分。

---

## 6. Supplemental（可选，**不影响数值分**）

可在 rationale 中定性备注，便于优先级：

| 指标 | 用途 |
|------|------|
| Safety (S) | 人身安全影响 |
| Automatable (AU) | 是否易自动化/蠕虫化 |
| Recovery (R) | 恢复难度 |
| Value Density (V) | 单点价值密度 |
| Response Effort (RE) | 响应/修复工作量 |
| Provider Urgency (U) | 厂商紧急度 |

---

## 7. 决策速查（审计常用）

| 现场观察 | 优先指标 |
|----------|----------|
| 公网匿名 HTTP 入口 | `AV:N`, `PR:N` |
| 需登录普通用户 | `PR:L` |
| 仅管理员后台 | `PR:H` |
| 默认配置可打 | `AT:N` |
| 仅非默认/调试开关 | `AT:P` |
| 稳定一条请求复现 | `AC:L` |
| 强依赖内存布局/难稳竞态 | `AC:H` |
| 接口直接 RCE | `VC:H/VI:H/VA:H`, Subsequent 视横向 |
| 仅越权读他人订单 | `VC:L` 或 `H`（看数据敏感与规模） |
| SSRF→云 metadata 密钥 | 本机影响 + `SC/SI` 升高 |
| 需用户点击恶意链接 | `UI:P` 或 `UI:A`（看是否主动确认） |

---

## 8. 向量串格式

```
CVSS:4.0/AV:<N|A|L|P>/AC:<L|H>/AT:<N|P>/PR:<N|L|H>/UI:<N|P|A>/VC:<H|L|N>/VI:<H|L|N>/VA:<H|L|N>/SC:<H|L|N>/SI:<H|L|N>/SA:<H|L|N>
```

可选追加：

```
/E:<X|A|P|U>
/CR:<X|H|M|L>/IR:…/AR:…
/MAV:… 等 Modified 指标
```

**校验**：Base 段 11 个指标缺一不可；字母大小写按规范大写。

---

## 9. 分数计算说明

CVSS v4.0 使用等价类（equivalence sets）与查表/公式组合，**手算易错**。

本 skill 要求：

1. 按上表 **正确选定指标**（主责）；  
2. 分数可用官方计算器复核：https://www.first.org/cvss/calculator/4.0 ；  
3. 若环境无法打开计算器：给出向量 + 指标 rationale，并标注 `base_score` 为 **估算** 且 `score_confidence` 降为 medium/low；  
4. 禁止编造与向量明显矛盾的分数（例如全 H 影响却给 2.0）。

常见锚点（便于粗检，非完整表）：

| 模式 | 粗检 |
|------|------|
| 网络+无认证+低复杂+无交互+三高影响+无后续 | 通常 **Critical 档（≥9.0）** |
| 网络+低权限+高影响数据 | 常 **High～Critical** |
| 需高权限管理端 | 分数与 DeepSonar 等级常双双下降 |
| 仅本地+需用户主动操作+有限影响 | 常 **Medium 及以下** |
