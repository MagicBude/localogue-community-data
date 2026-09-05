# Public Source Registry 与 Candidate/Staging 工作流

> 适用版本：0.4.11

Community Data 不以“搜索到多少结果”证明完整性，而以**指定公开来源是否已完成可验证遍历**来描述覆盖程度。

## 1. Public Source Registry

`registry/public-sources.json` 用于登记我们实际使用的公开来源。它不是 Source Record 的替代品：

- Public Source Registry 描述“这个来源本身怎么枚举、覆盖到哪里”；
- `data/sources/<entity-id>.json` 描述“某个正式实体的哪些字段由什么证据支持”。

一个 Source Registry 条目至少应记录：

- 来源名称和 URL；
- `official / distributor / database` 类型；
- 可枚举实体类型；
- 分页/目录模式；
- 外部 ID 是否稳定；
- 当前访问状态；
- 最后检查日期；
- discovered / reviewed / published / conflicts / unrecognized；
- 是否真正遍历完全部公开分页；
- 已知限制。

只有 `completeTraversal=true` 且对应分页/目录确实全部检查后，才能说“该来源当前公开目录已覆盖”。

## 2. Candidate/Staging 为什么存在

发现一个名字并不等于已经具备发布资格。Candidate/Staging 用来容纳：

- 有公开证据但消费端暂未支持的实体；
- 父子层级尚未完成官方核验的 Organization；
- 同名冲突；
- 未识别 Provider ID；
- 只能由标题/番号规则产生的建议。

Candidate 不占用正式 Community ID。只有通过人工审核并准备正式发布时，才由 `pnpm new <type>` / ID 工具计算下一个可用顺序号。

## 3. 本版本的 WILL 示例

株式会社WILL 的公司名称、成立日期和官网信息可以从官方公司页核验，因此它是可靠的 Company Candidate。

但是“WILL 与现有三个 Maker 的父子关系”本轮没有获得足够的官方品牌层级证据，所以：

- 不写入现有 Maker 的 `parentOrganizationId`；
- 不从第三方数据库或搜索摘要推断；
- Candidate 中明确记录“关系仍待审核”。

这就是 Staging 层的价值：保留发现结果，又不让不确定信息进入正式 Shared Pack。

## 4. 每批导入应输出什么

每一批来源枚举至少要得到：

- 新发现数量；
- 已审核数量；
- 已发布数量；
- 冲突数量；
- 未识别数量；
- 未完成分页/访问限制。

数量是审计信息，不是质量目标。第一轮宁可发布少量高置信实体，也不能用模糊匹配把错误关系写进稳定 ID。

## 5. 0.4.1：如何证明一个 Label Index 已遍历完成

0.4.1 首次把 `completeTraversal=true` 用在可审计的 Maker Label Index 上：

- ATTACKERS：官方 `/works/label` 当前单页可见 17 个 Label；
- Madonna：官方 `/works/label` 当前单页可见 18 个 Label。

操作上不是只数首页卡片，而是逐项打开每一个 Label 链接，确认：

1. Label 日文规范名；
2. 详情 URL；
3. URL 中稳定的 `label/<id>`；
4. 父级 Maker；
5. Source Record 与 Mapping 都已经落库。

因此这里的 `completeTraversal=true` 可以解释为“检查日期这个**特定索引**的当前可见条目全部审核完毕”。它不能被扩大解释成网站全部历史数据完整。

Label 与 Series 必须拆开统计。即使 `/works/label` 已完整遍历，也不能因此把同一网站的 Series 覆盖标成 complete。

## 6. 0.4.2：完整遍历必须按实体类型表达

0.4.1 的来源级 `completeTraversal` 对只维护 Maker/Label 的来源够用，但 MOODYZ、IDEAPOCKET 同时包含 Label 与 Series：Label Index 可以已经全部遍历，而 Series 仍只做了少量 Pilot。

因此 0.4.2 增加：

```json
{
  "entityType": "label",
  "discovered": 29,
  "reviewed": 29,
  "published": 29,
  "conflicts": 0,
  "unrecognized": 0,
  "completeTraversal": true
}
```

规则：

1. `coverage[].completeTraversal` 只回答“这个实体类型对应的指定公开索引是否已经遍历全部当前可见条目”；
2. 来源级 `completeTraversal` 是聚合状态；只有 `source.entityTypes` 中所有类型都有 complete coverage 时才可以为 `true`；
3. 已完整遍历 Label，不得把 Series 的完整度一起提升；
4. 已遍历完分页并不等于所有候选都已发布，conflict / unrecognized 可以仍然大于 0；
5. 完整度必须带检查日期和已知限制，不能被解释为永久完整。

0.4.2 的实际例子：

- MOODYZ：Label 29/29 complete；Series 1 个 Pilot，incomplete；来源级 false。
- IDEAPOCKET：Label 16/16 complete；Series 2 个 Pilot，incomplete；来源级 false。
- ATTACKERS / Madonna：当前 source.entityTypes 只有 Maker + Label，二者都 complete，因此来源级仍为 true。

## 7. 0.4.4：Series Index Snapshot 是 Candidate/Staging 的专用入口

Series 数量进入批量阶段后，不再直接把搜索结果写成正式实体。`staging/series-index-snapshots/` 保存官方索引观察快照，`pnpm series:index:diff` 再与 approved Mapping 对账。

重要边界：

1. partial snapshot 只能证明“这些条目被发现”，不能证明索引完整；
2. Snapshot Entry 不占 Community ID；
3. 未映射条目进入 `series-index-candidates.csv`，不会自动发布；
4. 完整快照缺少一个历史 approved ID 时也不能自动删除；
5. Source Registry 的 `discovered` 可以包含未发布候选，`published` 只统计正式实体；
6. `completeTraversal` 仍然只能由实际完整遍历结果决定。

详细流程见 `docs/SERIES_INDEX_SNAPSHOT.md`。


## 8. 0.4.11：Person Identity Candidate 使用本地隔离 Staging

People 的身份解析与官方 Series Index 不同：第三方 alias/substitution 清单可能有很高的发现价值，但未必允许整库以 CC0 再发布。

因此 0.4.11 增加两层边界：

- `registry/public-sources.json` 可以登记 `entityTypes: ["person"]`，描述发现来源、覆盖和限制；
- 未确认可再分发的完整姓名关系数据默认生成到 `.local/staging/person-identity-candidates.json`，不进入 Git。

MetaTube `substitution.Actor.txt` 的导入只做：

1. `from=to` 解析与精确去重；
2. 无向连通组件聚类，保留原有有向 edge；
3. 冲突 source、自映射、短名、称呼、传递链标记；
4. 与正式 Person 全部已有姓名做规范化完全匹配；
5. 输出 Review Candidate。

它明确**不做** canonical 推断、模糊 Merge、Community ID 分配或正式发布。
