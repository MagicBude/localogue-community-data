# 新对话启动提示词

我已经创建并初始化 GitHub 仓库：
https://github.com/MagicBude/localogue-community-data

这是 Localogue 的独立 Community Data 仓库，不是主程序仓库。主程序仓库是：
https://github.com/MagicBude/Localogue

当前 Community Data 仓库已经完成 V0-03 Real Data Pilot A，Pack 版本为 `0.2.1`，包含：
- `localogue-pack.json`
- `library/{people,works,organizations,series,genres}`
- `sources/`
- `<type>_<UUIDv4>` 稳定 ID 初版规则
- `registry/community-ids.json` active / redirect 生命周期登记
- `registry/merge-plans/merge_<UUIDv4>.json` 人工合并计划
- 禁止 Redirect 链、跨类型 Redirect 和模糊自动合并
- Source Record 协议
- `pnpm check` 无依赖校验器与内置回归测试
- `pnpm check:localogue -- <path>` 消费端契约检查
- `pnpm stats`
- `pnpm new <type>` / `pnpm new:id <type>`
- GitHub Actions / Issue / PR 模板
- CC0-1.0 与权利边界说明
- 完全虚构 examples
- AGENTS / CONTRIBUTING / docs / PROJECT_STATUS / CHANGELOG
- 3 位真实人物：桃乃木かな、石川澪、河北彩花
- 5 部真实作品：IPZ-637、IPZ-653、MIDE-974、MIDE-989、SSIS-129
- 3 个 Maker 支撑实体与 11 份逐实体 Source Record

请先阅读仓库中的 README.md、AGENTS.md、PROJECT_STATUS.md、CONTRIBUTING.md 和 docs，不要猜测当前规范。

我们的目标：
1. 维护可共享的公开结构化元数据，让每个 Localogue 用户不必重复搜集同样的人物/作品资料；
2. Community Data 作为只读 Shared Base，用户 Private Library 永远优先；
3. 日文原始资料优先，中文/英文作为本地化映射；
4. 不共享 MediaFile、本地路径、用户 Tag、观看记录、评分、Presentation Preference 等私人状态；
5. 当前仓库不提交未经明确再分发许可的头像、封面、剧照等图片；未来图片走独立 Community Asset Pack；
6. 不复制第三方网站长篇简介，只记录事实或自行概括；
7. 正式人物、作品、Organization、Series 必须有 `sources/<entity-id>.json`；
8. 新实体使用带类型前缀的 UUIDv4 稳定 ID，已发布 ID 不因改名/翻译变化而改变；
9. 不做模糊自动合并，疑似重复先保留双方 ID 并人工审核；
10. 修改后必须运行 `pnpm check`。

接下来请专注于 `localogue-community-data`，不要修改 Localogue 主项目。希望你继续按“教材级中文文档 + 清晰架构 + 可验证脚本 + 每一步完整 ZIP 覆盖包 + 中文 Conventional Commit 完整提交信息”的方式推进。

下一阶段建议从这里开始：
- 先在 Localogue 中实际挂载 Pilot A，验证 Private Library > Shared Pack；
- 核对 5 个 Work 的 Person 与 Maker 关系是否在界面中正确解析；
- 挂载验收通过后执行 Pilot B：再录入 3 个真实人物 + 5 个真实作品；
- 继续优先使用无需登录即可核验的日文官方页面；
- 实体、Source Record、active Registry 条目继续在同一个批次提交；
- 分四批完成总计 10 人物 + 20 作品；
- 演练 Duplicate Issue 与 proposed Merge Plan，但消费端支持 Redirect 前不应用真实 Merge；
- Localogue V1-11 公开后重新执行完整契约对齐。

用户对数据库和 Web 架构仍在学习，因此重要代码和文档要解释“为什么这样设计”，不要只给结论。
