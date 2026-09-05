# Localogue Community Data Manifest

当前 Pack 版本：**0.4.11**

基线版本：`0.4.10 — Series Coverage Checkpoint Foundation`

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 本版本不自动新增人物，仅增加 Identity Candidate 基础 |
| Works | 5 | 保持不变 |
| Organizations | 86 | 5 Maker + 81 Label，保持不变 |
| Series | 119 | 保持 0.4.10 Coverage Checkpoint 基线 |
| Genres | 325 | 保持核心受控词表 |
| Registry Active | 548 | 本版本不新增正式实体 ID |
| Registry Redirect | 0 | 本版本无 Merge |
| Merge Plans | 0 | 本版本无 Merge |
| Public Sources | 7 | 新增 MetaTube Actor substitution discovery source |
| External ID Mappings | 200 | MetaTube 无稳定人物 ID，不建立 approved Mapping |

## 0.4.11 Person Identity Candidate Foundation

本版本新增 People 的第三方 identity discovery 管线，但明确区分“候选关系”和“正式人物事实”。

MetaTube Discussion #491 的 `substitution.Actor.txt` 采用 `from=to` 格式。该方向用于媒体元数据替换，不能被自动解释为人物当前艺名、规范名或改名时间方向。

本地导入命令：

```bash
pnpm people:identity:import:metatube -- --input "D:/Downloads/substitution.Actor.txt"
pnpm people:identity:validate
```

默认输出：

```text
.local/staging/person-identity-candidates.json
.local/staging/person-identity-candidates.csv
```

`.local/` 已被忽略，因此第三方原始/派生完整候选集不会进入 CC0 Shared Pack。

## 当前 MetaTube 本地审计结果

- Raw mappings：707
- Unique mappings：704
- Duplicate mappings：3
- Unique source names：701
- Unique names：926
- Candidate clusters：226
- Conflict sources：3
- Self mappings：3
- Transitive sources：5
- Parse errors：0
- Exact-match clusters against formal People：4
- Multi-Person exact-match clusters：0

这些数字只表示候选关系结构，不表示 226 个已核验人物。

## Identity 安全边界

- `substitution target` 不等于 canonical name。
- 连通 Cluster 只表示“应一起审核”，不等于“全部姓名已确认属于同一人”。
- 对现有 Person 只允许规范化完全姓名匹配作为提示。
- 禁止编辑距离、AI 相似度、罗马字猜测或短昵称自动 Merge。
- `resolution.communityId`、`canonicalName` 默认保持 `null`，`publish=false`。
- 冲突 source、短名、称呼、传递链必须进入人工 Review。
- 未明确允许 CC0 整库再发布的数据只保留 `.local/`。
- 正式 Person 姓名变更仍必须有 Source Record 支持 `names`。

## Series Coverage 基线保持

0.4.10 的以下状态全部保持：

| Provider | Latest Window | Resume anchor | Chain Depth | Complete |
| --- | --- | ---: | ---: | --- |
| ATTACKERS | 2287 → 2312 | 2312 | 3 | no |
| Madonna | 1565 → 1595 | 1595 | 3 | no |
| MOODYZ | 3563 → 3567 | 3567 | 2 | no |
| IDEAPOCKET | 940 → 944 | 944 | 2 | no |
| S1 | 571 → 575 | 575 | 2 | no |

`attackers.series:2273` 继续 hold，不受 Person Identity 工作影响。

## 校验变化

新增 Person Identity Candidate 回归测试 5 条。基线仓库实际脚本测试为 23 条，本版本完整脚本测试应为 **28/28**。

本版本不新增按版本命名的 Manifest；继续只维护根目录本文件。
