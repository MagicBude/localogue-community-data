# Localogue Community Data Manifest

当前 Pack 版本：**0.4.6**

基线版本：`0.4.5 — Series Candidate Review / Promotion Batch A`

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 本阶段不扩量 |
| Works | 5 | 延续 Pilot A |
| Organizations | 86 | 5 Maker + 81 Label |
| Series | 61 | 0.4.6 新增 25 个经 Review 批准的官方 Series |
| Genres | 325 | 延续核心受控词表 |
| Registry Active | 490 | 新增 25 个 Series ID |
| Registry Redirect | 0 | 本阶段无 Merge |
| Merge Plans | 0 | 本阶段无 Merge |

## 0.4.6 Series Review Batch B

- ATTACKERS 新增第二份 partial Snapshot：20 条；其中 16 个新候选 publish、1 个候选 hold、3 个已发布精确命中。
- Madonna 新增第二份 partial Snapshot：19 条；其中 9 个新候选 publish、10 个已发布精确命中。
- 本版本新增正式 Series：25。
- Series Candidate Reviews：累计 45；publish 44、hold 1、reject 0。
- approved External ID Mapping / Provider Observation：142。

ATTACKERS `series/2273` 的官方规范名仅为全角“１”，虽然来源是官方页面，但信息量异常低，本阶段明确 hold，不分配 Community ID。

## 最新 Snapshot Diff

- 最新 ATTACKERS Snapshot：20 条；19 published，1 candidate-new（已 Review=hold）。
- 最新 Madonna Snapshot：19 条；19 published。
- 合计 `published=38`、`candidate-new=1`、drift=0、missing=0、conflict=0。
- staging 累计 4 份 Snapshot、59 个 Snapshot Entry。

## 完整性边界

ATTACKERS Series 当前 discovered/reviewed/published = 34/34/33，另有 1 个 hold；Madonna 为 22/22/22。最新 Snapshot 仍是 partial，因此两者 `series.completeTraversal=false`、来源级 `completeTraversal=false`。

## 安全边界

- 官方来源不等于无条件发布；异常低信息量名称可以 hold。
- hold/reject 不占 Community ID，也不写 approved Mapping。
- partial Snapshot 不用于删除或 Redirect 历史正式 Series。
- 同名、模糊相似和 AI 推测不得自动创建或合并实体。
- 不新增大量 Work，不提交图片和私人状态。
