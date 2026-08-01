# Deserialization 最小验证提示

> 仅用于已授权验证。不要构建完整攻击框架。

## 探测方向

- Cookie/ViewState/Session 二进制 blob
- RPC/RMI/JMX/自定义二进制协议
- 上传 serialized 对象被服务端还原

## 合格证据

- 可 RCE 或等价 OS 命令
- 可伪造会话接管管理员

## 不合格（不报）

- 仅库存在 CVE 但无用户可控入口
- 已切换安全绑定且无 gadget 证据

## 记录要求

- 完整 URL、方法、关键参数  
- 响应差异或 OOB 记录  
- 影响说明必须达到 Critical/High  
