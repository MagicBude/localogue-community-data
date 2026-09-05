# Localogue Community Data Manifest

当前 Pack 版本：**0.4.10**

基线版本：`0.4.9 — Five-provider Coverage Balance Batch`

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 本阶段不扩量 |
| Works | 5 | 延续 Pilot A |
| Organizations | 86 | 5 Maker + 81 Label，本阶段不新增 Organization |
| Series | 119 | 0.4.10 不新增正式 Series，先冻结 partial Snapshot 续采进度 |
| Genres | 325 | 延续核心受控词表 |
| Registry Active | 548 | 本阶段不新增正式实体 ID |
| Registry Redirect | 0 | 本阶段无 Merge |
| Merge Plans | 0 | 本阶段无 Merge |
| Public Sources | 6 | 来源集合不变 |
| External ID Mappings | 200 | 本阶段不新增 Mapping |

## Organization 组成

- Group：0
- Company：0（株式会社WILL 仍为 Staging Candidate）
- Maker：5
- Label：81

## 0.4.10 Series Coverage Checkpoint Foundation

随着 partial Snapshot 增加到 12 份，单纯保存“这一批看到什么”已经不足以支撑长期维护。本版本不再继续盲目加 Series，而是先为每份 Snapshot 冻结可审计的 `coverageWindow`，明确：

- 该快照是 `sample`、普通 `segment`、重叠扩展 `expansion`，还是 `complete-index`；
- 当前窗口第一/最后 External ID；
- 排序依据来自样本顺序、人工审核顺序还是 HTML 解析顺序；
- partial segment 的 resume anchor；
- 它与哪一份历史 Snapshot 构成 continuation 链。

`resumeAfterExternalId` 只表示“下一批从这个已审核官方详情锚点之后继续”，不允许据此假设 External ID 数值连续，也不证明锚点之间没有未发现 Series。

## 当前 Resume Checkpoint

| Provider | Latest Window | Resume anchor | Chain Depth | Complete |
| --- | --- | ---: | ---: | --- |
| ATTACKERS | 2287 → 2312 | 2312 | 3 | no |
| Madonna | 1565 → 1595 | 1595 | 3 | no |
| MOODYZ | 3563 → 3567 | 3567 | 2 | no |
| IDEAPOCKET | 940 → 944 | 944 | 2 | no |
| S1 | 571 → 575 | 575 | 2 | no |

运行：

```bash
pnpm series:index:progress
```

生成 `series-index-progress.json/csv`，以后无需翻历史提交或聊天记录就能知道每个 Provider 当前从哪里继续审核。

## Series Snapshot / Review 统计

- Series Index Providers：5
- Series Index Snapshots：12
- Snapshot Entries：124
- Series Candidate Reviews：103
  - publish：102
  - hold：1
  - reject：0
- Series Index Progress Providers：5
- Resume Checkpoints：5
- Complete Series Providers：0
- 最新五个 Provider Snapshot Diff：published 55 / candidate 0 / drift 0 / missing 0 / conflict 0
- 历史 `attackers.series:2273` 继续 hold，不分配 Community ID。

## 当前 Series Coverage

| Source | Discovered | Reviewed | Published | Unrecognized | Traversal |
| --- | ---: | ---: | ---: | ---: | --- |
| S1 official | 8 | 8 | 8 | 0 | incomplete |
| ATTACKERS official | 53 | 53 | 52 | 1 | incomplete |
| Madonna official | 42 | 42 | 42 | 0 | incomplete |
| MOODYZ official | 9 | 9 | 9 | 0 | incomplete |
| IDEAPOCKET official | 8 | 8 | 8 | 0 | incomplete |

## 完整性边界

- Coverage Checkpoint 只解决“下一批从哪里继续”，不提高任何 Provider 的完整性等级。
- `resumeAfterExternalId=3567` 不代表下一个 MOODYZ Series 一定是 `3568`。
- `sample` Snapshot 不提供 resume anchor，不把早期 Pilot 样本包装成连续索引区间。
- `complete-index` 仍然只能在实际完整遍历官方公开 Series Index 后使用。
- MOODYZ / IDEAPOCKET 的 Label coverage 已完成，但 Series coverage 仍为 incomplete。
- partial Snapshot 当前候选归零只表示最新批次全部处理完成，不等于 Provider Series 全覆盖。
- 已发布 ID、历史 Review 与 hold 不因后续 Snapshot 或 checkpoint 变化而自动删除、合并或重写。

## 校验变化

Snapshot Validator 新增：

- `coverageWindow` 必填；
- Window 起止 ID 必须与第一/最后 Entry 一致；
- `segment/expansion` 的 resume anchor 必须等于当前窗口末尾锚点；
- `sample` 与 `complete-index` 不允许伪造 resume anchor；
- continuation predecessor 必须存在、属于同一 Provider 且早于当前 Snapshot；
- continuation 链不得形成循环；
- `completeTraversal` 与 `complete-index` 必须一致。

新增 2 条 Progress / Checkpoint 回归测试后，当前相关完整测试为 **19/19**。

## 安全边界

- Checkpoint、Snapshot、Diff 都不能直接发布正式 Series。
- External ID 不假设连续，不执行 `anchor + 1` 自动创建。
- publish Review 仍必须与 Snapshot、正式 Series 和 approved Mapping 三方一致。
- hold/reject 不占用 Community ID。
- 同名 Series 不跨 Maker 自动合并。
- 不新增大量 Work。
- 不提交图片、Community Asset 或用户私人状态。
- 不修改 Localogue 主程序。
