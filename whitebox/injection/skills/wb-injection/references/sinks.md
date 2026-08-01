# Injection 白盒 Sink 速查

## 高危 sink 模式

- SQL 字符串拼接: execute/query/raw/whereRaw/createQuery
- 命令执行: system/exec/popen/Runtime.exec/child_process/os.system
- NoSQL 操作符注入: $where / $gt 等用户可控操作符对象
- LDAP filter 拼接

## 审计提示

- 优先从 **危险 API** 反查，再补入口覆盖。
- 多语言时先锁定实际运行栈（README/lockfile/Dockerfile）。
- 关注二次调用：封装函数、基类 DAO、共享 HTTP client。
- 与鉴权交叉：未授权可达的 sink 优先升级为 Critical。

## 仅 Critical/High 影响

- 可读全库/写库/读文件/执行系统命令
- 盲注可稳定抽取敏感数据或拿 shell
- 多租户下可跨租户读数据

## 排除

- 仅语法错误回显但不可利用
- WAF 完全阻断且无绕过证据
- 二次编码猜测无稳定路径
