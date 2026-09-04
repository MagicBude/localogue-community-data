# Project Status

## 当前版本

`0.4.2 — Existing Maker Label Coverage Batch B`

基线：0.4.1

## 已完成

1. 保持 0.4.1 ATTACKERS / Madonna 当前官方 Label Index 完整覆盖。
2. 完整遍历 MOODYZ 当前官方 `/works/label`：29 个当前可见 Label，发现 29、审核 29、发布 29。
3. 完整遍历 IDEAPOCKET 当前官方 `/works/label`：16 个当前可见 Label，发现 16、审核 16、发布 16。
4. 本版本新增 43 个 Label：MOODYZ 27 个、IDEAPOCKET 16 个。
5. External ID Mapping / Provider Observation 扩展到 84 条，全部使用 Provider namespace + entityType + externalId 精确身份键。
6. Source Registry 新增实体类型级 `coverage.completeTraversal`，来源级完整状态改为聚合语义。
7. MOODYZ / IDEAPOCKET 的 Label coverage 为 complete；Series coverage 仍不完整，因此两个来源级 `completeTraversal=false`。
8. 不新增 Work，不改变株式会社WILL Candidate，不修改 Localogue 主程序。

## 当前正式统计

- People: 13
- Works: 5
- Organizations: 85（Maker 5 / Label 80）
- Series: 4
- Genres: 325
- Registry Active: 432
- Registry Redirect: 0
- Merge Plans: 0
- Public Sources: 6
- External ID Mappings: 84
- Organization Candidates: 1

## 当前可证明的 Provider Label 覆盖

| Source | Label discovered | Reviewed | Published | Conflicts | Unrecognized | Label traversal | Source traversal |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| ATTACKERS official | 17 | 17 | 17 | 0 | 0 | complete | complete |
| Madonna official | 18 | 18 | 18 | 0 | 0 | complete | complete |
| MOODYZ official | 29 | 29 | 29 | 0 | 0 | complete | partial（Series 未完整） |
| IDEAPOCKET official | 16 | 16 | 16 | 0 | 0 | complete | partial（Series 未完整） |

## 下一阶段

### 0.4.x：继续有限基础实体

1. 验证 S1 是否存在可证明完整的官方 Label Index；若只有单一 Label，也必须先找到索引级证据再声明完整。
2. 继续寻找具有官方 Maker/Label Index 的主流 Maker，而不是依赖第三方列表。
3. 对已有四个 Label-complete Maker 分别建立 Series 枚举计划；Label 和 Series 完整度继续分开。
4. 当 Series 枚举量开始明显增大时，优先补自动抓取/候选生成脚本，而不是手工无限录入。
