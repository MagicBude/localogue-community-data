# Provider Entity Mapping 与精确自动关联

> 适用版本：0.4.0

本文件定义外部 Provider 的 Maker/Label/Series 如何映射到 Community Entity。

## 1. 两层输入

### 1.1 已审核 Mapping

`registry/external-id-mappings.json` 是可以用于自动写入的白名单式映射表。

键由三部分组成：

`provider + entityType + externalId`

例如：

`moodyz.series + series + 5427 -> series_000002`

Mapping 必须记录官方/可靠来源 URL 和审核日期。

### 1.2 Provider Observation

`staging/provider-observations.json` 保存本次从来源看到的外部实体。Observation 是“观察结果”，不是正式 Community 数据。

## 2. 自动关联优先级

`pnpm provider:reconcile` 按以下顺序处理：

1. **approved 稳定外部 ID**：唯一命中时 `auto-applied`；
2. **日文规范名唯一精确匹配**：可 `auto-applied`；
3. **已登记日文别名唯一精确匹配**：可 `auto-applied`；
4. **标题明确规则或番号前缀规则**：只能 `suggested`；
5. **歧义、模糊相似、AI 推测**：不得自动应用；
6. 完全未知：`unrecognized`。

脚本不会自动创建新正式 Genre/Organization/Series，也不会因为一个词“很像”就合并实体。

## 3. 为什么番号前缀只能是建议

番号前缀可以用于候选发现，但不能作为永久身份依据。原因包括：

- 同一前缀可能跨时期复用；
- 品牌/发行关系可能变化；
- 第三方数据库可能把 Maker、Label、Series 混写；
- 历史重组后，同一个前缀未必仍对应同一组织层级。

因此前缀规则只能帮助人工缩小范围。

## 4. 未识别不能静默丢弃

对账结果写入：

- `exports/reports/provider-reconciliation.json`
- `exports/csv/provider-reconciliation.csv`

所有 Observation 必须落入 `auto-applied / suggested / conflict / unrecognized` 之一。这样 Provider 新增分类/Label/Series 时，我们能够看见变化，而不是因为脚本“不认识”就悄悄忽略。

## 5. Mapping 校验

Foundation Validator 会拒绝：

- 同一 `provider/entityType/externalId` 重复映射；
- 一个 Community Entity 对同一 Provider 登记多个矛盾 ID；
- Mapping 的 `entityType` 与目标实体类型不一致；
- approved Mapping 与目标实体 `externalIds` 不一致。

这使 Mapping 表本身可以成为自动关联的可信输入，而不是另一份未经约束的别名表。
