# Changelog

## 0.2.1 - 2026-09-02

- 完成 Pilot A：新增桃乃木かな、石川澪、河北彩花 3 个人物实体。
- 新增 5 部作品，并建立 Person → Work → Maker 的稳定 ID 引用闭环。
- 新增アイデアポケット、MOODYZ、エスワン 3 个 Maker 支撑实体。
- 为 11 个正式实体逐一新增 Source Record，并登记 active Community ID。
- 官方页可读时优先使用日文官方人物页、事务所页与作品页；IdeaPocket 旧页抓取超时时，明确使用可公开核验的日文目录来源，不伪造访问结果。
- 保持图片、MediaFile、用户 Tag、观看记录、评分与 Presentation Preference 为零。
- 新增 Pilot A 验证报告与 V0-03 覆盖包清单。

## 0.2.0 - 2026-09-02

- 新增 `registry/community-ids.json`，登记 active 与 redirect Community ID 生命周期。
- 新增人工 Merge Plan Schema、状态机、单跳 Redirect 与同类型合并规则。
- 扩展无依赖 Validator，校验 Registry、Merge Plan、来源字段、来源日期、URL 和 Organization 类型引用。
- 新增全仓库 JSON 语法检查、完整虚构 Pack Fixture 校验与 4 个 Validator 回归测试。
- 保留合并后旧 ID 的 Source Record，防止来源历史因实体退休而丢失。
- 新增 `pnpm check:localogue -- <path>`，使用指定 Localogue checkout 执行 Manifest Schema 与实际 Pack 读取双重验证。
- 修正 `pnpm new:id organization` 会生成无法入库 ID 的命令不一致；改为明确使用 `maker` 或 `label`。
- 新增 `pnpm new <type>` 简洁命令并支持生成 `merge_<UUIDv4>`。
- 新增 ID Registry、Merge / Redirect、Validator 对齐与首批真实数据 Pilot 教材级文档。
- 将首批真实数据范围冻结为 10 人物 + 20 作品，分四个小批次验证，不在本版本导入真实数据。

## 0.1.0 - 2026-09-02

- 初始化 Localogue Community Data Shared Pack 仓库结构。
- 冻结 `localogue-pack.json` 与 `library/` 基础协议。
- 建立 UUIDv4 稳定实体 ID 初版规则。
- 建立来源记录、贡献和再分发边界。
- 新增无第三方依赖的 Pack Validator、统计和 ID 生成脚本。
- 新增 GitHub Actions、Issue / PR 模板和 AI 协作规则。
- 新增完全虚构的 Person / Work / Organization / Series / Genre 示例。
