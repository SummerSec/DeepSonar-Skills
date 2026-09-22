# Secrets 白盒 Sink 速查

## 高危 sink 模式

- 硬编码: AK/SK、私钥、JWT secret、DB 密码、第三方 token
- 提交到仓库的 .env/p12/pem/kubeconfig
- 前端包中的 priv key 或 admin API key
- 日志打印完整 Authorization

## 审计提示

- 优先从 **危险 API** 反查，再补入口覆盖。
- 多语言时先锁定实际运行栈（README/lockfile/Dockerfile）。
- 关注二次调用：封装函数、基类 DAO、共享 HTTP client。
- 与鉴权交叉：未授权可达的 sink 优先升级为 Critical。

## 仅 Critical/High 影响

- 密钥仍有效且可接管云/支付/生产 DB/管理员
- 私钥可解密流量或伪造身份
- CI token 可推送供应链

## 排除

- 明显 dummy/example/test 密钥
- 已轮换且验证无效
- 仅 public client_id 无 secret
