# Series Index Snapshot / Enumerator 工作流

> 适用版本：0.4.4

Series 的数量远高于 Maker / Label，而且会持续增加。0.4.3 以前主要靠“发现一个、审核一个、发布一个”推进，这种方式适合 Pilot，但不适合长期维护。

0.4.4 将 Series 建设拆成四层：

1. **Provider Registry**：告诉脚本哪个官方 Series Index 可以枚举、属于哪个 Maker、外部 ID 在 URL 中如何表示；
2. **Snapshot**：保存某个日期从官方索引看到的外部 ID、日文名和详情 URL；
3. **Diff / Candidate**：把最新 Snapshot 与正式 External ID Mapping 对比，区分已发布、名称漂移、新候选和异常；
4. **正式发布**：只有人工审核通过后才创建 `series_######`、Source Record 和 approved Mapping。

Snapshot 本身永远不是正式 Shared Pack 实体，也不会占用 Community ID。

## 1. Provider Registry

配置文件：

`registry/series-index-providers.json`

当前登记：

- `attackers` → `attackers.series` → `maker_000004`
- `madonna` → `madonna.series` → `maker_000005`

配置记录：

- `sourceId`
- Provider namespace
- Maker Community ID
- 官方 Series Index URL
- Series Detail URL 模板
- 详情链接路径解析规则
- 官方索引是否为单页索引

Provider namespace 是身份的一部分。`attackers.series:2254` 与其他 Provider 的裸 ID `2254` 没有自动等价关系。

## 2. 生成 Snapshot

联网抓取：

```bash
pnpm series:index:snapshot -- attackers
pnpm series:index:snapshot -- madonna
```

为了离线测试解析器，也可以保存 HTML 后执行：

```bash
pnpm series:index:snapshot -- attackers --input-html tmp/attackers-series.html
```

默认生成 **partial snapshot**。即使脚本成功解析到很多条目，也不会自动认为完整。

只有操作者已经确认该 Provider 的当前公开 Series Index 确实全部遍历时，才能显式执行：

```bash
pnpm series:index:snapshot -- attackers --complete
```

`--complete` 也不会自动发布 Series；它只改变“这份快照是否代表当前公开索引完整遍历”的审计语义。

## 3. Snapshot 文件

目录：

`staging/series-index-snapshots/`

每条 Snapshot Entry 只保存：

- `position`
- `externalId`
- `nameJa`
- `sourceUrl`

不在 Snapshot 中填写中文/英文翻译，不创建 Community ID，也不猜 Label。

0.4.4 提供两份工作流验证用 partial snapshot：

- ATTACKERS：官方索引前 10 个可核验条目；
- Madonna：官方索引前 10 个可核验条目。

它们**不是完整索引快照**，不能用于声明 ATTACKERS / Madonna Series coverage complete。

## 4. Diff

运行：

```bash
pnpm series:index:diff
```

输出：

- `exports/reports/series-index-diff.json`
- `exports/csv/series-index-diff.csv`
- `exports/csv/series-index-candidates.csv`
- `exports/csv/series-index-snapshots.csv`

分类含义：

### `published`

Snapshot 外部 ID 已存在 approved Mapping，并且目标 Series / Maker / 日文规范名一致。

### `published-name-drift`

外部 ID 仍然指向已发布 Community Series，但官方索引当前名称与仓库日文规范名不同。

这可能是改名、排版变化或抓取问题，只进入人工审核，不自动改名。

### `candidate-new`

官方外部 ID 尚未映射，并且同一 Maker 下没有日文规范名精确命中的正式 Series。

这是后续批量审核的主要输入。

### `candidate-existing-name`

外部 ID 未映射，但同一 Maker 下已经存在同名正式 Series。

不得自动合并；人工确认是不是缺失 Mapping、重发 Series、历史 ID 变化或真正同名实体。

### `missing-from-complete-index`

只在 `completeTraversal=true` Snapshot 中产生：仓库有 approved Mapping，但完整快照没有看到该外部 ID。

**绝对不能自动删除或 Redirect。** 官方索引可能隐藏历史 Series、改版或暂时缺条目，只能进入人工调查。

### `conflict`

Mapping 指向不存在实体、Maker 不一致等结构冲突。必须先解决冲突再发布候选。

## 5. Source Registry 如何计数

Snapshot 建立后，`coverage.series.discovered` 应至少覆盖：

`已发布 approved Series 外部 ID ∪ 最新 Snapshot 外部 ID`

未映射 Snapshot 条目计入 `unrecognized` / 待审核候选，但这不等于错误数据。

0.4.4 当前：

- ATTACKERS：联合发现 17，已发布 8，Snapshot 待审核 9；
- Madonna：联合发现 13，已发布 3，Snapshot 待审核 10。

两者 Snapshot 都是 partial，因此 Series `completeTraversal=false`。

## 6. 正式发布仍然是人工审核步骤

Snapshot/Diff 不会：

- 自动运行 `pnpm new series`；
- 自动创建 `data/series/*.json`；
- 自动创建 Source Record；
- 自动写 approved External ID Mapping；
- 自动删除完整快照中暂时消失的旧 Series；
- 根据名称相似度或 AI 推测合并实体。

下一批发布流程应该是：

`Snapshot → Diff → 人工审核 candidate → 分配顺序 ID → 正式 JSON + Source Record + Mapping → pnpm check`

这样即使 Series 数量增长到数百或数千，也仍然保留可审计的发现和发布边界。


## 0.4.5 起的 Review Ledger

Snapshot Diff 产生的 candidate 不再直接进入正式 Registry。人工复核后必须先写入 `staging/series-candidate-reviews.json`，再发布正式 Series、Source Record 和 approved Mapping。详见 `docs/SERIES_CANDIDATE_REVIEW.md`。


## 0.4.6 Batch B

新增 `partial-002`，旧 `partial-001` 保留。最新 ATTACKERS segment 20 条，Madonna segment 19 条，二者仍为 `completeTraversal=false`。Batch B 证明 Snapshot 可以分段累计，但 latest diff 只描述最新 segment，不能把“当前 segment 已处理完”解释为完整索引覆盖。
