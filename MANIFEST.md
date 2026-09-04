# Localogue Community Data Manifest

当前 Pack 版本：**0.4.7**

基线版本：`0.4.6 — Series Candidate Review / Promotion Batch B`

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 本阶段不扩量 |
| Works | 5 | 延续 Pilot A |
| Organizations | 86 | 5 Maker + 81 Label，本阶段不新增 Organization |
| Series | 100 | 0.4.7 新增 39 个经 Batch C Review 批准的官方 Series |
| Genres | 325 | 延续核心受控词表 |
| Registry Active | 529 | 0.4.7 新增 39 个 Series ID |
| Registry Redirect | 0 | 本阶段无 Merge |
| Merge Plans | 0 | 本阶段无 Merge |
| Public Sources | 6 | 来源集合不变 |
| External ID Mappings | 181 | 0.4.7 新增 39 条 approved Series Mapping |

## Organization 组成

- Group：0
- Company：0（株式会社WILL 仍为 Staging Candidate）
- Maker：5
- Label：81

## 0.4.7 Series Review Batch C

本批次继续验证已经建立的流水线可以稳定重复运行：

`官方 Index → partial Snapshot → Diff → 官方详情页 Review → Promotion → approved Mapping`

### ATTACKERS

- 新增第三份 partial Snapshot：20 条；
- 其中 `attackers.series:2293` 已经是正式 Series，作为 approved External ID 精确命中；
- 其余 19 条经官方 Series 详情页逐项复核后正式发布；
- 累计 Series coverage：discovered 53 / reviewed 53 / published 52 / unrecognized 1；
- 唯一未发布条目仍是 `attackers.series:2273`，Review 决策保持 `hold`；
- `series.completeTraversal=false`。

### Madonna

- 新增第三份 partial Snapshot：20 条；
- 20 条均经官方 Series 详情页逐项复核并正式发布；
- 累计 Series coverage：discovered 42 / reviewed 42 / published 42 / unrecognized 0；
- `series.completeTraversal=false`。

## Series Snapshot / Review 统计

- Series Index Providers：2
- Series Index Snapshots：6
- Snapshot Entries：99
- Series Candidate Reviews：84
  - publish：83
  - hold：1
  - reject：0
- 最新 Batch C Snapshot Diff：
  - published：40
  - candidate-new：0
  - candidate-existing-name：0
  - published-name-drift：0
  - missing-from-complete-index：0
  - conflict：0

注意：最新 Batch C 候选归零只表示**这两段 partial Snapshot 已完成审核**，不代表 ATTACKERS 或 Madonna 的完整 Series Index 已覆盖。

## 0.4.6 历史统计勘误

0.4.6 的正式事实数据始终是：

- Series：61
- Registry Active：490
- External ID Mappings：142
- Series Candidate Reviews：45（publish 44 / hold 1 / reject 0）
- `attackers.series:2273`：hold，未分配 Community ID

0.4.6 发布时部分 Markdown 文档残留了早期“计划发布 26 条、全部 publish”的草稿数字；0.4.7 统一修正文档口径。Registry、正式 Series、Mapping 和 Review Ledger 本身没有发生错误发布。

## 完整性边界

- ATTACKERS / Madonna 的 Maker 与当前公开 Label Index 覆盖保持此前状态；
- 当前 Series Snapshot 仍全部是 partial；
- partial Snapshot 不得用于声明完整 Series 覆盖；
- 候选归零不等于完整遍历；
- `hold` 不得因为后续 Snapshot 向前推进而自动发布、删除或改写；
- 已发布 ID 不因名称、本地化或官网当前展示状态而改变。

## 安全边界

- Review `publish` 必须与 Snapshot、正式 Series 和 approved Mapping 一致；
- `hold/reject` 不允许提前占用 Community ID；
- 官方详情页没有明确 Label 关系时不填写 `labelId`；
- 同名、模糊相似和 AI 推测不得自动创建、映射或合并实体；
- 不新增大量 Work；
- 不提交图片、Community Asset 或用户私人状态；
- 不修改 Localogue 主程序。
