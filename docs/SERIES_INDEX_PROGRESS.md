# Series Index Coverage Checkpoint / Progress Report

> 适用版本：0.4.10+

Series Index Snapshot 解决的是“这一批看到了什么”，但当 partial Snapshot 累积到十几批甚至几十批以后，还需要回答另一个问题：

> **下一批应该从哪里继续审核？**

如果这个答案只存在于提交说明、聊天记录或维护者记忆里，那么 Snapshot 虽然保留了历史，却仍然无法形成可持续采集流程。

0.4.10 因此给 Snapshot 增加 `coverageWindow`，并新增 `series:index:progress` 报告。它们只管理“采集进度与审计边界”，不会改变任何正式 Series 身份规则。

---

## 1. coverageWindow 的语义

每份 Snapshot 现在必须包含：

```json
{
  "coverageWindow": {
    "kind": "segment",
    "orderBasis": "manual-review-order",
    "startExternalId": "3563",
    "endExternalId": "3567",
    "resumeAfterExternalId": "3567",
    "continuesFromSnapshotId": "moodyz-series-2026-09-04-partial-001"
  }
}
```

### kind

支持四种值：

- `sample`：只是样本集合，不声明它构成一个可继续向后的索引段；因此没有 resume anchor。
- `segment`：一个有明确起点和终点的审核段；下一批可以从该段末尾锚点之后继续寻找。
- `expansion`：与上一批存在重叠，但向前或向后扩大了已审核范围。
- `complete-index`：操作者确认当前公开 Series Index 已完整遍历；必须同时有 `completeTraversal=true`。

### orderBasis

- `sample-order`：只是样本排列。
- `manual-review-order`：维护者按当前批次的人工审核顺序记录。
- `parsed-index-order`：由 Snapshot Parser 按官方 HTML 中解析到的链接顺序写入。

**orderBasis 不是 Community ID 顺序，也不是 External ID 数值顺序。**

### startExternalId / endExternalId

必须分别等于当前 Snapshot 第一条和最后一条 Entry 的 External ID。

它们描述的是“当前快照窗口”，不是在声明两个数值之间所有 ID 都存在。

### resumeAfterExternalId

这是 partial segment 的**继续审核锚点**。

例如：

```text
MOODYZ latest segment: 3563 → 3567
resumeAfterExternalId: 3567
```

它的含义是：

> 下一次审核时，先在官方 Series Index 中找到 `3567` 这个已审核详情锚点，再从它之后继续。

它**绝不等于**：

> 下一个 Series 一定是 `3568`。

External ID 可能跳号、重用规则可能变化，官方索引也可能重排。因此仓库禁止根据 resume anchor 做 `+1` 自动创建 Series。

### continuesFromSnapshotId

用于建立历史采集链。例如：

```text
partial-001 → partial-002 → partial-003
```

Validator 会检查：

- predecessor 必须存在；
- 必须属于同一个 Provider；
- 必须早于当前 Snapshot；
- continuation 链不得形成循环。

---

## 2. 为什么 Sample 不提供 Resume Anchor

0.4.8 的 MOODYZ / IDEAPOCKET / S1 首份 Snapshot 本质上是“工作流验证样本”，例如：

```text
MOODYZ sample:
5427
3489
3519
3562
```

这些 ID 并不是一个已经证明连续的官方索引区间。

因此 0.4.10 将这种 Snapshot 标为：

```text
kind = sample
resumeAfterExternalId = null
```

后续真正的连续审核段再使用 `segment`。

这样不会把早期 Pilot 数据包装成比实际证据更强的覆盖声明。

---

## 3. Progress Report

运行：

```bash
pnpm series:index:progress
```

生成：

```text
exports/reports/series-index-progress.json
exports/csv/series-index-progress.csv
```

报告按 Provider 汇总：

- Snapshot 总数；
- Snapshot Entry 总数；
- 历史 Snapshot 中出现过的唯一 External ID 数；
- approved Mapping 数；
- publish / hold / reject Review 数；
- 最新 Snapshot；
- 最新 coverage window；
- continuation chain depth；
- resume checkpoint；
- Public Source Registry 当前 Series coverage。

这份报告的目标是让维护者不需要翻历史提交，就能直接看到“下一批从哪里继续”。

---

## 4. 当前 0.4.10 Resume Checkpoint

0.4.10 没有新增正式 Series，而是先把现有 12 份 Snapshot 的历史窗口补齐。

当前五个 Provider 的 latest checkpoint 为：

| Provider | Latest Snapshot | Window | Resume anchor | 完整 |
| --- | --- | --- | --- | --- |
| ATTACKERS | partial-003 | 2287 → 2312 | 2312 | 否 |
| Madonna | partial-003 | 1565 → 1595 | 1595 | 否 |
| MOODYZ | partial-002 | 3563 → 3567 | 3567 | 否 |
| IDEAPOCKET | partial-002 | 940 → 944 | 944 | 否 |
| S1 | partial-002 | 571 → 575 | 575 | 否 |

这些 anchor 只是“已审核到这里”的稳定详情页锚点，并不证明 `anchor + 1` 一定存在。

---

## 5. 新 Snapshot 的自动行为

从 0.4.10 起，通过：

```bash
pnpm series:index:snapshot -- <provider>
```

生成的 Snapshot 会自动写入：

- `coverageWindow.kind=segment`；
- `orderBasis=parsed-index-order`；
- 第一/最后 External ID；
- partial Snapshot 的 resume anchor；
- 同 Provider 最新历史 Snapshot 作为 `continuesFromSnapshotId`。

如果使用 `--complete`：

- `coverageWindow.kind=complete-index`；
- `resumeAfterExternalId=null`；
- 仍然不会自动新增、删除、Merge 或 Redirect 正式 Series。

---

## 6. 继续采集的标准流程

推荐流程：

```text
series:index:progress
        ↓
找到 Provider 的 resume anchor
        ↓
从官方索引中的该锚点之后继续
        ↓
series:index:snapshot
        ↓
series:index:diff
        ↓
人工 Review
        ↓
Promotion
        ↓
series:index:progress
```

其中最重要的治理边界不变：

1. Checkpoint 只告诉维护者“从哪里继续看”，不创造实体。
2. External ID 不假设连续。
3. partial Snapshot 不证明完整覆盖。
4. Sample 不伪装成连续区间。
5. `hold` 不会因为进度向后推进而自动消失。
6. `complete-index` 仍然需要真实完整遍历证据。
