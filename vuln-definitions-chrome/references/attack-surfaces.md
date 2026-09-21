# 攻击面索引（Chrome 类型 × Chromium 目录）

**形态**见 [`chrome-vuln-types.md`](chrome-vuln-types.md)。  
**进程沙箱**见 [`process-sandbox.md`](process-sandbox.md)。  
**范围**见 [`asset-scope.md`](asset-scope.md)。  
本文件只做 **Chromium 源码目录落点索引**，便于选模块；不收录 CVE / crbug。

定级：`severity-levels.md` + `adjustment-and-invalid.md`。  
VRP 资格：`vrp-rules.md`。

---

## 1. 目录族 → 类型

| 目录 / 组件族（示意） | 优先对照类型 ID | 审计要点 |
|----------------------|-----------------|----------|
| `chrome/browser`、`content/browser` | P1、M1a、I1、F1、U* | 未沙箱主进程；网页直达 vs 仅 Mojo；任意本地文件 |
| `content/renderer`、`third_party/blink` | P2、M2a、W1–W4 | renderer ACE、绑定、SOP；ASAN READ 默认当 WRITE |
| `v8` | M3a、M4a | ACE / DCHECK → H2；分层正确性 → M1；`--experimental` 专属常 Impact_None / VRP 排除 |
| `gpu/`、`components/viz`、`third_party/angle` | G1–G3、P1/P2 | 先查该 OS GPU 是否沙箱；Android 网页直达未沙箱 → C2 |
| Metal 着色器 / `MTLCompiler` | G3 | 仅 macOS → M4 |
| `third_party/dawn`、tint | G4 | ICE → INV |
| `net/`、`services/network` | N1、W5 | Win/Linux/Android 常未沙箱；HSTS |
| `mojo/`、`*.mojom`、`content/browser/*host*` | I1–I4、P3 | 已沦陷 renderer 模型；勿用自定义 harness |
| `components/site_isolation`、`content/browser/site_instance*`、process model | W2、W3 | 跨站同进程 / 跨站数据 |
| `chrome/browser/ui`、omnibox、permission prompts | U1–U7 | 安全决策欺骗才报；clickjacking 再严也是 L18 |
| Chrome 内 Gemini / 浏览器 AI 表面 | A1–A3 | 未确认动作 / 敏感数据外带 / AI UI XSS 才评；越狱幻觉 → INV19 |
| `chrome/browser/extensions`、`extensions/` | E1–E3 | 特定扩展 → M2；debugger → L6 |
| `chrome/updater`、elevation / installer | E5、P5 | 无前提系统提权 → H13；同用户本机 → INV |
| `chrome/browser/download`、Safe Browsing 文件策略 | F2、F3 | 零交互沦陷的新类型才有意思 |
| PDF renderer、`pdf/`、`pdfium` | P2、M2a | 已沙箱 renderer 类 |
| `media/`、`capture` | G5 | Video Capture 多数平台未沙箱 |
| `third_party/libxml`、`sqlite`、编解码库 | M2a / G5 | 须证 Chrome 出货路径可达；纯上游通病写清可达性 |
| iOS `ios/`（WebKit 壳） | — | **不是**本插件主模型（见 asset-scope） |
| ChromeOS `ash/`、`chromeos/` | P5 边缘 | **不是**浏览器四档主模型；系统洞走 ChromeOS 文档 |
| `*_tests`、`browser_tests`、`unit_tests` | — | 测试二进制 → INV |
| `chrome-headless-shell`、Chrome for Testing | — | 测试发行版，不可信内容不在模型内 |

---

## 2. 使用关系

```
选目录（本文件）→ 选进程沙箱（process-sandbox.md）
  → 选形态（chrome-vuln-types.md）→ 条款（severity-levels.md）
  → Gate / ADJ·INV → 官方四档可报
```

不要因为「某目录历史上出过洞」就预设有洞；按 **当前出货默认配置 + 可演示安全实害** 判定。
