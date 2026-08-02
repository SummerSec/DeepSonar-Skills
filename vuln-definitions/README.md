# 漏洞定义模块（vuln-definitions）

独立 plugin：为白盒与黑盒提供 **统一的漏洞语义与定级标准**。

## 安装

```text
/plugin install vuln-definitions@DeepSonar-Skills
```

或 DeepSonar Profile **始终勾选** 本模块 + 任一 `whitebox-*` / `blackbox-*`。

## 内容

| 文件 | 说明 |
|------|------|
| `skills/vuln-definitions/SKILL.md` | 入口：何时用、定级流程 |
| `references/severity-levels.md` | 严重/高危/中危/无危害 全局定义 |
| `references/classification.md` | 多类型冲突时如何归类 |
| `references/injection.md` 等 | 八类漏洞各自的定义与四级条款 |

## 原则

- **定义清楚**：每类「是什么 / 不是什么」  
- **四级齐全**：Critical / High / Medium / None 均有可操作条款  
- **报告策略分离**：本插件负责定级；仓库 `shared/severity-policy.md` 规定默认只报 C/H  
