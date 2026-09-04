# Project Status

## 当前版本

`0.4.7 — Series Candidate Review / Promotion Batch C`

基线：0.4.6

## 已完成

1. 继续使用 Series Index Snapshot / Diff / Review / Promotion 流水线，不引入新的自动合并捷径。
2. ATTACKERS 新增第三份 partial Snapshot，共 20 个官方 Series Index 条目。
3. Madonna 新增第三份 partial Snapshot，共 20 个官方 Series Index 条目。
4. ATTACKERS 本批次新增审核并发布 19 个 Series；`attackers.series:2293` 为既有正式 Mapping 精确命中。
5. Madonna 本批次新增审核并发布 20 个 Series。
6. 新增 `series_000062` 至 `series_000100`，全部带正式 Source Record、publish Review 与 approved External ID Mapping。
7. `attackers.series:2273` 继续保持 hold，不分配 Community ID，不创建 Mapping。
8. 最新 Batch C Snapshot Diff 为 40 published、0 candidate、0 drift、0 missing、0 conflict。
9. 不新增 Organization、Work、Genre，不修改 Localogue 主程序。
10. 修正 0.4.6 Markdown 文档中的历史草稿统计；事实数据和 Registry 本身无需回滚或迁移。

## 当前正式统计

- People: 13
- Works: 5
- Organizations: 86（Maker 5 / Label 81）
- Series: 100
- Genres: 325
- Registry Active: 529
- Registry Redirect: 0
- Merge Plans: 0
- Public Sources: 6
- External ID Mappings: 181
- Organization Candidates: 1

## Series Review / Snapshot 统计

- Series Index Providers: 2
- Series Index Snapshots: 6
- Snapshot Entries: 99
- Series Candidate Reviews: 84（publish 83 / hold 1 / reject 0）
- Latest Snapshot published exact matches: 40
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
| MOODYZ official | 1 | 1 | 1 | 0 | incomplete |
| IDEAPOCKET official | 2 | 2 | 2 | 0 | incomplete |

ATTACKERS 的 1 个 unrecognized 是已经人工 Review 为 `hold` 的 `attackers.series:2273`。它不是“尚未看过”的未知候选，也不会因为最新 partial Snapshot 不再包含它就自动改变审核决定。

## 0.4.6 文档勘误

0.4.6 的实际仓库事实是 Series 61、Registry Active 490、External ID Mapping 142、Review 45（publish 44 / hold 1）。上一版部分 Markdown 残留了早期计划值 62 / 491 / 143 和 hold=0。0.4.7 已统一修正文档；正式数据、Review Ledger 与 Registry 无需修复。

## 下一阶段

### 0.4.x：Series Snapshot / Review Batch D

1. 继续按 ATTACKERS / Madonna 官方 Series Index 顺序向后扩展 partial Snapshot。
2. 保留 `attackers.series:2273` hold，直到出现额外可靠交叉证据再重新审核。
3. 当连续批次覆盖足够大时，优先尝试由 `series:index:snapshot` 直接抓取完整 Index；只有实际完整解析、去重并核验数量后才使用 `--complete`。
4. 将 Snapshot/Review 机制逐步扩展到 MOODYZ、IDEAPOCKET、S1。
5. 遇到 name drift、same-name candidate、missing-from-complete-index 时独立人工处理，禁止自动改名、合并或删除。
