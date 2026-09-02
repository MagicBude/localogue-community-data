# 新对话启动提示词

我已经创建并初始化 GitHub 仓库：
https://github.com/MagicBude/localogue-community-data

这是 Localogue 的独立 Community Data 仓库，不是主程序仓库。主程序仓库是：
https://github.com/MagicBude/Localogue

当前 Community Data 仓库已经完成 V0-01 Bootstrap，包含：
- `localogue-pack.json`
- `library/{people,works,organizations,series,genres}`
- `sources/`
- `<type>_<UUIDv4>` 稳定 ID 初版规则
- Source Record 协议
- `pnpm check` 无依赖校验器
- `pnpm stats`
- `pnpm new:id <type>`
- GitHub Actions / Issue / PR 模板
- CC0-1.0 与权利边界说明
- 完全虚构 examples
- AGENTS / CONTRIBUTING / docs / PROJECT_STATUS / CHANGELOG

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
- 检查当前 V0-01 初始化内容；
- 完善 Community ID Registry / Redirect / Merge 预案；
- 与 Localogue V1-11 Pack Validator 对齐；
- 设计首批真实数据录入与 Source Record 工作流；
- 先选 10–50 个真实人物/作品进行小规模端到端验证；
- 不要一次性导入海量真实数据，先验证 ID、引用、来源、修订和共享升级流程。

用户对数据库和 Web 架构仍在学习，因此重要代码和文档要解释“为什么这样设计”，不要只给结论。
