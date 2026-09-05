# Project Status

## 当前版本

`0.4.11 — Person Identity Candidate Foundation`

基线：0.4.10

## 已完成

1. 保持 0.4.10 的 13 People、5 Works、86 Organizations、119 Series、325 Genres，不因发现第三方姓名关系直接扩充正式 Person。
2. Public Source Registry 首次支持 `person` 实体类型，并登记 MetaTube 社区 Actor Substitution 清单为数据库型 discovery source。
3. 新增 `pnpm people:identity:import:metatube`，读取用户本地 `substitution.Actor.txt`，不把第三方原始附件复制进仓库。
4. 新增 Person Identity Candidate Set Schema、无依赖 Validator 和 CSV 本地浏览输出。
5. Candidate 聚类按姓名关系的无向连通组件生成，同时保留 `from→to` 原始方向；右侧绝不自动解释为 canonical/current/former name。
6. 新增 conflict source、自映射、短名、称呼、传递链、多正式 Person 命中等 Review Flag。
7. 与现有 `data/people` 只做规范化后的完全姓名匹配；命中只作为 Review 提示，不自动填写 communityId，不自动发布，不模糊 Merge。
8. 未确认可 CC0 再发布的完整第三方姓名关系只写入 `.local/staging/`，不进入 `data/`、`library/`、正式 `staging/` 或版本化 exports。
9. 当前 `substitution.Actor.txt` 实测：707 原始映射、704 唯一映射、926 姓名、226 Candidate Cluster、3 conflict source、3 自映射、5 个两步 source、0 parse error。
10. 当前 13 个正式 Person 中有 4 个 Cluster 可通过已有姓名精确命中；命中本身不等于批准合并。
11. 新增 5 条 Person Identity 回归测试；全仓脚本测试从实际 23 条增加到 28 条。
12. 0.4.10 的五个 Series Provider、12 份 Snapshot、119 个正式 Series 与 resume checkpoint 全部保持不变。

## 当前正式统计

- People: 13
- Works: 5
- Organizations: 86（Maker 5 / Label 81）
- Series: 119
- Genres: 325
- Registry Active: 548
- Registry Redirect: 0
- Merge Plans: 0
- Public Sources: 7
- External ID Mappings: 200
- Organization Candidates: 1

## Person Identity Discovery 统计

> 以下统计来自用户本地 MetaTube `substitution.Actor.txt`，不作为 CC0 Shared Pack 数据提交。

- Raw mappings: 707
- Unique mappings: 704
- Unique source names: 701
- Unique names: 926
- Candidate clusters: 226
- Conflict sources: 3
- Self mappings: 3
- Transitive sources: 5
- Parse errors: 0
- Exact-match clusters against current formal People: 4
- Multi-Person exact-match clusters: 0

## Series Review / Snapshot 统计

- Series Index Providers: 5
- Series Index Snapshots: 12
- Snapshot Entries: 124
- Series Candidate Reviews: 103（publish 102 / hold 1 / reject 0）
- Series Index Progress Providers: 5
- Resume Checkpoints: 5
- Complete Series Providers: 0
- Latest Snapshot published exact matches: 55
- New Series candidates: 0
- Name drift: 0
- Missing from complete snapshot: 0
- Conflicts: 0

## 当前 Resume Checkpoint

| Provider | Latest Snapshot | Window | Resume after | 说明 |
| --- | --- | --- | ---: | --- |
| ATTACKERS | partial-003 | 2287 → 2312 | 2312 | 后续从官方索引中的 2312 锚点之后继续 |
| Madonna | partial-003 | 1565 → 1595 | 1595 | 后续从 1595 锚点之后继续 |
| MOODYZ | partial-002 | 3563 → 3567 | 3567 | 后续从 3567 锚点之后继续 |
| IDEAPOCKET | partial-002 | 940 → 944 | 944 | 后续从 944 锚点之后继续 |
| S1 | partial-002 | 571 → 575 | 575 | 后续从 575 锚点之后继续 |

## 下一阶段

### 0.4.x：Person Identity Multi-source Review

1. 先使用本地 MetaTube Candidate Set 作为 discovery seed，不直接 Promotion。
2. 优先审核当前 4 个精确命中正式 Person 的 Cluster，确认现有 alias/localized name 是否完整、是否存在错误方向或昵称污染。
3. 接入 Wikidata CC0 作为可再分发 Identity Seed，优先补 QID、多语言姓名与可靠外部 ID。
4. 评估 StashDB、Minnano-AV、Gfriends、WAPdB 作为 Resolver/Discovery 来源；在数据再发布许可不明确时继续只保留本地 candidate/provenance。
5. 为 Person Alias Review 设计明确决策：`accept-name / hold / reject / split-cluster`，避免把一个大 Cluster 整体无脑合并。
6. 只有具备独立来源证据的具体姓名才进入正式 `data/people`，并同步 Source Record；已有 Person 的稳定 ID 不因艺名变化而更换。
7. Series resume checkpoint 继续保留；Person Identity 工作不影响后续 Series Coverage 批次。
