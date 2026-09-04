# Changelog

本文件记录 Localogue Community Data 的 Pack 版本变化。

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
