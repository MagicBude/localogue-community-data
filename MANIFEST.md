# Localogue Community Data Manifest

当前 Pack 版本：**0.4.3**

基线版本：`0.4.2 — Existing Maker Label Coverage Batch B`

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 本阶段不扩量 |
| Works | 5 | 延续 Pilot A |
| Organizations | 86 | 5 Maker + 81 Label |
| Series | 17 | 新增 Series Batch A 13 个 |
| Genres | 325 | 延续核心受控词表 |
| Registry Active | 446 | 新增 1 Label + 13 Series |
| Registry Redirect | 0 | 本阶段无 Merge |
| Merge Plans | 0 | 本阶段无 Merge |

## 0.4.3 新增正式实体

### S1

- `label_000081`：S1 NO.1 STYLE，官方外部 ID `s1.label:4355`；当前只确认该正式 Label 页面，不声明 S1 Label Index 已完整遍历。
- `series_000005`：おま●こ、くぱぁ（`s1.series:422`）。
- `series_000006`：ラブキモメン（`s1.series:570`）。
- 连同既有 `series_000001` 新人NO.1STYLE，S1 当前已发布 3 个官方 Series 样本。

### ATTACKERS

新增 8 个官方 Series：

- `series_000007` 侵入者（`attackers.series:2402`）
- `series_000008` あなたに愛されたくて。（`attackers.series:2269`）
- `series_000009` あなた、許して…。（`attackers.series:2270`）
- `series_000010` 脱獄者（`attackers.series:2293`）
- `series_000011` 奴隷島（`attackers.series:2256`）
- `series_000012` 犯される度に美しく（`attackers.series:2274`）
- `series_000013` 団鬼六（`attackers.series:2325`）
- `series_000014` 調教志願（`attackers.series:5317`）

### Madonna

新增 3 个官方 Series：

- `series_000015` 年下レズビアンに愛された私（`madonna.series:1846`）
- `series_000016` 廃業寸前（`madonna.series:1891`）
- `series_000017` 夫の上司に飾られた　人妻ボディアクセサリー（`madonna.series:1749`）

## Registry / Mapping

- Public Source Registry：6 个来源；
- approved External ID Mapping：98 条；
- Organization Candidate：1 条（株式会社WILL）；
- Provider Observation：98 条；
- Provider reconciliation：98 条全部由 approved 外部 ID 精确命中。

## 完整度边界

0.4.3 继续使用 0.4.2 引入的实体类型级 `coverage[].completeTraversal`：

- ATTACKERS / Madonna 的 Maker 与 Label coverage 仍为 complete；
- 本版本开始为二者声明 Series coverage，但只录入第一批官方 Series，因此 Series coverage 为 incomplete；
- 因为 `entityTypes` 新增了 Series，ATTACKERS / Madonna 的来源级 `completeTraversal` 必须由 `true` 调整为 `false`；
- S1 的 Label 与 Series 都只完成官方页面级核验，尚未形成可证明的完整索引快照，因此两类 coverage 均为 incomplete。

这不改变 0.4.1 / 0.4.2 对各 Maker 当前官方 Label Index 的已有完整性结论；完整度必须始终按“来源 + 实体类型 + 检查日期”解释。

## Series 关联原则

- 正式 Series 必须具有官方 Source Record；
- `makerId` 由官方来源域名/Source Registry 明确归属；
- `labelId` 不根据名称、作品标题或常见发行习惯猜测，只有公开证据明确支持时才填写；
- 同名 Series 不跨 Maker 自动合并；
- 本批次不导入大量 Work，也不提交任何图片或私人状态。
