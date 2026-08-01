# Secrets 最小验证提示

> 仅用于已授权验证。不要构建完整攻击框架。

## 探测方向

- JS/SourceMap/.git 泄露密钥
- 公开对象存储、备份、heapdump、actuator env
- 错误页/调试接口泄露连接串

## 合格证据

- 密钥仍有效且可接管云/支付/生产 DB/管理员
- 私钥可解密流量或伪造身份
- CI token 可推送供应链

## 不合格（不报）

- 明显 dummy/example/test 密钥
- 已轮换且验证无效
- 仅 public client_id 无 secret

## 记录要求

- 完整 URL、方法、关键参数  
- 响应差异或 OOB 记录  
- 影响说明必须达到 Critical/High  
