# Deserialization 黑盒工具用法

## 可用工具

- httpx
- curl
- ysoserial
- nuclei

工具由 **agent-env** 镜像预装，路径在 `PATH` 中。

## 推荐顺序

1. `httpx -u <targets> -status-code -title -tech-detect` 探活与指纹  
2. `curl -i` 手工确认认证与关键请求  
3. 本类型专用验证（见 `payloads.md`）  
4. 需要扫描模板时用 `nuclei -tags deserialization`（仍需人工确认 Critical/High）  
5. OOB：`interactsh-client`  

## 限速与安全

- 默认低并发；遇 429/封禁立即降速  
- 不跑未授权目标  
- sqlmap/爆破类仅在 scope 允许且必要时使用，并限制线程  
