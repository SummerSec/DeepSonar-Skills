# SSRF 最小验证提示

> 仅用于已授权验证。不要构建完整攻击框架。

## 探测方向

- URL 参数: url/link/src/target/webhook/callback/feed
- 文件导入 by URL、头像 URL、API 代理
- PDF/截图/office 转换服务

## 合格证据

- 可读云 metadata 并拿到临时凭证
- 打到内网管理面导致 RCE/接管
- 可扫内网高危服务并利用

## 不合格（不报）

- 仅外网回显无内网/metadata 证据
- 严格协议/域名白名单且无绕过

## 记录要求

- 完整 URL、方法、关键参数  
- 响应差异或 OOB 记录  
- 影响说明必须达到 Critical/High  
