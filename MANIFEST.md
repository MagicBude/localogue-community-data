# Localogue Community Data Manifest

当前 Pack 版本：**0.4.9**

基线版本：`0.4.8 — Cross-provider Series Index Rollout`

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 本阶段不扩量 |
| Works | 5 | 延续 Pilot A |
| Organizations | 86 | 5 Maker + 81 Label，本阶段不新增 Organization |
| Series | 119 | 0.4.9 为 MOODYZ / IDEAPOCKET / S1 各新增 5 个 |
| Genres | 325 | 延续核心受控词表 |
| Registry Active | 548 | 新增 15 个 Series ID |
| Registry Redirect | 0 | 本阶段无 Merge |
| Merge Plans | 0 | 本阶段无 Merge |
| Public Sources | 6 | 来源集合不变 |
| External ID Mappings | 200 | 新增 15 条 approved Series Mapping |

## Organization 组成

- Group：0
- Company：0（株式会社WILL 仍为 Staging Candidate）
- Maker：5
- Label：81

## 0.4.9 Five-provider Coverage Balance Batch

本批次不继续扩 ATTACKERS / Madonna，而是优先缩小 MOODYZ、IDEAPOCKET、S1 与前两家的 Series 覆盖差距。

### 新增 partial Snapshot

- MOODYZ：第二份 partial Snapshot，5 条官方 Series，全部人工复核并发布。
- IDEAPOCKET：第二份 partial Snapshot，5 条官方 Series，全部人工复核并发布。
- S1：第二份 partial Snapshot，5 条官方 Series，全部人工复核并发布。

三份 Snapshot 均保持 `completeTraversal=false`。`position` 只表示本批次审核顺序，不代表官网完整 Series Index 的绝对排序。

### 新增正式 Series

- MOODYZ：`series_000105` 至 `series_000109`
- IDEAPOCKET：`series_000110` 至 `series_000114`
- S1：`series_000115` 至 `series_000119`

全部条目均以官方 Series 详情页的稳定外部 ID、日文规范名和 Maker 归属作为发布依据；官网没有明确 Label 关系时继续不填写 `labelId`。

## Series Snapshot / Review 统计

- Series Index Providers：5
- Series Index Snapshots：12
- Snapshot Entries：124
- Series Candidate Reviews：103
  - publish：102
  - hold：1
  - reject：0
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

- MOODYZ / IDEAPOCKET 的 Label coverage 已完成，但 Series coverage 仍只是两批 partial Snapshot；来源级 `completeTraversal=false`。
- S1 已累计两批 partial Snapshot，但仍不能证明完整 Series Index 已遍历。
- partial Snapshot 候选归零只表示当前批次全部处理完成，不等于 Provider Series 全覆盖。
- 已发布 ID、历史 Review 与 hold 不因后续 Snapshot 变化而自动删除、合并或重写。
- 官方详情页没有明确 Label 归属时，不根据标题、番号、常见套路或 AI 推测填写 `labelId`。

## 安全边界

- Snapshot 只负责发现和审计，不能直接发布正式 Series。
- publish Review 必须与 Snapshot、正式 Series 和 approved Mapping 三方一致。
- hold/reject 不占用 Community ID。
- 同名 Series 不跨 Maker 自动合并。
- 不新增大量 Work。
- 不提交图片、Community Asset 或用户私人状态。
- 不修改 Localogue 主程序。
