# Project Status

## 当前版本

`0.4.6 — Series Candidate Review / Promotion Batch B`

基线：0.4.5

## 已完成

1. ATTACKERS 新增第二份 partial Series Snapshot，共 20 个连续官方索引条目。
2. Madonna 新增第二份 partial Series Snapshot，共 19 个连续官方索引条目。
3. 官方详情页逐项复核后，ATTACKERS 新增发布 16 个 Series，Madonna 新增发布 9 个 Series。
4. ATTACKERS `series/2273` 因官方名称仅为“１”进入 hold，不占 Community ID。
5. 新增 `series_000037` 至 `series_000061`，全部带 Source Record、Review 与 approved Mapping。
6. 最新 Batch B Diff：38 published、1 candidate-new、0 drift、0 missing、0 conflict。
7. 不新增 Organization、Work、Genre，不修改 Localogue 主程序。

## 当前正式统计

- People: 13
- Works: 5
- Organizations: 86（Maker 5 / Label 81）
- Series: 61
- Genres: 325
- Registry Active: 490
- Registry Redirect: 0
- Merge Plans: 0
- Public Sources: 6
- External ID Mappings: 142
- Organization Candidates: 1

## Series Review / Snapshot 统计

- Series Index Providers: 2
- Series Index Snapshots: 4
- Snapshot Entries: 59
- Series Candidate Reviews: 45（publish 44 / hold 1 / reject 0）
- Latest Snapshot published exact matches: 38
- New Series candidates: 1（已 hold）
- Name drift: 0
- Missing from complete snapshot: 0
- Conflicts: 0

## 当前 Series Coverage

| Source | Discovered | Reviewed | Published | Unrecognized/Hold | Traversal |
| --- | ---: | ---: | ---: | ---: | --- |
| S1 official | 3 | 3 | 3 | 0 | incomplete |
| ATTACKERS official | 34 | 34 | 33 | 1 | incomplete |
| Madonna official | 22 | 22 | 22 | 0 | incomplete |
| MOODYZ official | 1 | 1 | 1 | 0 | incomplete |
| IDEAPOCKET official | 2 | 2 | 2 | 0 | incomplete |

## 下一阶段

1. 继续按官方 Series Index 顺序扩展 Batch C，而不是随机搜索。
2. 为 hold 的 `attackers.series:2273` 寻找额外交叉证据；在证据不足时保持 hold。
3. 在真实可直连环境尝试自动抓完整 Index；只有完整解析并核对计数后才创建 `--complete` Snapshot。
4. 将 Snapshot/Review 机制扩展到 MOODYZ、IDEAPOCKET、S1。
