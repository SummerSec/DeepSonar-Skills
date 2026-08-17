# OpenHarmony 资产范围（bounty 仓库名单）

本文件是 **vuln-definitions-oh 的资产范围**：落点仓库必须能对上官方奖励计划同步名单，才按本插件四档投递。

**唯一名单源（实时）**：

```text
https://bugbounty.openharmony.cn/bug-bounty/openharmony/sync/repositories
```

响应：`{"code":"20000","data":["<repo>", ...]}`，`data` 为仓库名数组。现场 GET 后精确匹配，**不要**把名单全文检入本仓或贴进 SKILL/报告。  
非官方镜像（只读对照，不作权威）：`https://sumsec.me/resources/oh-scope.html`

---

## 1. 怎么判「在范围内」

1. 先定 **落点仓库**（公告/代码仓名，如 `communication_dsoftbus`）  
2. 在官方实时 `data` 里 **精确匹配** 仓库名  
3. 命中 → 是 bounty 资产，再按下面分桶  
4. 未命中 → **不是本计划资产**，不按 OH 奖励计划出正式 finding（可对内记录）

模块名与仓名不完全一致时：用仓名匹配，不要用子系统中文名瞎猜。一份 finding 只绑一个主落点仓。

---

## 2. 分桶（在册之后）

在册 ≠ 都应报。在册之后仍走 ADJ/INV 与类型表。

| 桶 | 如何认 | 处理 |
|----|--------|------|
| **在册自研** | 名单内，且不是下三行 | 按本插件类型 + 四档 + Gate |
| **在册三方** | `third_party_*` | **默认 INV4**；OH 默认可达且可独立 e2e 实害才例外 |
| **在册上游内核** | `kernel_linux` / `kernel_linux_4.19` / `kernel_linux_5.10` / `kernel_linux_6.6` 通用树 | **默认 INV4**；OH 自研补丁/模块（`kernel_linux_patches`、`kernel_linux_common_modules*`、`kernel_common_modules_newip` 中可证为 OH 独有路径）按自研 |
| **在册厂商** | `vendor_*` | 非标准设备默认路径 → ADJ2；能在社区标准/small 设备 e2e 再评 |
| **在册非运行时** | `xts_*`、`test*`、`testfwk_*`、`docs`、`community`、`codelabs`、`oh-agreements`、`release-management`、`repohooks`、`manifest`、`.gitcode`、多数 `developtools_*`、`kernel_linux_config`、`kernel_linux_build` | 默认不跟（测试/文档/工具链/内核构建配置，不是设备攻击面） |
| **不在册** | 名单外 | 非本 bounty 资产，不投递 |

`kernel_liteos_*`、`kernel_uniproton` 视为 **在册自研**（不是 INV4 上游树）。

---

## 3. 与类型表 / INV4 的关系

| 问题 | 看哪里 |
|------|--------|
| 这个仓挖什么形态 | `attack-surfaces.md` → `phone-os-vuln-types.md` |
| 三方/上游通病 | 本文件分桶 + `adjustment-and-invalid.md` INV4 |
| 定级 | `severity-levels.md` |

名单只解决 **「算不算 OH bounty 资产」**，不解决定级，也不因为「在名单里」就预设有洞。  
**在册仓名 ≠ 当前产品代码**：名单会残留已迁走的旧仓名，其 `master` 可能停在迁仓当年。投递前必须按 `gates.md` Gate V 核对后继仓 / 最新公开版本。

---

## 4. 审计时怎么用

```
落点仓名 → 官方名单精确匹配
  ├ 不在册     → 停（非本计划资产）
  ├ third_party / 上游 linux 树 → INV4（除非默认路径独立 e2e）
  ├ vendor / 仅测试文档工具   → ADJ2 / 不跟
  └ 在册自研   → Gate V（活树/后继仓）→ Gate A–D 与四档
```

查后继仓的最小动作：看该仓 `master` 最后提交日期；停更则在 GitCode/GitHub 搜现用路径（`foundation/...`、`distributeddatamgr_*` 等），对现仓同一 sink 再读一遍。只钉旧 SHA 的 Job 不能跳过这一步。

Finding 建议写：

```yaml
asset_repo: communication_dsoftbus   # 官方名单中的仓名
asset_scope: in_list_first_party     # 见下
```

`asset_scope` 取值：`in_list_first_party` | `in_list_third_party` | `in_list_upstream_kernel` | `in_list_vendor` | `in_list_non_runtime` | `not_in_list`。

---

## 5. 名单规模（便于心算）

官方名单量级约八百仓：约三分之一 `third_party_*`，其余为自研/厂商/测试等。以实时接口为准。
