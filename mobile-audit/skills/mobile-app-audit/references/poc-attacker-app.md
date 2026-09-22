# poc-attacker-app — 无权限攻击者 App

## 目标

用 **标准化、默认无额外危险权限** 的攻击者 App，稳定复现同设备恶意 App 威胁模型下的 IPC / Deep Link / Provider 等问题，并与证据包衔接。

## 章节

### 1. 模板结构

- 最小工程：单模块、明确 applicationId、调试开关可关  
- 默认 **不申请** 敏感权限；若某 case 必须权限，分 build flavor 并在证据中声明  
- 集中入口：用例列表 Activity + 每 case 独立触发方法  
- 统一日志 tag：`POC-ATTACKER`（便于 logcat 过滤）

### 2. 用例矩阵

| 类型 | 示例意图 | 观察 |
| ------ | ---------- | ------ |
| 导出 Activity | 显式组件名 + extras | 是否进敏感界面/泄漏 |
| Deep Link | 自定义 scheme / App Link | 参数是否进 sink |
| Provider | query/insert 越权读写 | 返回数据、写是否成功 |
| 广播 | 发送受保护/导出 action | 宿主是否未校验执行 |
| PendingIntent / 转发 | 若候选涉及 | 是否可篡改落地意图 |
| WebView/bridge 间接 | 若需由恶意 App 打开 URL | 仅授权范围内 |

每 case：前置状态、步骤、成功判据、清理步骤。

### 3. 签名与安装

- 使用测试签名；与目标同设备安装  
- Android 11+：在攻击者 Manifest 声明必要 `<queries>`，否则解析失败会被误判为「不可利用」

### 4. POC-ATTACKER tag 与证据衔接

- 关键步骤打 log；拉取 logcat 存入 `evidence/<id>/logcat.txt`  
- 截图与复现步骤写入同一目录；candidates 中引用相对路径

## 产出

- 攻击者 App 源码或可审阅补丁（仓库内或证据包附件）  
- 用例执行记录表（通过/失败/受 ROM 限制）  
- 与 `evidence/` 的一一对应

## 陷阱

- **PoC 额外权限**：抬高威胁模型，导致定级前提失真  
- **case 状态串扰**：未重置导致假阳性/假阴性  
- **未声明 queries**：包不可见造成「无法启动」假阴性
