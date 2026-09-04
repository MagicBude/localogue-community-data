# Localogue Community Data Manifest

当前 Pack 版本：**0.4.5**

基线版本：`0.4.4 — Series Index Snapshot / Enumerator Foundation`

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 本阶段不扩量 |
| Works | 5 | 延续 Pilot A |
| Organizations | 86 | 5 Maker + 81 Label，本阶段不新增 Organization |
| Series | 36 | 0.4.5 新增 19 个经 Review 批准的官方 Series |
| Genres | 325 | 延续核心受控词表 |
| Registry Active | 465 | 新增 19 个 Series ID |
| Registry Redirect | 0 | 本阶段无 Merge |
| Merge Plans | 0 | 本阶段无 Merge |

## 0.4.5 Review / Promotion

- Series Candidate Reviews：19；
- publish：19；hold：0；reject：0；
- ATTACKERS 新增正式 Series：9；
- Madonna 新增正式 Series：10；
- approved External ID Mapping：117；
- Provider Observation：117。

0.4.5 将流程冻结为：

`官方 Index → Snapshot → Diff Candidate → 官方详情页人工复核 → Review Ledger → 正式 Series + Source Record + approved Mapping`

Snapshot 仍然只是发现层；即使 candidate 已经全部发布，也不能把 partial Snapshot 错写成完整 Index Coverage。

## 最新 Snapshot Diff

当前两份 0.4.4 partial Snapshot 本身不变，共 20 条：

- ATTACKERS：10 条，全部已进入正式 Mapping；
- Madonna：10 条，全部已进入正式 Mapping；
- `published`：20；
- `candidate-new`：0；
- `candidate-existing-name`：0；
- `published-name-drift`：0；
- `missing-from-complete-index`：0；
- conflict：0。

## 完整性边界

ATTACKERS Series 当前联合发现 17、审核 17、发布 17；Madonna Series 当前联合发现 13、审核 13、发布 13。两者的最新 Snapshot 仍是 partial，所以 `series.completeTraversal=false`、来源级 `completeTraversal=false`。

## 安全边界

- Review `publish` 必须引用存在的 Snapshot entry；
- Review 的 Provider 外部 ID、日文名、Maker、Source URL 必须与 Snapshot 一致；
- `publish` 必须与正式 Series 和 approved Mapping 三方一致；
- `hold/reject` 不允许提前占用 Community ID；
- 不根据同名、模糊相似或 AI 推测自动发布；
- 不新增大量 Work，不提交图片和私人状态。
