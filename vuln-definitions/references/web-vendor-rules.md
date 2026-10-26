# 目标程序规则模板（vendor-<program>.md）

Web 目标通常自带一份 **程序规则**（项目页、公告、档位表、活动口径、去重规则）。本文件是 **模板与约定**：为每个程序新建 `vuln-definitions/references/vendor-<program>.md`，**只加文件，不开新 plugin**；`<program>` 用程序名（小写、连字符）。

程序文件 **覆盖** 通用 Web 语义的下列项，不覆盖的部分回落到 `web-asset-scope.md` / `web-gates.md` / `<type>.md`。

---

## 1. 必须写清的八项

| # | 项 | 内容要求 |
|---|----|----------|
| P1 | 程序元信息 | 名称、程序页 URL、对照日；**每个数字都要有出处** |
| P2 | 官方档位表 | 官方等级（如 P1–P5 / S0–S3 / 严重-低危）→ 本仓四档（`critical` / `high` / `medium` / `low`）逐行映射 |
| P3 | `report_policy` 默认值 | `ch_only`（默认）或 `program_table`；后者须在 P2 给出档位表 |
| P4 | 资产范围与例外 | 覆盖 `web-asset-scope.md` 的分桶与范围外清单；列出程序专属合格项与排除项 |
| P5 | 环境口径 | 预发 / 灰度 / DEV 是否收；是否覆盖 `severity-levels.md#ADJ-E1`–`#ADJ-E3` |
| P6 | 复现与证据要求 | 版本与时间窗、账号类型、限速、禁止项（扫描器、破坏性验证、触碰他人数据） |
| P7 | 去重与关联报告 | 同根因复报合并口径、续报与补充说明的记法（`duplicate_of` / `related_findings` / `regression_of`） |
| P8 | 资格与赏金 | 赏金资格、提升档位的纪律；**赏金不改 `severity`** |

---

## 2. 活动标签（`activity`）

- 集中活动期产出必须写 `activity`（活动标识），口径取自程序页原文，不自造
- 活动期资产与临时域名按 `web-asset-scope.md` §6 判定合格性
- 活动结束后复报：资产判定按 **当前** 清单复判，不沿用活动期结论

---

## 3. 去重与关联报告

| 情形 | 记法 |
|------|------|
| 与既有报告完全重复 | `duplicate_of: <原 id>`，不新开 finding |
| 同一根因的不同接口 / 不同参数 | `related_findings`，合并为一条 finding（`severity-levels.md#ADJ-B2`） |
| 补丁绕过 / 回归 | `regression_of: <原 id>`，按绕过后的影响重新定档（`#ADJ-B1`） |
| 跨根因打包（多条缺陷一次提交） | 每根因一条 finding，`severity` 各自独立（`#ADJ-C2`） |
| 续报「与上一条不是同一系统」 | 视为新根因，新开 finding 并在 `related_findings` 互指 |

---

## 4. 冲突优先级

1. 程序官方档位表 / 项目明文 **优先于** 本仓默认口径（仅在 `report_policy: program_table` 且 P2 已填时生效）
2. 程序规则 **覆盖** `web-asset-scope.md` / `web-gates.md` / `severity-levels.md` §8.1 的对应项
3. 程序规则 **不覆盖**：类型定义（`<type>.md`）、定级档位语义、`confidence` 与证据纪律
4. 程序规则与类型定义冲突时：`severity` 仍按条款定，冲突点写入 `rationale`

---

## 5. 文件骨架（复制后逐项填）

```markdown
# vendor-<program> — <程序名> 项目规则

对照日 <YYYY-MM-DD>（[程序页](<URL>)）。范围以官方页面实时为准，本文件是快照与抽象。

## 1. 档位映射
| 官方档 | 本仓四档 | 说明 |
|--------|----------|------|
| <P1> | `critical` | … |

`report_policy: program_table`（本程序默认）

## 2. 资产范围
- 合格：…
- 范围外：…

## 3. 环境口径
- 预发 / DEV：<收 / 不收 / 按同构判定（ADJ-E1）>

## 4. 复现与证据纪律
- 账号：… 限速：… 禁止：…

## 5. 去重与关联报告
- 续报 / 补充 / 绕过 分别怎么记

## 6. 资格与赏金
- …（不改 `severity`）
```

---

## 6. 落地约定

- 新建文件命名：`vuln-definitions/references/vendor-<program>.md`
- 新增或修改程序文件后，`report_policy` 的变化须在 `shared/severity-policy.md` 的口径开关范围内（只决定「是否写入」，不改 `severity`）
- 同一程序规则大改（档位表结构性变化）→ 更新 `vuln-definitions` 版本，并在该文件顶部刷新对照日