# Project Status

## 当前版本

`0.4.4 — Series Index Snapshot / Enumerator Foundation`

基线：0.4.3

## 已完成

1. 保持 0.4.3 的正式数据不变：People 13、Works 5、Organizations 86、Series 17、Genres 325。
2. 新增 `registry/series-index-providers.json`，首批登记 ATTACKERS 与 Madonna 两个官方 Series Index Provider。
3. 新增 `pnpm series:index:snapshot -- <provider>`：从官方 `/works/series` HTML 中只提取 `/works/list/series/<id>`、日文名和详情 URL。
4. Snapshot 默认 partial；只有显式 `--complete` 且 Provider 声明单页索引时才允许标记完整遍历。
5. 新增 `staging/series-index-snapshots/`，保存发现层快照，不分配 Community ID。
6. 新增 `pnpm series:index:diff`，把最新 Snapshot 与 approved External ID Mapping 对账。
7. Diff 分类支持 published、published-name-drift、candidate-new、candidate-existing-name、missing-from-complete-index、conflict。
8. 完整快照缺失历史 approved ID 只进入审核报告，不自动删除或 Redirect。
9. 新增 Series Snapshot Validator、CSV/JSON 报告和 XLSX 人工审核工作表。
10. 第一批 partial snapshot：ATTACKERS 10 条、Madonna 10 条；共得到 1 条已发布精确命中与 19 条待审核新候选。
11. 不新增正式 Series，不新增 Mapping，不修改 Localogue 主程序。

## 当前正式统计

- People: 13
- Works: 5
- Organizations: 86（Maker 5 / Label 81）
- Series: 17
- Genres: 325
- Registry Active: 446
- Registry Redirect: 0
- Merge Plans: 0
- Public Sources: 6
- External ID Mappings: 98
- Organization Candidates: 1

## Series Index Staging 统计

- Series Index Providers: 2
- Series Index Snapshots: 2
- Snapshot Entries: 20
- Latest Snapshot published exact matches: 1
- New Series candidates: 19
- Name drift: 0
- Existing-name candidates: 0
- Missing from complete snapshot: 0
- Conflicts: 0

## 当前 Series Coverage

| Source | Discovered | Reviewed | Published | Unrecognized / Candidate | Traversal |
| --- | ---: | ---: | ---: | ---: | --- |
| S1 official | 3 | 3 | 3 | 0 | incomplete |
| ATTACKERS official | 17 | 8 | 8 | 9 | incomplete |
| Madonna official | 13 | 3 | 3 | 10 | incomplete |
| MOODYZ official | 1 | 1 | 1 | 0 | incomplete |
| IDEAPOCKET official | 2 | 2 | 2 | 0 | incomplete |

ATTACKERS / Madonna 的 discovered 现在包含“已发布 approved ID ∪ 最新 partial snapshot ID”。Snapshot 未完整遍历，所以 coverage.completeTraversal 继续保持 false。

## 下一阶段

### 0.4.x：完整 Series Index Snapshot + Candidate Review Batch

1. 在可直连官网的真实仓库环境运行 `pnpm series:index:snapshot -- attackers` 与 `-- madonna`，获取完整的当前官方索引 HTML 解析结果。
2. 人工确认索引结构、条目数量和是否确实单页完整后，再决定是否以 `--complete` 写入完整快照。
3. 运行 `pnpm series:index:diff`，按 Provider 分批审核 `candidate-new`；一次发布可控数量的 Series，不一次性把几百条未审核结果全塞进正式 Registry。
4. `published-name-drift`、`candidate-existing-name`、`missing-from-complete-index` 必须单独人工处理，禁止自动改名/合并/删除。
5. 后续把相同 Snapshot Provider Registry 模式扩展到 MOODYZ、IDEAPOCKET、S1（前提是官方 Series Index 能稳定解析）。
