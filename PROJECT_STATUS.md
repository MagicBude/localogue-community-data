# Project Status

## 当前版本

`0.4.3 — Series Registry Batch A`

基线：0.4.2

## 已完成

1. 保持 0.4.2 的 Label Foundation：ATTACKERS、Madonna、MOODYZ、IDEAPOCKET 当前官方 Label Index 均已有独立实体类型级覆盖记录。
2. 为 S1 正式新增主 Label `S1 NO.1 STYLE`（`s1.label:4355`）；由于尚未获得可证明的完整 Label Index 快照，不声明 S1 Label coverage 完整。
3. 新增 13 个官方可核验 Series：S1 2 个、ATTACKERS 8 个、Madonna 3 个。
4. 每个新增 Label / Series 均建立正式 Source Record、approved External ID Mapping 与 Provider Observation。
5. External ID Mapping / Provider Observation 扩展至 98 条；Provider reconciliation 为 98 auto-applied、0 suggested、0 conflicts、0 unrecognized。
6. ATTACKERS / Madonna 开始声明 Series coverage；Maker/Label coverage 保持 complete，Series coverage 为 incomplete，因此来源级 `completeTraversal=false`。
7. Series 不推断 `labelId`：官方 Series 页面没有明确 Label 归属时只记录 Maker。
8. 不新增 Work，不改变株式会社WILL Candidate，不修改 Localogue 主程序。

## 当前正式统计

- People: 13
- Works: 5
- Organizations: 86（Maker 5 / Label 81）
- Series: 17
- Genres: 325
- Registry Active: 446
- Registry Redirect: 0
- Merge Plans: 0
- Public Sources: 6
- External ID Mappings: 98
- Organization Candidates: 1

## 当前可证明的 Label 覆盖

| Source | Label discovered | Reviewed | Published | Label traversal | Source traversal |
| --- | ---: | ---: | ---: | --- | --- |
| ATTACKERS official | 17 | 17 | 17 | complete | partial（Series 未完整） |
| Madonna official | 18 | 18 | 18 | complete | partial（Series 未完整） |
| MOODYZ official | 29 | 29 | 29 | complete | partial（Series 未完整） |
| IDEAPOCKET official | 16 | 16 | 16 | complete | partial（Series 未完整） |
| S1 official | 1 | 1 | 1 | incomplete | partial |

S1 的 `1/1` 只表示当前批次发现并审核的主 Label 页面，不代表官方 Label Index 只有一个条目。

## 当前 Series Batch

| Source | Series discovered | Reviewed | Published | Series traversal |
| --- | ---: | ---: | ---: | --- |
| S1 official | 3 | 3 | 3 | incomplete |
| ATTACKERS official | 8 | 8 | 8 | incomplete |
| Madonna official | 3 | 3 | 3 | incomplete |
| MOODYZ official | 1 | 1 | 1 | incomplete |
| IDEAPOCKET official | 2 | 2 | 2 | incomplete |

## 下一阶段

### 0.4.x：Series Index Snapshot / Enumerator

1. 优先建立可重复的官方 Series Index 枚举与快照流程，把“搜索发现几个 Series”升级为“可证明遍历某个公开索引”。
2. 对 ATTACKERS / Madonna 的 `/works/series` 优先做完整候选快照，再人工审核并批量发布。
3. S1 的动态 Label/Series 索引在当前采集环境中无法可靠形成完整列表；继续保持 incomplete，不根据搜索引擎结果数量推断完整度。
4. Series 数量开始快速增长后，不再依赖手工逐条创建 JSON；生成流程必须继续输出新增、更新、冲突、未识别与待审核数量。
