# Localogue Community Data Manifest

当前 Pack 版本：**0.4.0**

基线提交：`c59e6711c26925b0eb446e63c6dc0d48b208d941`（0.3.2）

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 延续 0.3.2 |
| Works | 5 | 延续 Pilot A，不在本阶段扩量 |
| Organizations | 5 | 3 Maker + 2 Label |
| Series | 4 | 第一批官方 Series |
| Genres | 325 | 延续 0.3.2 核心受控词表 |
| Registry Active | 352 | 346 + 2 Label + 4 Series |
| Registry Redirect | 0 | 本阶段无 Merge |
| Merge Plans | 0 | 本阶段无 Merge |

## 0.4.0 Foundation 资产

- Public Source Registry：4 个来源；
- approved External ID Mapping：6 条；
- Organization Candidate：1 条（株式会社WILL，公司实体暂不正式发布）；
- Provider Observation：6 条；
- Provider reconciliation：6 条均由已审核稳定外部 ID 精确命中。

## 正式新增 Organization

- `label_000001` — MOODYZ DIVA → `maker_000002` MOODYZ
- `label_000002` — みんなのキカタン → `maker_000002` MOODYZ

## 正式新增 Series

- `series_000001` — 新人NO.1STYLE → `maker_000003` エスワン
- `series_000002` — カラミざかり → `maker_000002` MOODYZ
- `series_000003` — 死ぬほど大嫌いな上司とまさかの相部屋に → `maker_000001` アイデアポケット
- `series_000004` — うちの妻を犯して下さい → `maker_000001` アイデアポケット

## 兼容边界

0.4.0 已冻结 Group/Company/Maker/Label 语义和 Schema，但当前 Localogue Shared Pack 对 Group/Company 尚未形成完整的一等消费契约。因此 Company/Group 本阶段优先进入 Staging，禁止为了兼容把 Company/Group 伪装成 Maker/Label。

## 覆盖声明

本版本**不声明已收集所有 Maker、Label 或 Series**。

IdeaPocket、MOODYZ、S1 的本阶段数据仅是第一批官方目录样本，`completeTraversal=false`；WILL 官方公司信息页作为单页 Company Candidate 已完成本页核验，但不等于 WILL 整个品牌/组织网络已经覆盖。
