# evidence-and-report — 证据包与定级移交

## 目标

形成可移交 **定级模块** 与后续投递（内部报告 / 众测平台）的 **最小充分证据**；本 skill 仍 **不填写最终 severity**。

## 章节

### 1. 证据包目录规范

```text
evidence/
  assets.json                 # 可与根级同内容或快照
  candidates.md
  components.json
  <candidate-id>/
    steps.md                  # 最小复现步骤
    logcat.txt                # 打码后
    screenshots/              # 必要帧
    artifacts/                # 片段、PoC 参数、非武器化脚本
    notes.md                  # 前提、ROM、失败尝试
```

### 2. 每条 finding 最小证据集

- 入口与 sink 定位（组件 / 方法 / 参数）  
- 威胁前提（恶意 App / 用户点击 / 网络 / 版本）  
- 至少一种动态或等价强证据；**禁止**「仅静态」却宣称已复现  
- 影响描述（攻击者能读/写/执行什么），供 definitions 匹配条款  
- 不含完整武器化 exploit

### 3. 定级移交

移交时加载（相对本 skill）：

- `../../../../vuln-definitions/` — 八类机理  
- `../../../../vuln-definitions-mobile/references/severity-levels.md`  
- `../../../../vuln-definitions-mobile/references/history-patterns.md` — 校准  
- `../../../../vuln-definitions-mobile/references/gates.md` — Gate **T/S/E/C/R**  
- `../../../../vuln-definitions-mobile/references/adjustment-and-invalid.md` — INV / ADJ  

本 skill 输出候选字段建议：`mobile_class` 引用、建议对照的条款号草稿、Gate 自检表；**正式 `severity` / `severity_rule` 由定义插件裁定后回填**。  
CVSS 交 `vuln-scoring`，不替代定性。

### 4. INV → reportable false

- 命中 INV（如 INV1 本地 DoS、INV26 入口面本身等）→ `reportable: false`，**不要**写成 low/medium  
- 记入工作笔记或否决列表即可

### 5. 报告纪律

- 遵守 `../../../../shared/finding-schema.md` 与 `severity-policy.md`  
- 厂商项目资格（如 Google 设备项目）只写 `bounty_eligible` 相关事实，**不改档**  
- 密钥/会话/PII 打码；外发前按授权复核

### 6. 清理披露

- 卸载 PoC、清除代理与测试账号会话、删除隔离脱壳目录  
- 披露时间窗与重复报告纪律遵循目标项目规则文件（若适用）

## 产出

- 完整 `evidence/` 树  
- 定级移交清单（候选 ID → 建议条款 / Gate 状态 / reportable）  
- 清理确认记录

## 陷阱

- **仅静态却宣称已复现**  
- **本地崩溃撑档**（INV1）  
- **证据过曝**（未打码 token、完整用户数据、武器化脚本）
