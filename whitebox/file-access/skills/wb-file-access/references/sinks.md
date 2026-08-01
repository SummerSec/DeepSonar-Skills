# File Access 白盒 Sink 速查

## 高危 sink 模式

- 路径拼接: open/readFile/sendfile/include 用户文件名
- 解压 zip slip
- 上传: 可执行后缀/双后缀/内容类型绕过写 webroot
- 日志/模板包含用户可控路径

## 审计提示

- 优先从 **危险 API** 反查，再补入口覆盖。
- 多语言时先锁定实际运行栈（README/lockfile/Dockerfile）。
- 关注二次调用：封装函数、基类 DAO、共享 HTTP client。
- 与鉴权交叉：未授权可达的 sink 优先升级为 Critical。

## 仅 Critical/High 影响

- 任意文件读到密钥/代码/云凭证
- 任意文件写导致 RCE
- 上传 webshell 或可执行内容

## 排除

- 仅读到公开静态资源
- 上传仅存对象存储且不可执行、不可覆盖关键配置
