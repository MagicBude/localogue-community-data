# Localogue Community Data Manifest

当前 Pack 版本：**0.4.8**

基线版本：`0.4.7 — Series Candidate Review / Promotion Batch C`

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 本阶段不扩量 |
| Works | 5 | 延续 Pilot A |
| Organizations | 86 | 5 Maker + 81 Label，本阶段不新增 Organization |
| Series | 104 | 0.4.8 新增 MOODYZ 3 个、IDEAPOCKET 1 个 |
| Genres | 325 | 延续核心受控词表 |
| Registry Active | 533 | 新增 4 个 Series ID |
| Registry Redirect | 0 | 本阶段无 Merge |
| Merge Plans | 0 | 本阶段无 Merge |
| Public Sources | 6 | 来源集合不变 |
| External ID Mappings | 185 | 新增 4 条 approved Series Mapping |

## Organization 组成

- Group：0
- Company：0（株式会社WILL 仍为 Staging Candidate）
- Maker：5
- Label：81

## 0.4.8 Cross-provider Series Index Rollout

本批次把 0.4.4–0.4.7 已验证的 Snapshot / Diff / Review / Promotion 流程从 ATTACKERS / Madonna 扩展到全部 5 个当前正式 Maker：

- ATTACKERS
- Madonna
- MOODYZ
- IDEAPOCKET
- S1 NO.1 STYLE

### 快照历史保护

`series:index:snapshot` 现在会为同一 Provider、同一日期和同一模式自动分配 `-001 / -002 / ...` 序号，不再覆盖当天早先采集的 Snapshot。历史快照继续全部保存在 `staging/series-index-snapshots/`。

### 新 Provider Snapshot

- MOODYZ：4 条 partial Snapshot；4/4 已审核发布，其中 3 条为本版本新 Series。
- IDEAPOCKET：3 条 partial Snapshot；3/3 已审核发布，其中 1 条为本版本新 Series。
- S1：3 条 partial Snapshot；全部为既有 approved Mapping 精确命中，本版本不新增 S1 Series。

这些 Snapshot 都是**工作流验证用 partial snapshot**，不能解释为对应 Maker 的完整 Series Index 已遍历。

## Series Snapshot / Review 统计

- Series Index Providers：5
- Series Index Snapshots：9
- Snapshot Entries：109
- Series Candidate Reviews：88
  - publish：87
  - hold：1
  - reject：0
- 最新五个 Provider Snapshot Diff：published 50 / candidate 0 / drift 0 / missing 0 / conflict 0
- 历史 `attackers.series:2273` 继续 hold，不分配 Community ID。

## 当前 Series Coverage

| Source | Discovered | Reviewed | Published | Unrecognized | Traversal |
| --- | ---: | ---: | ---: | ---: | --- |
| S1 official | 3 | 3 | 3 | 0 | incomplete |
| ATTACKERS official | 53 | 53 | 52 | 1 | incomplete |
| Madonna official | 42 | 42 | 42 | 0 | incomplete |
| MOODYZ official | 4 | 4 | 4 | 0 | incomplete |
| IDEAPOCKET official | 3 | 3 | 3 | 0 | incomplete |

## 完整性边界

- MOODYZ / IDEAPOCKET 的 Label coverage 已完成，但 Series coverage 仍为 partial；来源级 completeTraversal 继续为 false。
- S1 已正式接入 Series Index Provider，但当前快照仍不足以证明完整枚举。
- partial Snapshot 候选归零不等于完整遍历。
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
