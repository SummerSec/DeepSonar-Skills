# Bugcrowd ClickHouse 项目纪律与赏金资格（不定级）

对齐 [Bugcrowd ClickHouse](https://bugcrowd.com/engagements/clickhouse)（对照日 2026-08-28）。
本文件回答「能不能按这个项目拿赏金」；**不改 `severity`**，`bounty_eligible: false` 不阻止对内正式 finding。定级见 `severity-levels.md`，排除见 `adjustment-and-invalid.md`。

---

## 1. 项目基本盘（快照）

| 项 | 值 |
|----|-----|
| 状态 | In progress，Ongoing（2022-06-28 起） |
| 定级 | Bugcrowd VRT（P1–P5），可申诉降档 |
| 验证时效 | 约 1 个月内 75% 出结果（Expedited triage） |
| 协作 | 不允许（No collaboration） |
| 披露 | 协调披露；公开须批准（Disclosure request） |
| 测试期 | 长期有效 |

## 2. 赏金表（对照日 2026-08-28）

| 档 | ClickHouse Cloud / Langfuse | ClickHouse OSS |
|----|------------------------------|----------------|
| P1 | $2100–2500 | $1050–1250 |
| P2 | $1000–1250 | $500–625 |
| P3 | $100–600 | $50–300 |
| P4 | $50–100 | $0–50 |
| P5 | 无赏金 | 无赏金 |

> OSS 档低于云平台档（近期有 "Reward decrease" 标记）；金额以项目页实时为准。

## 3. 账号与测试纪律（违规 = 没收 / 移除）

1. **注册邮箱必须 @bugcrowdninja.com**（云平台 / Langfuse 目标）
2. 免费账号自带 **$300** 测试额度；耗尽找 Bugcrowd Support 加
3. **禁止无限信用卡 / 一次性卡**
4. **禁扫描器**；自定义脚本 / fuzz 必须 **定向** 且 **≤5 req/s**
5. 只测 **自己** 账号；不碰他人数据
6. 不主动降级系统 / 服务
7. **停止条款**：发现 PII 泄露或 shell → **立即停止测试并上报**；继续枚举 / 横向 / 提权 = 没收奖励 + 移除项目

## 4. 投递要求

1. 按 Bugcrowd 指南写报告：漏洞描述、发现位置、复现步骤、**潜在影响**
2. OSS 报告建议结构（官方示例）：
   - **Lab setup**：server / client 版本、OS、平台
   - **Additional setup**：配置差异（如 encryption_codecs、GRANT 语句）
   - **Exploitation**：分步
   - **Outcome**：越过了什么边界、拿到了什么
   - **Extra Details**：crashlog、PoC 查询 / 脚本、方法论、缓解建议
3. 描述特殊方法论 / 工具（加速 triage）
4. 降档可申诉：要求官方给出完整解释，然后按申诉流程反驳

## 5. bounty_eligible 判定（写进 finding 前）

```
bounty_eligible: true 须全部满足：
  1. 目标 in-scope（asset-scope.md §1）
  2. 未命中 INV 排除条款
  3. 环境 / 纪律合格（Gate S/E/R 全过）
  4. 未发表、未重复
  5. 云平台目标：测试用 @bugcrowdninja.com 账号、≤5 req/s、未触他人数据
任一不满足 → bounty_eligible: false（仍可对内定级与报告）
```

## 6. 优先级建议（研究路线）

| 优先 | 目标 | 理由 |
|------|------|------|
| 1 | Langfuse Cloud | 2026-07 新增，关注少；源码开源可白盒找 sink 黑盒验证 |
| 2 | ClickHouse Cloud 控制面 | 官方 focus areas 与本仓 bb-* skill 直接对齐（IDOR / SSRF / 注入） |
| 3 | ClickHouse OSS | 稳定 P1 产出但门槛高（C++ / RBAC / 内存安全），赏金减半 |

官方 focus areas（Cloud / Langfuse）：IDOR、注入、存储型 XSS、SSRF、敏感数据泄露、业务逻辑、RCE、SQLi、认证 / 授权问题、未授权 API、绕安全控制。  
官方 focus areas（OSS）：RBAC 绕过、安全控制绕过（mTLS / 加密配置）、内存破坏与缓冲区溢出。
