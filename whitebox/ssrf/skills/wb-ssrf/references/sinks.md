# SSRF 白盒 Sink 速查

## 高危 sink 模式

- 用户可控 URL: requests/httpx/axios/HttpClient/curl/file_get_contents
- webhook/预览/导入/抓取/PDF 渲染/图片代理
- 重定向跟随、DNS rebinding 未防护

## 审计提示

- 优先从 **危险 API** 反查，再补入口覆盖。
- 多语言时先锁定实际运行栈（README/lockfile/Dockerfile）。
- 关注二次调用：封装函数、基类 DAO、共享 HTTP client。
- 与鉴权交叉：未授权可达的 sink 优先升级为 Critical。

## 仅 Critical/High 影响

- 可读云 metadata 并拿到临时凭证
- 打到内网管理面导致 RCE/接管
- 可扫内网高危服务并利用

## 排除

- 仅外网回显无内网/metadata 证据
- 严格协议/域名白名单且无绕过
