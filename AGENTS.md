# AGENTS.md — Localogue Community Data

本仓库是 Localogue 的**公共结构化元数据 Shared Pack**，不是 Localogue 程序仓库。

## AI 必须遵守

- 不修改 `MagicBude/Localogue` 主项目代码；本仓库任务只处理 Community Data。
- Community Data 是只读 Shared Base；用户 Private Library 永远可以覆盖它。
- 不提交 MediaFile、本地路径、用户 Tag、观看记录、评分、Presentation Preference 等私人状态。
- 不提交未经明确再分发授权的头像、封面、剧照或其他图片二进制。
- 不复制第三方网站的长篇简介、评论或文章；只记录事实或自行概括。
- 日文原始资料优先，翻译不能覆盖原文。
- 新人物/作品/Organization/Series 必须使用稳定顺序 ID，不以姓名、番号或标题生成永久主键。
- 实体 ID 格式使用 `<entity-type>_<六位顺序号>`；Merge Plan 继续使用 UUIDv4。
- 每个正式实体必须在 `registry/community-ids.json` 拥有 `active` 条目；已发布 ID 不得从 Registry 删除或复用。
- 不进行模糊自动实体合并。发现疑似重复时保留双方 ID，进入人工 Review/Merge 流程。
- Person Identity 的第三方 substitution / alias 清单只能作为 Candidate/Discovery 证据；`from=to` 的右侧不得自动解释为 canonical/current/former name。
- 未明确允许 CC0 再发布的整表或派生完整候选集必须留在 `.local/`，禁止提交到 `data/`、`library/`、`staging/` 或 `exports/`。
- Person 候选与现有正式人物只允许规范化后的完全姓名命中作为 Review 提示；禁止仅凭短昵称、罗马字相似或模糊匹配自动 Merge。
- Merge 必须使用 `registry/merge-plans/merge_<UUIDv4>.json`；没有已应用计划不得把 ID 改为 Redirect。
- Redirect 必须直接指向同类型 active ID，禁止 Redirect 链与跨类型合并。
- Localogue 消费端支持 Registry 前，真实 Merge 原则上只推进到 `approved`，不得贸然 `applied`。
- 正式人物、作品、Organization、Series 必须有 `sources/<entity-id>.json`。
- 修改数据后必须运行 `pnpm check`。
- `data/` 是唯一事实源；`library/`、`exports/csv/` 和 `exports/xlsx/` 均为生成物。
- `data/` 使用“一实体一 JSON”，文件名采用 `<id>--<可读-slug>.json`；生成到 `library/` 后文件名必须等于 `id`。
- `examples/` 只能使用完全虚构数据。

## 与主项目的关系

Localogue 通过 `/settings` → Shared Packs 挂载本仓库根目录。`localogue-pack.json` 是入口，真正读取的是 `library/`。

优先级：`Private Library > Shared Packs`。
