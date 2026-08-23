# Chrome / Chromium 浏览器漏洞定义指南（vuln-definitions-chrome）

独立 plugin：面向 **Google Chrome / Chromium 浏览器** 的定级语义源。  
以 Chromium 官方 [Severity Guidelines](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/severity-guidelines.md) 的四档（Critical S0 / High S1 / Medium S2 / Low S3）为准，并补上进程沙箱、威胁模型与「不算安全漏洞」条款。  
范围、投递与赏金资格对齐 [Chrome VRP Rules](https://bughunters.google.com/about/rules/chrome-friends/chrome-vulnerability-reward-program-rules)（**赏金不定级**）。

**不是** ChromeOS 系统定级（ChromeOS 另有文档）。**不是** `wb-*`/`bb-*` 的 Web 应用八类细则。

## 安装

```text
/plugin install vuln-definitions-chrome@DeepSonar-Skills
```

审计时建议同时安装 `vuln-definitions`（八类机理）+ `vuln-scoring`（CVSS v3.1/v4.0）。

## 内容

| 文件 | 说明 |
|------|------|
| `skills/vuln-definitions-chrome/SKILL.md` | 入口：角色、工作流、输出 |
| `skills/vuln-definitions-chrome/references/severity-levels.md` | 官方四档条款 + 进程 × 攻击者矩阵 |
| `skills/vuln-definitions-chrome/references/terminology.md` | 网页内容 / 已沦陷 renderer / Site Isolation / 沙箱 |
| `skills/vuln-definitions-chrome/references/process-sandbox.md` | 分平台沙箱（按**最弱沙箱平台**定级） |
| `skills/vuln-definitions-chrome/references/chrome-vuln-types.md` | 浏览器攻击面形态（进程/内存/Web/Mojo/UX/扩展/GPU/AI） |
| `skills/vuln-definitions-chrome/references/attack-surfaces.md` | Chromium 目录族 → 类型索引 |
| `skills/vuln-definitions-chrome/references/adjustment-and-invalid.md` | 缓解降档 + 非安全 / 非威胁模型 |
| `skills/vuln-definitions-chrome/references/gates.md` | Gate T/S/P/D/C/R + 报告要求 |
| `skills/vuln-definitions-chrome/references/asset-scope.md` | Chrome 浏览器范围 vs ChromeOS / 测试通道 / 实验旗标 |
| `skills/vuln-definitions-chrome/references/vrp-rules.md` | Chrome VRP 范围 / 投递 / 资格（不定级） |

## 规则

- **官方四档均可报**：正式报告含 `critical`/`high`/`medium`/`low`；非安全漏洞与 Gate 不过不报  
- **无效即停**：MiraclePtr PROTECTED、纯 DoS、空指针小固定偏移、物理本机等同用户等 → `reportable: false`（不要写成低危，也不要用 `none` 冒充第四档）  
- **定性定量分离**：本插件定性；CVSS（默认 v3.1，可按需 v4.0）由 `vuln-scoring` 负责  
- **沙箱改变档位**：网页直达未沙箱高权进程 ≠ 沙箱内 renderer RCE ≠ 已沦陷 renderer 再逃逸  
- **Site Isolation ≠ OS 沙箱逃逸**：跨站进同一 renderer / 跨站数据泄露按高危 Web 平台条款，不按 Critical 出沙箱  
- **不收录具体 case**：无 CVE、无 crbug 清单；类型来自官方条款的抽象归纳  
- **缓解降档是官方规则**：非网页可达、罕见交互、需关浏览器/毁 profile，通常降一档或更多
- **赏金 ≠ 定级**：`vrp_eligible` 只回答能不能按 Chrome VRP 投；金额以规则页为准，不抬/压 `severity`  

## 与 vuln-definitions 的关系

- **机理**（injection/rce/ssrf/…）→ `vuln-definitions`  
- **Chrome 四档 + 浏览器形态** → 本插件（`chromium.md` 为精简镜像）  

## 语义基线

- 定级口径：[Chromium Severity Guidelines](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/severity-guidelines.md)（对照日 2026-08-23）  
- 威胁模型 / 非安全：[Chrome Security FAQ](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/faq.md)  
- 沙箱分平台：[process-sandboxes-by-platform.md](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/process-sandboxes-by-platform.md)（上游表更新至 M128）  
- 标签与 Impact：[security-labels.md](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/security-labels.md)  
- VRP 规则与奖金表（资格，不定级）：[Chrome VRP Rules](https://bughunters.google.com/about/rules/chrome-friends/chrome-vulnerability-reward-program-rules)（短链 https://g.co/chrome/vrp）
- 投递入口：[Bughunters → Chrome VRP](https://bughunters.google.com/report/vrp)
- 投递习惯：[VRP FAQ](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/vrp-faq.md)  
