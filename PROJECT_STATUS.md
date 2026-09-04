# Project Status

## 当前版本

`0.4.5 — Series Candidate Review / Promotion Batch A`

基线：0.4.4

## 已完成

1. 新增 Series Candidate Review Ledger、Schema、Validator 与 CSV/XLSX 人工审核视图。
2. 冻结 `publish / hold / reject` 三种人工审核决策。
3. 将 0.4.4 的 19 个 `candidate-new` 逐项打开官方 Series 详情页复核。
4. ATTACKERS 9 个候选全部批准发布，Madonna 10 个候选全部批准发布。
5. 新增 `series_000018` 至 `series_000036`，全部带独立 Source Record 与 approved Provider Mapping。
6. Snapshot Diff 现在 20/20 都是 `published`，候选归零，但 Snapshot 仍保持 partial。
7. 新增 3 条 Review 回归测试，防止 Review 绕过 Snapshot 或提前占用 Community ID。
8. 不新增 Organization、Work、Genre，不修改 Localogue 主程序。

## 当前正式统计

- People: 13
- Works: 5
- Organizations: 86（Maker 5 / Label 81）
- Series: 36
- Genres: 325
- Registry Active: 465
- Registry Redirect: 0
- Merge Plans: 0
- Public Sources: 6
- External ID Mappings: 117
- Organization Candidates: 1

## Series Review / Snapshot 统计

- Series Index Providers: 2
- Series Index Snapshots: 2
- Snapshot Entries: 20
- Series Candidate Reviews: 19（publish 19 / hold 0 / reject 0）
- Latest Snapshot published exact matches: 20
- New Series candidates: 0
- Name drift: 0
- Missing from complete snapshot: 0
- Conflicts: 0

## 当前 Series Coverage

| Source | Discovered | Reviewed | Published | Unrecognized | Traversal |
| --- | ---: | ---: | ---: | ---: | --- |
| S1 official | 3 | 3 | 3 | 0 | incomplete |
| ATTACKERS official | 17 | 17 | 17 | 0 | incomplete |
| Madonna official | 13 | 13 | 13 | 0 | incomplete |
| MOODYZ official | 1 | 1 | 1 | 0 | incomplete |
| IDEAPOCKET official | 2 | 2 | 2 | 0 | incomplete |

ATTACKERS / Madonna 的候选归零只表示**当前 partial Snapshot 已全部审核发布**，不表示完整 Series Index 已覆盖。

## 下一阶段

### 0.4.x：扩大 Series Snapshot + Review Batch B

1. 继续从 ATTACKERS / Madonna 官方 Series Index 扩大 Snapshot，每批新增可控数量的候选。
2. Snapshot 与 Review Ledger 继续分离；候选先审核，再发布正式 ID。
3. 在可直连官网的真实仓库环境尝试完整抓取 Index HTML；只有确认全部条目时才创建 `--complete` Snapshot。
4. 将相同机制扩展到 MOODYZ、IDEAPOCKET、S1。
5. 遇到 name drift / same-name candidate / missing-from-complete-index 时单独人工处理，不自动改名、合并或删除。
