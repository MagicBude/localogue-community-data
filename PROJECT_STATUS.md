# Project Status

## 当前版本

`0.4.8 — Cross-provider Series Index Rollout`

基线：0.4.7

## 已完成

1. Series Index Provider Registry 从 ATTACKERS / Madonna 扩展到 MOODYZ、IDEAPOCKET、S1，共 5 个 Provider。
2. 修复同一 Provider 同一天重复运行 `series:index:snapshot` 会覆盖旧快照的问题；默认自动分配三位批次序号。
3. 新增快照历史保留回归测试，验证连续两次采集生成 `partial-001` 与 `partial-002`。
4. MOODYZ 建立首份 4 条 partial Snapshot，并新增发布 3 个官方 Series。
5. IDEAPOCKET 建立首份 3 条 partial Snapshot，并新增发布 1 个官方 Series。
6. S1 建立首份 3 条 partial Snapshot，仅验证既有 approved Mapping，不为了数量创建新正式实体。
7. 新增 `series_000101` 至 `series_000104`，全部具有 Source Record、publish Review、approved Mapping 与 Provider Observation。
8. 最新 5 Provider Snapshot Diff 为 50 published、0 candidate、0 drift、0 missing、0 conflict。
9. `attackers.series:2273` 继续保持 hold。
10. 不新增 Organization、Work、Genre，不修改 Localogue 主程序。

## 当前正式统计

- People: 13
- Works: 5
- Organizations: 86（Maker 5 / Label 81）
- Series: 104
- Genres: 325
- Registry Active: 533
- Registry Redirect: 0
- Merge Plans: 0
- Public Sources: 6
- External ID Mappings: 185
- Organization Candidates: 1

## Series Review / Snapshot 统计

- Series Index Providers: 5
- Series Index Snapshots: 9
- Snapshot Entries: 109
- Series Candidate Reviews: 88（publish 87 / hold 1 / reject 0）
- Latest Snapshot published exact matches: 50
- New Series candidates: 0
- Name drift: 0
- Missing from complete snapshot: 0
- Conflicts: 0

## 当前 Series Coverage

| Source | Discovered | Reviewed | Published | Unrecognized | Traversal |
| --- | ---: | ---: | ---: | ---: | --- |
| S1 official | 3 | 3 | 3 | 0 | incomplete |
| ATTACKERS official | 53 | 53 | 52 | 1 | incomplete |
| Madonna official | 42 | 42 | 42 | 0 | incomplete |
| MOODYZ official | 4 | 4 | 4 | 0 | incomplete |
| IDEAPOCKET official | 3 | 3 | 3 | 0 | incomplete |

## 下一阶段

### 0.4.x：Five-provider Series Snapshot Batch

1. 使用修正后的 `series:index:snapshot` 在真实网络环境中继续抓取五个 Provider 的 Series Index，并保留每批历史快照。
2. 优先让 MOODYZ / IDEAPOCKET / S1 的 Snapshot 从“少量验证样本”扩展为连续可审计批次，避免数据长期集中于 ATTACKERS / Madonna。
3. ATTACKERS / Madonna 继续沿既有索引推进，但不为了数量跳过 Review。
4. `attackers.series:2273` 继续 hold，直到取得额外可靠证据。
5. 只有实际完整解析并核验某个 Provider 当前官方 Series Index 后，才允许生成 complete Snapshot 并更新 coverage.completeTraversal。
