# AuthZ 白盒 Sink 速查

## 高危 sink 模式

- 路由中间件缺失: admin API 无 auth
- IDOR: 资源 ID 无 ownership 校验
- JWT: none alg、密钥硬编码、可伪造
- 强制浏览: 角色校验只在前端
- 密码重置/OTP 可绕过

## 审计提示

- 优先从 **危险 API** 反查，再补入口覆盖。
- 多语言时先锁定实际运行栈（README/lockfile/Dockerfile）。
- 关注二次调用：封装函数、基类 DAO、共享 HTTP client。
- 与鉴权交叉：未授权可达的 sink 优先升级为 Critical。

## 仅 Critical/High 影响

- 未认证访问管理功能
- 普通用户提升到管理员
- 可批量读取/修改他人敏感数据或资金操作
- 可接管任意账户

## 排除

- 仅看到自己非敏感字段差异
- 无敏感数据的信息性 IDOR
- 需已是管理员才能复现的配置问题
