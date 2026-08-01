# Deserialization 白盒 Sink 速查

## 高危 sink 模式

- Java: ObjectInputStream/readObject/XStream/Jackson enableDefaultTyping/YAML
- PHP: unserialize 用户输入
- Python: pickle/yaml.load/marshal
- .NET: BinaryFormatter/LosFormatter/JSON.NET TypeNameHandling
- 缓存/Session/消息队列中的序列化对象

## 审计提示

- 优先从 **危险 API** 反查，再补入口覆盖。
- 多语言时先锁定实际运行栈（README/lockfile/Dockerfile）。
- 关注二次调用：封装函数、基类 DAO、共享 HTTP client。
- 与鉴权交叉：未授权可达的 sink 优先升级为 Critical。

## 仅 Critical/High 影响

- 可 RCE 或等价 OS 命令
- 可伪造会话接管管理员

## 排除

- 仅库存在 CVE 但无用户可控入口
- 已切换安全绑定且无 gadget 证据
