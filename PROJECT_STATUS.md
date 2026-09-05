# Project Status

## 当前版本

`0.4.10 — Series Coverage Checkpoint Foundation`

基线：0.4.9

## 已完成

1. 保持当前 5 个 Series Index Provider 和 119 个正式 Series，不为了版本数字继续盲目扩量。
2. 为现有 12 份 Series Index Snapshot 全部补充 `coverageWindow`。
3. 明确区分 `sample / segment / expansion / complete-index` 四种 Snapshot 覆盖窗口。
4. 为五个 Provider 建立可审计 resume anchor：ATTACKERS 2312、Madonna 1595、MOODYZ 3567、IDEAPOCKET 944、S1 575。
5. resume anchor 仅代表已审核官方详情锚点，不推断下一个 External ID，也不声明 External ID 连续。
6. 新增 `pnpm series:index:progress`，输出 JSON / CSV Progress Report。
7. 新生成 Snapshot 自动写 coverage window，并自动连接同 Provider 上一份历史 Snapshot。
8. Snapshot Validator 新增 predecessor、循环链、起止 ID、resume anchor 与 complete-index 一致性校验。
9. Series Index Snapshot CSV / XLSX 增加 Window、Start/End、Resume、Predecessor 信息；XLSX 新增 Series Index Progress 工作表。
10. 新增 2 条 Coverage Checkpoint 回归测试，当前完整脚本测试为 19/19。
11. `attackers.series:2273` 继续保持 hold，不受进度锚点影响。
12. 不新增 Organization、Series、Work、Genre，不修改 Localogue 主程序。

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
- Series Index Progress Providers: 5
- Resume Checkpoints: 5
- Complete Series Providers: 0
- Latest Snapshot published exact matches: 55
- New Series candidates: 0
- Name drift: 0
- Missing from complete snapshot: 0
- Conflicts: 0

## 当前 Resume Checkpoint

| Provider | Latest Snapshot | Window | Resume after | 说明 |
| --- | --- | --- | ---: | --- |
| ATTACKERS | partial-003 | 2287 → 2312 | 2312 | 后续从官方索引中的 2312 锚点之后继续 |
| Madonna | partial-003 | 1565 → 1595 | 1595 | 后续从 1595 锚点之后继续 |
| MOODYZ | partial-002 | 3563 → 3567 | 3567 | 后续从 3567 锚点之后继续 |
| IDEAPOCKET | partial-002 | 940 → 944 | 944 | 后续从 944 锚点之后继续 |
| S1 | partial-002 | 571 → 575 | 575 | 后续从 575 锚点之后继续 |

> Resume anchor 是导航提示，不是数值连续规则；禁止自动使用 `anchor + 1` 生成 Series。

## 当前 Series Coverage

| Source | Discovered | Reviewed | Published | Unrecognized | Traversal |
| --- | ---: | ---: | ---: | ---: | --- |
| S1 official | 8 | 8 | 8 | 0 | incomplete |
| ATTACKERS official | 53 | 53 | 52 | 1 | incomplete |
| Madonna official | 42 | 42 | 42 | 0 | incomplete |
| MOODYZ official | 9 | 9 | 9 | 0 | incomplete |
| IDEAPOCKET official | 8 | 8 | 8 | 0 | incomplete |

## 下一阶段

### 0.4.x：Resume-driven Series Snapshot Batch

1. 不再靠聊天记录记忆上一批终点，先运行 `pnpm series:index:progress` 获取当前 resume checkpoint。
2. 继续优先扩大 MOODYZ / IDEAPOCKET / S1：分别从 3567、944、575 这三个已审核官方详情锚点之后继续查找。
3. 每次仍然先 Snapshot / Diff，再逐项官方详情页 Review，最后才 Promotion。
4. External ID 只作为详情身份，不假设连续；如果官网索引跳号，应跟随官网实际顺序，不补不存在的数字。
5. 当某一家能够稳定完整解析全部当前官方 Series Index 时，才创建第一份 `complete-index` Snapshot。
6. `attackers.series:2273` 继续 hold，直到取得额外可靠证据。
7. 暂不扩大量 Work；继续优先建设有限、高复用的 Organization / Series 基础。
