# Localogue Community Data Manifest

当前 Pack 版本：**0.4.4**

基线版本：`0.4.3 — Series Registry Batch A`

## 当前正式数据

| 数据集 | 数量 | 说明 |
| --- | ---: | --- |
| People | 13 | 本阶段不扩量 |
| Works | 5 | 延续 Pilot A |
| Organizations | 86 | 5 Maker + 81 Label，本阶段不新增正式 Organization |
| Series | 17 | 本阶段不新增正式 Series，先建立批量发现流水线 |
| Genres | 325 | 延续核心受控词表 |
| Registry Active | 446 | 本阶段不新增正式 Community ID |
| Registry Redirect | 0 | 本阶段无 Merge |
| Merge Plans | 0 | 本阶段无 Merge |

## 0.4.4 新增治理与 Staging 数据

- Series Index Provider Registry：2 个 Provider（ATTACKERS / Madonna）；
- Series Index Snapshot：2 份 partial snapshot；
- Snapshot Entries：20 条；
- Series Index Diff：1 条 `published` 精确命中、19 条 `candidate-new`；
- `published-name-drift`：0；
- `candidate-existing-name`：0；
- `missing-from-complete-index`：0；
- conflict：0。

## Series Index Snapshot / Enumerator

0.4.4 将 Series 批量建设拆成：

`官方 Series Index → Snapshot → Diff / Candidate → 人工审核 → 正式 Series + Source Record + approved Mapping`

新增命令：

```bash
pnpm series:index:snapshot -- attackers
pnpm series:index:snapshot -- madonna
pnpm series:index:diff
```

Snapshot 默认是 partial。只有操作者确认当前公开索引确实完整遍历时，才允许显式使用 `--complete`；即使完整快照出现，脚本也不会自动创建、合并、删除或 Redirect 正式实体。

## 当前 Snapshot Coverage

### ATTACKERS

- 已发布 approved Series：8；
- partial snapshot：10 条；
- 与已发布重叠：1 条（奴隷島 / `attackers.series:2256`）；
- 联合发现：17；
- snapshot 待审核新候选：9；
- Series completeTraversal：false。

### Madonna

- 已发布 approved Series：3；
- partial snapshot：10 条；
- 与已发布重叠：0；
- 联合发现：13；
- snapshot 待审核新候选：10；
- Series completeTraversal：false。

两份 snapshot 都只是工作流验证用的官方索引 partial snapshot，不得解释成完整 Series Index 覆盖。

## Registry / Mapping

- Public Source Registry：6 个来源；
- approved External ID Mapping：98 条；
- Organization Candidate：1 条（株式会社WILL）；
- Provider Observation：98 条；
- Provider reconciliation：98 条全部由 approved 外部 ID 精确命中；
- Series Snapshot 候选与 approved Mapping 分开治理，不会直接进入 Provider Observation 或正式 Registry。

## 安全边界

- Snapshot 不占 Community ID；
- Snapshot 中的同名只用于候选提示，不自动合并；
- approved Provider 外部 ID 仍是正式自动关联白名单；
- 完整 Snapshot 暂时看不到一个历史正式 ID 时只产生 `missing-from-complete-index`，禁止自动删除；
- 不根据搜索结果数量、AI 推测或标题相似度声明完整覆盖；
- 本阶段不导入大量 Work，不提交图片和私人状态。
