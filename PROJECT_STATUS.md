# Project Status

## 当前版本

`0.4.9 — Five-provider Coverage Balance Batch`

基线：0.4.8

## 已完成

1. 保持 5 个 Series Index Provider 统一工作流，不新增新的 Provider 类型。
2. MOODYZ 建立第二份 5 条 partial Snapshot，并新增发布 5 个官方 Series。
3. IDEAPOCKET 建立第二份 5 条 partial Snapshot，并新增发布 5 个官方 Series。
4. S1 建立第二份 5 条 partial Snapshot，并新增发布 5 个官方 Series。
5. 新增 `series_000105` 至 `series_000119`，全部具有 Source Record、publish Review、approved Mapping 与 Provider Observation。
6. 最新 5 Provider Snapshot Diff 为 55 published、0 candidate、0 drift、0 missing、0 conflict。
7. `attackers.series:2273` 继续保持 hold，不受本批次影响。
8. 不新增 Organization、Work、Genre，不修改 Localogue 主程序。

## 当前正式统计

- People: 13
- Works: 5
- Organizations: 86（Maker 5 / Label 81）
- Series: 119
- Genres: 325
- Registry Active: 548
- Registry Redirect: 0
- Merge Plans: 0
- Public Sources: 6
- External ID Mappings: 200
- Organization Candidates: 1

## Series Review / Snapshot 统计

- Series Index Providers: 5
- Series Index Snapshots: 12
- Snapshot Entries: 124
- Series Candidate Reviews: 103（publish 102 / hold 1 / reject 0）
- Latest Snapshot published exact matches: 55
- New Series candidates: 0
- Name drift: 0
- Missing from complete snapshot: 0
- Conflicts: 0

## 当前 Series Coverage

| Source | Discovered | Reviewed | Published | Unrecognized | Traversal |
| --- | ---: | ---: | ---: | ---: | --- |
| S1 official | 8 | 8 | 8 | 0 | incomplete |
| ATTACKERS official | 53 | 53 | 52 | 1 | incomplete |
| Madonna official | 42 | 42 | 42 | 0 | incomplete |
| MOODYZ official | 9 | 9 | 9 | 0 | incomplete |
| IDEAPOCKET official | 8 | 8 | 8 | 0 | incomplete |

## 下一阶段

### 0.4.x：Five-provider Series Snapshot Batch

1. 继续优先扩大 MOODYZ / IDEAPOCKET / S1 的连续 partial Snapshot，使三家与 ATTACKERS / Madonna 的差距进一步缩小。
2. 每批仍必须先 Snapshot / Diff，再逐项官方详情页 Review，最后才 Promotion。
3. 当某一家已经能稳定完整解析官方 Series Index 时，才开始制作第一份 `complete` Snapshot 并验证 missing-from-complete 行为。
4. `attackers.series:2273` 继续 hold，直到取得额外可靠证据。
5. 暂不扩大量 Work；先把有限、高复用的 Maker / Label / Series 基础做厚。
