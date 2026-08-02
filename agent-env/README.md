# Agent 环境（黑盒工具内置）

黑盒 skill（`bb-*`）假设下列工具已在 **agent 运行环境** 的 `PATH` 中，而不是在任务运行时临时下载。

## 文件

| 文件 | 用途 |
|------|------|
| `tools-manifest.json` | 工具清单、用途、关联 plugin |
| `Dockerfile.blackbox` | 示例镜像；可并入 DeepSonar `agent-harness/image.mjs` |
| `install-tools.sh` | 可选：在已有 Debian/Ubuntu 环境安装工具 |

## 与 DeepSonar 集成

1. 将 `tools-manifest.json` 中的工具 pin 版本后写入沙箱镜像构建脚本。  
2. 黑盒 job 使用 **允许访问目标 scope + OOB** 的网络策略（与白盒默认断网不同）。  
3. Profile 勾选 `blackbox-<type>` 模块；不要在白盒断网沙箱里跑 `bb-*`。  

## 原则

- **预装、可复现、可校验 checksum**  
- Skill 内不写 `curl \| bash` 安装未知脚本  
- 扫描器结果必须经 skill 的 Critical/High 门槛过滤  
