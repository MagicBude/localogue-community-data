# Changelog

## 0.4.4 - 2026-09-04

### Added
- 新增 Series Index Provider Registry，首批支持 ATTACKERS 与 Madonna 官方 Series Index。
- 新增 `series:index:snapshot` 官方索引 Snapshot 工具，支持 live fetch、离线 HTML fixture 与显式 `--complete`。
- 新增 `staging/series-index-snapshots/`，首批保存 ATTACKERS / Madonna 各 10 条 partial snapshot。
- 新增 `series:index:diff`，输出 Snapshot 与正式 External ID Mapping 的可审计差异和候选 CSV/JSON。
- 新增 Series Index Snapshot Validator 与离线解析/不自动删除回归测试。
- XLSX 增加 Series Index Snapshots / Series Index Candidates 工作表。

### Changed
- ATTACKERS Series coverage 更新为联合发现 17、已发布 8、待审核 9，仍为 incomplete。
- Madonna Series coverage 更新为联合发现 13、已发布 3、待审核 10，仍为 incomplete。
- `stats` 增加 Series Index Provider、Snapshot、Entry、Candidate 与 missing-from-complete 统计。

### Governance
- Snapshot 只属于发现/Staging 层，不占 Community ID，也不会自动创建正式 Series 或 approved Mapping。
- 同名无 Mapping 只进入人工审核；完整 Snapshot 暂时缺少历史正式 ID 时只生成审核警告，绝不自动删除或 Redirect。

## 0.4.3 - 2026-09-04

### Added
- 新增 S1 NO.1 STYLE 主 Label（官方外部 ID 4355）。
- 新增 13 个官方可核验 Series：S1 2 个、ATTACKERS 8 个、Madonna 3 个。
- 新增对应 Source Record、External ID Mapping 与 Provider Observation。

### Changed
- ATTACKERS 与 Madonna 开始纳入 Series coverage；Maker/Label coverage 仍保持 complete，但来源级 completeTraversal 因 Series 尚未完整枚举而调整为 false。
- S1 增加 Label coverage；由于无法证明完整索引遍历，Label 与 Series coverage 均保持 incomplete。
- Series 不根据名称或作品印象推断 Label 归属，只有官方证据明确支持时才填写 labelId。


本文件记录 Localogue Community Data 的 Pack 版本变化。

## 0.4.2 - 2026-09-04

### 新增

- 完整遍历 MOODYZ 当前官方 `/works/label` 索引：29 个可见 Label 全部审核并发布；其中 2 个来自 0.4.0，本版本新增 27 个。
- 完整遍历 IDEAPOCKET 当前官方 `/works/label` 索引：16 个可见 Label 全部审核并发布。
- 新增 43 个正式 Label、43 份独立 Source Record、43 条 approved External ID Mapping 与 43 条 Provider Observation。

### Source Registry

- 为 `coverage[]` 新增实体类型级 `completeTraversal`，解决“同一来源 Label 已完整、Series 仍不完整”无法表达的问题。
- 来源级 `completeTraversal` 保留为聚合状态：只有 `entityTypes` 中每一种实体类型都有 `coverage.completeTraversal=true` 时才允许为 true。
- MOODYZ 与 IDEAPOCKET 的 Label coverage 现在为 complete，但由于 Series 尚未完整枚举，两者来源级 `completeTraversal` 仍保持 false。

### 校验与导出

- Validator 校验 coverage 类型重复、coverage 类型必须属于 source.entityTypes、每个 coverage 必须显式声明完整遍历状态，以及来源级聚合状态一致性。
- CSV/XLSX 的 Source Registry 覆盖统计增加 per-entity complete 状态。
- Provider reconciliation 扩展到 84 条 approved 外部 ID 精确映射，仍无 suggested/conflict/unrecognized。

## 0.4.1 - 2026-09-04

### 新增

