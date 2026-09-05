# Person Identity Candidate 工作流

> 适用版本：0.4.11

Localogue Community Data 把“发现两个名字可能属于同一人”和“正式确认它们属于同一 Person”分开处理。

## 1. 为什么需要独立 Candidate 层

媒体刮削社区常见 `A=B` substitution 表。它们适合发现：

- 日文/中文写法差异；
- 罗马字或英文显示名；
- 旧艺名、作品署名、昵称；
- 可能属于同一人物的多组姓名。

但 `=` 的方向通常只代表插件最终想显示哪个字符串，并不等于人物的改名时间线，也不证明右侧就是当前 canonical name。

因此第三方姓名表不能直接写入 `data/people`。

## 2. MetaTube Actor substitution

公开来源登记为：

```text
source_metatube_actor_substitution
https://github.com/metatube-community/jellyfin-plugin-metatube/discussions/491
```

本轮使用的 `substitution.Actor.txt` 在本地解析得到：

- 707 条原始映射；
- 704 条唯一映射；
- 701 个唯一左侧 source；
- 926 个不同姓名；
- 226 个 identity candidate cluster；
- 3 个同一 source 多目标冲突；
- 3 个自映射；
- 5 个 source 存在真正的两步关系；
- 0 个解析错误。

这些数字描述**候选关系结构**，不是已验证人物数量。

## 3. 本地导入

第三方文件不要复制进仓库。下载后直接执行：

```bash
pnpm people:identity:import:metatube -- --input "D:/Downloads/substitution.Actor.txt"
pnpm people:identity:validate
```

默认生成：

```text
.local/staging/person-identity-candidates.json
.local/staging/person-identity-candidates.csv
```

`.local/` 已被 `.gitignore` 忽略。

## 4. Cluster 语义

例如：

```text
美谷あかり → 美谷朱里 → 美谷朱音
谷坂かな   → 美谷朱里
吉見いりあ → 美谷朱里
```

导入器会把它们放进同一个连通 Cluster，但仍保留原始有向 edge。Cluster 只表示“这些姓名值得作为同一身份候选一起审核”。

导入器不会选择 `美谷朱音`、`美谷朱里` 或任何其它名称作为 canonical。

## 5. Review Flags

当前可能出现：

- `conflicting-source`：同一个 source 指向多个目标；
- `self-mapping`：A→A；
- `contains-short-name`：包含极短昵称/单名；
- `contains-honorific`：包含 `さん`、`ちゃん` 等称呼；
- `contains-transitive-chain`：存在 A→B→C；
- `multiple-community-matches`：一个 Cluster 精确命中了多个正式 Person。

任何 Flag 都只是审核提示，不是自动合并结论。

## 6. 与正式 Person 的匹配

导入器会读取 `data/people/*.json` 的全部 `names[].value`，只进行：

- Unicode NFKC；
- 首尾空白清理；
- 连续空白折叠；
- 大小写规范化；
- 然后完全相等比较。

不会使用编辑距离、拼音/罗马字猜测、AI 相似度或短昵称自动归并。

即使一个 Candidate Cluster 精确命中现有 Person，`resolution.communityId` 仍保持 `null`，`publish=false`。正式修改必须人工审核，并遵循现有 Source Record / Merge Plan 规则。

## 7. 许可边界

MetaTube Discussion 的清单可公开访问，但当前没有把附件整表再授权为 CC0 的明确声明。因此：

- 原始附件不提交；
- 完整派生 Candidate Set 不提交；
- Public Source Registry 只记录来源存在、工作流和审计统计；
- 最终进入 Community Data 的姓名必须由可合法再分发、可独立核验的证据支持。

这让 MetaTube 可以发挥“发现线索”的价值，又不会把第三方数据库整体重新授权进 CC0 Pack。
