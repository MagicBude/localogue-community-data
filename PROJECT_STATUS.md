# Project Status

## 当前版本

- Pack Version: `0.3.2`
- Schema Version: `1`
- 阶段：Work–Genre 引用试运行

## 已完成

- Shared Pack Manifest
- 标准 Library 目录
- 六位顺序稳定 ID
- 13 位真实人物主数据
- JSON → Shared Pack / CSV / XLSX 自动生成
- Entity Source Record
- 无依赖 Validator
- GitHub Actions 自动校验
- PR / Issue 模板
- 完整贡献、来源和许可文档
- 虚构示例数据
- Community ID Registry（active / redirect）
- 人工 Merge Plan Schema 与状态机
- Redirect 同类型、单跳和来源历史保留规则
- Registry / Merge / Source Record 一体化 Validator
- Localogue checkout 双重兼容性检查脚本
- 10 人物 + 20 作品真实数据 Pilot 方案
- Pilot A：桃乃木かな、石川澪、河北彩花 3 人物
- Pilot A：IPZ-637、IPZ-653、MIDE-974、MIDE-989、SSIS-129 共 5 作品
- 3 个 Maker 支撑实体、11 份 Source Record 与 11 个 active Registry 条目
- 325 个日中英三语分类条目
- 主题、角色、服装、体型与外观、行为、玩法与偏好、制作类别、媒介与格式、分级九个分面
- 分类总览、别名 CSV 与格式化 XLSX 自动导出
- 现有 5 部 Pilot A 作品已建立首轮保守 Genre 引用

## 审查结论

- V0-01 基线 `pnpm check` 通过，正式 Library 为 0。
- 修正 `pnpm new:id organization` 会生成 Validator 不接受 ID 的不一致；Organization 现在必须明确选择 `maker` 或 `label`。
- 2026-09-02 可读取的 Localogue 公开主分支仍为 V1-10，未发现公开 V1-11 分支或 Tag；因此 V1-11 完整对齐仍待上游实现公开后复核。
- Pilot A 的 MOODYZ 与 S1 数据由日文官方页直接核验；IdeaPocket 官方页抓取超时，两个早期作品由可公开读取的日文目录交叉核验并在 Source Record 中明示来源层级。
- Pilot A 没有引入图片、媒体文件、本地路径、用户 Tag 或其它私人状态。

## 下一阶段建议

1. 在 Localogue 中挂载 `0.3.2`，验证 5 部 Work 的 Genre 关联、分类显示与三语字段读取。
2. 执行 Pilot B：3 人物 + 5 作品，优先复用 Maker，并首次验证 Label / Series。
3. 为新作品继续采用来源明确支持的保守 Genre 映射，不根据演员印象或常见套路猜测。
3. 分四批完成总计 10 人物 + 20 作品的端到端试运行。
4. 演练 Duplicate Issue 和 `proposed` Merge Plan；消费端支持 Redirect 前不应用真实合并。
5. Localogue V1-11 公开后重新运行契约检查并审查 Redirect 消费语义。
6. 后续再考虑大规模批量导入和独立 Community Asset Pack。