- 正式新增 ATTACKERS 与 Madonna 两个 Maker。
- 完整遍历 ATTACKERS 当前官方 Label Index，发布 17 个 Label。
- 完整遍历 Madonna 当前官方 Label Index，发布 18 个 Label。
- 为 35 个 Label 建立独立 Source Record、Provider Observation 与 approved External ID Mapping。
- 新增 Provider namespace 隔离回归测试，允许不同官方 Provider 使用相同数值 ID，而不会错误合并不同 Maker 下的 Label。

### 覆盖

- `source_attackers_official`：Maker 1/1、Label 17/17，`completeTraversal=true`。
- `source_madonna_official`：Maker 1/1、Label 18/18，`completeTraversal=true`。
- `completeTraversal=true` 只表示 2026-09-04 时点对应官方 `/works/label` 当前公开索引全部可见条目已逐项遍历；不代表历史已删除 Label、Series、Work 或集团/法人关系已完整覆盖。

### 校验

- 相同的活动型 Label 名称（如 `AVOPEN`、`AVグランプリ`）如果出现在不同 Maker 的官方 Label Index 中，按 Maker-local Label 分别建实体。
- 外部 ID 的身份键始终包含 Provider namespace；例如 `attackers.label:9483` 与 `madonna.label:9483` 不属于同一个 Mapping key。
- 不因 Label 名称相同、数值 ID 相同或营销活动相同而跨 Maker 自动合并。

## 0.4.0 - 2026-09-04

### 新增

- 建立 Group / Company / Maker / Label / Series Registry Foundation。
- 新增 Organization 与 Series Foundation Schema。
- 新增 Public Source Registry、Organization Candidate/Staging、Provider Observation 与 approved External ID Mapping。
- 新增 Provider 精确对账脚本与 auto-applied / suggested / conflict / unrecognized 报告。
- 新增 2 个 MOODYZ Label：MOODYZ DIVA、みんなのキカタン。
- 新增 4 个官方 Series：新人NO.1STYLE、カラミざかり、死ぬほど大嫌いな上司とまさかの相部屋に、うちの妻を犯して下さい。
- 新增株式会社WILL Company Candidate；不在消费契约未完成时伪装成 Maker。
- 新增 Organization / Series / Source Registry / External ID Mapping / Candidate / Reconciliation CSV 与 XLSX 浏览导出。

### 变更

- `package.json` 与 Shared Pack 版本升级到 0.4.0。
- `new-id` 支持 Group/Company ID 前缀的治理模型。
- `stats` 增加 Organization kind、Public Source、Mapping、Candidate 统计。
- Registry 生成改为保留历史生命周期记录：Redirect 不再因为从 data 重建而静默丢失；已发布 active ID 无 Redirect 时也不能直接消失。

### 校验

- Label 必须直接挂 Maker。
- Series 必须有 Maker；Label 如存在必须属于同一 Maker。
- Provider 外部 ID Mapping 必须唯一且与目标实体 `externalIds` 一致。
- 同名 Series 不自动合并，只进入人工审核。
- 模糊相似、AI 推测和番号前缀不得直接自动创建/合并正式实体。

## 0.3.2 - 2026-09-04

- 为 5 部 Pilot A 作品建立第一轮保守 Work–Genre 引用。
- 新增“初次体验 / 性感开发”两条三语 Genre，使 Genre 总数达到 325。
- 作品 CSV/XLSX 增加 Genre 信息。
- 支持 `firstPublishedIn`。
- 根目录统一只维护 `MANIFEST.md`。

## 0.3.1

- 建立第一版核心受控 Genre 词表与九个 facet。
- 完成日文、简体中文、英文名称及别名基础。

## 0.3.0

- 建立六位顺序实体 ID 与 Registry 生命周期基础。
- 发布第一批真实 People、Works 与 Maker 数据。

> 说明：更早的 Bootstrap 演进仍可通过 Git 历史追溯；0.4.0 起继续在本文件追加 Pack 版本记录，不再新增按版本命名的根目录 Manifest。
