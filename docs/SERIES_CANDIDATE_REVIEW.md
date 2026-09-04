# Series Candidate Review / Promotion 工作流

## 为什么 Snapshot 之后还必须有 Review

`Series Index Snapshot` 只负责“发现官方索引上有什么”，`series:index:diff` 只负责指出“哪些外部 ID 尚未映射”。二者都不能证明候选已经适合进入正式 Community Registry。

0.4.5 增加 `staging/series-candidate-reviews.json`，把人工审核决策独立记录下来，使流程变成：

`官方 Index → Snapshot → Diff Candidate → 官方详情页人工复核 → Review Ledger → 正式 Series + Source Record + approved Mapping`

## Review 决策

- `publish`：官方详情页能确认 Provider 外部 ID、日文规范名与 Maker 归属，并且没有现有实体冲突。必须填写即将发布/已经发布的 `communityId`。
- `hold`：证据不足、同名冲突、Maker/Label 归属不清或需要更多来源。不得占用 Community ID。
- `reject`：确认不是应发布的 Series 候选，例如错误解析、导航项或其他非 Series 对象。不得占用 Community ID。

## 校验规则

运行：

```bash
pnpm series:index:review:check
```

Validator 会检查：

1. `(provider, externalId)` Review 唯一；
2. Review 必须引用存在的 Snapshot 和 Snapshot entry；
3. Review 的日文名、Maker、Source URL 必须与 Snapshot 一致；
4. `publish` 必须指向存在的正式 Series；
5. 正式 Series 的日文名、Maker、officialWebsite、externalIds 必须与 Review 一致；
6. 必须存在指向同一 Community ID 的 approved External ID Mapping；
7. `hold/reject` 不允许提前分配 Community ID。

## 0.4.5 Batch A

本批次把 0.4.4 的 19 个 `candidate-new` 逐项打开官方 Series 详情页复核后全部批准发布。

- ATTACKERS：9 个；
- Madonna：10 个；
- hold：0；
- reject：0。

这只表示**当前 partial Snapshot 中的候选已清空**，不代表 ATTACKERS 或 Madonna 的完整 Series Index 已覆盖。两者的 `series.completeTraversal` 仍必须保持 `false`。


## 0.4.6 Batch B

第二批新增 26 个 Review 决策：25 个 publish、1 个 hold。`attackers.series:2273` 的官方规范名仅为全角“１”，因此即使来源是官方页面，也不直接固化为永久 Community ID。该案例明确证明 Review 的职责不只是确认来源真假，还要阻止明显异常元数据直接进入正式 Registry。
