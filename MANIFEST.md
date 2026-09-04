# Localogue Community Data Manifest

当前 Pack 版本：**0.4.1**

基线版本：`0.4.0 — Organization & Series Registry Foundation`

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 本阶段不扩量 |
| Works | 5 | 延续 Pilot A |
| Organizations | 42 | 5 Maker + 37 Label |
| Series | 4 | 本阶段不扩 Series |
| Genres | 325 | 延续核心受控词表 |
| Registry Active | 389 | 352 + 2 Maker + 35 Label |
| Registry Redirect | 0 | 本阶段无 Merge |
| Merge Plans | 0 | 本阶段无 Merge |

## 0.4.1 新增正式 Organization

- `maker_000004` — ATTACKERS
- `maker_000005` — マドンナ / Madonna
- `label_000003` ～ `label_000019` — ATTACKERS 当前官方 Label Index 的 17 个 Label
- `label_000020` ～ `label_000037` — Madonna 当前官方 Label Index 的 18 个 Label

## Registry / Mapping

- Public Source Registry：6 个来源；
- approved External ID Mapping：41 条；
- Organization Candidate：1 条（株式会社WILL）；
- Provider Observation：41 条；
- Provider reconciliation：41 条全部由 approved 外部 ID 精确命中。

## 本版本可证明的覆盖声明

### ATTACKERS

2026-09-04 时点，`https://attackers.net/works/label` 当前公开 Label Index 单页可见 **17** 个 Label；本版本已逐项访问对应 Label URL、记录外部 ID 并正式发布，因此该 **当前公开 Label Index** 可标记 `completeTraversal=true`。

### Madonna

2026-09-04 时点，`https://madonna-av.com/works/label` 当前公开 Label Index 单页可见 **18** 个 Label；本版本已逐项访问对应 Label URL、记录外部 ID 并正式发布，因此该 **当前公开 Label Index** 可标记 `completeTraversal=true`。

### 完整性的边界

这里的“完整”只针对上述两个 URL 在检查日期公开展示的 Label Index。它**不表示**：

- 已覆盖网站历史上删除或隐藏的 Label；
- 已覆盖 ATTACKERS / Madonna 全部 Series 或 Work；
- 已完成其法律公司、运营集团或历史组织关系；
- 已经收集所有 AV Maker / Label。

## 身份隔离原则

ATTACKERS 与 Madonna 的官方 Label Index 都包含 `AVOPEN`、`AVグランプリ`、`おっぱい祭り` 等名称，其中部分 URL 甚至复用相同数值 ID。Community Data 不跨 Maker 自动合并这些条目：`attackers.label:<id>` 与 `madonna.label:<id>` 是不同 Provider namespace，且 Label 的正式父级不同。
