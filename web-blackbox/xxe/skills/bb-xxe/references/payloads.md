# XXE 最小验证提示

> 仅用于已授权验证。不要构建完整攻击框架。

## 探测方向

- Content-Type: application/xml 接口
- 文件上传 docx/xlsx/svg/xml
- SSO SAML、SOAP 端点

## 合格证据

- 可读服务器敏感文件
- SSRF 到 metadata/内网
- 可导致 DoS 以外的代码执行（少见但需报）

## 不合格（不报）

- 解析器已完全禁用外部实体且无旁路
- 仅 billion laughs 无授权扩大测试

## 记录要求

- 完整 URL、方法、关键参数  
- 响应差异或 OOB 记录  
- 影响说明必须达到 Critical/High  
