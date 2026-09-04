# Project Status

## 当前版本

`0.4.1 — Official Label Index Coverage Batch A`

基线：0.4.0

## 已完成

1. 延续 0.4.0 的 Group / Company / Maker / Label / Series Registry Foundation。
2. 正式新增 ATTACKERS、Madonna 两个官方可核验 Maker；不推断其法律公司或集团父级。
3. 完整遍历 ATTACKERS 当前 `/works/label` 官方索引：发现 17、审核 17、发布 17、冲突 0、未识别 0。
4. 完整遍历 Madonna 当前 `/works/label` 官方索引：发现 18、审核 18、发布 18、冲突 0、未识别 0。
5. 为 35 个 Label 建立独立 Source Record、稳定 Provider ID、approved Mapping 与 Provider Observation。
6. 对账结果扩展到 41 条，全部 `auto-applied`，没有 suggested/conflict/unrecognized。
7. 明确 Provider namespace 是外部 ID 身份的一部分；不同 Maker 站点复用相同数值 ID 不构成 Community Entity 自动合并依据。
8. 保留株式会社WILL Company Candidate，不改变 Group/Company 当前消费兼容策略。

## 当前正式统计

- People: 13
- Works: 5
- Organizations: 42（Maker 5 / Label 37）
- Series: 4
- Genres: 325
- Registry Active: 389
- Registry Redirect: 0
- Merge Plans: 0
- Public Sources: 6
- External ID Mappings: 41
- Organization Candidates: 1

## 当前可证明的 Provider 覆盖

| Source | Entity | Discovered | Reviewed | Published | Conflicts | Unrecognized | Complete traversal |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| ATTACKERS official `/works/label` | Label | 17 | 17 | 17 | 0 | 0 | yes |
| Madonna official `/works/label` | Label | 18 | 18 | 18 | 0 | 0 | yes |
| MOODYZ official | Label | 2 | 2 | 2 | 0 | 0 | no |
| IdeaPocket official | Series | 2 | 2 | 2 | 0 | 0 | no |
| MOODYZ official | Series | 1 | 1 | 1 | 0 | 0 | no |
| S1 official | Series | 1 | 1 | 1 | 0 | 0 | no |

`yes` 仅代表检查日期对应公开索引的当前可见内容全部遍历，不代表历史删除内容或其他实体类型完整。

## 下一阶段

### 0.4.x：继续 Maker / Label Registry

1. 优先寻找具有官方 Label Index、可逐项取稳定 ID 的 Maker；
2. 对 kawaii*、OPPAI 等站点先验证是否存在可枚举 Label Index，再决定正式导入；
3. 对不能证明完整遍历的来源继续保持 `completeTraversal=false`；
4. 不通过第三方榜单直接创建正式 Maker / Label。

### 随后：Series Batch

Maker / Label 基础扩大后，分别为 ATTACKERS、Madonna 等建立独立 Series Source Registry 条目，再枚举 Series；Series 完整性必须和 Label 覆盖分开声明。
