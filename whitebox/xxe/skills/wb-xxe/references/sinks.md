# XXE 白盒 Sink 速查

## 高危 sink 模式

- XML 解析: DocumentBuilder/SAXParser/lxml/XMLReader 未禁 DTD
- SOAP/SAML/Office/XML 上传解析
- 外部实体、参数实体、XInclude

## 审计提示

- 优先从 **危险 API** 反查，再补入口覆盖。
- 多语言时先锁定实际运行栈（README/lockfile/Dockerfile）。
- 关注二次调用：封装函数、基类 DAO、共享 HTTP client。
- 与鉴权交叉：未授权可达的 sink 优先升级为 Critical。

## 仅 Critical/High 影响

- 可读服务器敏感文件
- SSRF 到 metadata/内网
- 可导致 DoS 以外的代码执行（少见但需报）

## 排除

- 解析器已完全禁用外部实体且无旁路
- 仅 billion laughs 无授权扩大测试
