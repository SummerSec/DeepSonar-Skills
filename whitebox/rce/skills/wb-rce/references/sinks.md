# RCE 白盒 Sink 速查

## 高危 sink 模式

- eval/exec/Function/compile/ScriptEngine
- SSTI: render_template_string/Velocity/Freemarker/Thymeleaf 用户模板
- 表达式: SpEL/OGNL/MVEL/JEXL 用户可控
- 反序列化入口见 deserialization plugin（本 plugin 聚焦直接代码执行）
- 危险动态: yaml.load/pickle/unserialize 若直接执行见对应类型

## 审计提示

- 优先从 **危险 API** 反查，再补入口覆盖。
- 多语言时先锁定实际运行栈（README/lockfile/Dockerfile）。
- 关注二次调用：封装函数、基类 DAO、共享 HTTP client。
- 与鉴权交叉：未授权可达的 sink 优先升级为 Critical。

## 仅 Critical/High 影响

- 可执行任意命令或等价代码
- 可写 webshell / 反弹 shell 路径明确
- 云环境可拿实例权限

## 排除

- 仅报错含类名无执行面
- SSTI 只数学运算无 RCE 链且无敏感读
