# Localogue Community Data Manifest

当前 Pack 版本：**0.4.2**

基线版本：`0.4.1 — Official Label Index Coverage Batch A`

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 本阶段不扩量 |
| Works | 5 | 延续 Pilot A |
| Organizations | 85 | 5 Maker + 80 Label |
| Series | 4 | 本阶段不扩 Series |
| Genres | 325 | 延续核心受控词表 |
| Registry Active | 432 | 新增 43 个 Label |
| Registry Redirect | 0 | 本阶段无 Merge |
| Merge Plans | 0 | 本阶段无 Merge |

## 0.4.2 新增正式 Label

- `label_000038` ～ `label_000064`：MOODYZ 当前官方 Label Index 中此前未发布的 27 个 Label；连同 0.4.0 的 2 个 Label，MOODYZ 当前公开 Label Index 共覆盖 29/29。
- `label_000065` ～ `label_000080`：IDEAPOCKET 当前官方 Label Index 的 16 个 Label，覆盖 16/16。

## Registry / Mapping

- Public Source Registry：6 个来源；
- approved External ID Mapping：84 条；
- Organization Candidate：1 条（株式会社WILL）；
- Provider Observation：84 条；
- Provider reconciliation：84 条全部由 approved 外部 ID 精确命中。

## 完整度模型升级

0.4.2 把完整遍历状态从只有来源级 `completeTraversal` 扩展到 `coverage[].completeTraversal`。原因是一个来源可能同时暴露 Maker、Label、Series、Work，而这些实体类型不可能总在同一批次完成。

- `coverage[].completeTraversal=true`：只声明这个实体类型对应的指定公开索引在检查日期已遍历全部当前可见条目；
- 来源级 `completeTraversal=true`：只有 `entityTypes` 中所有实体类型都拥有 complete coverage 时才成立；
- 因此 MOODYZ / IDEAPOCKET 当前 **Label Index 已完整**，但 **整个来源仍不完整**，因为 Series 等仍未完成。

## 本版本可证明的新增覆盖

### MOODYZ Label

2026-09-04 时点，`https://moodyz.com/works/label` 当前公开单页索引列出 29 个 Label；本仓库已逐项建立或核验正式 Label 与 `moodyz.label:<id>` Mapping，因此 Label coverage 为 29/29、`coverage.completeTraversal=true`。

### IDEAPOCKET Label

2026-09-04 时点，`https://ideapocket.com/works/label` 当前公开单页索引列出 16 个 Label；本仓库已逐项建立正式 Label 与 `ideapocket.label:<id>` Mapping，因此 Label coverage 为 16/16、`coverage.completeTraversal=true`。

### 边界

这不代表历史删除/隐藏 Label、Series、Work、Company、Group 或其他 Maker 已收集完整；同名活动型 Label 继续保持 Maker-local 身份，不跨 Provider 自动合并。
