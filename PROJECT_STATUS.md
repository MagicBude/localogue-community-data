# Project Status

## 当前版本

- Pack Version: `0.2.0`
- Schema Version: `1`
- 阶段：ID Governance / 小规模真实数据试运行准备

## 已完成

- Shared Pack Manifest
- 标准 Library 目录
- UUIDv4 稳定 ID 初版规则
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

## 审查结论

- V0-01 基线 `pnpm check` 通过，正式 Library 为 0。
- 修正 `pnpm new:id organization` 会生成 Validator 不接受 ID 的不一致；Organization 现在必须明确选择 `maker` 或 `label`。
- 2026-09-02 可读取的 Localogue 公开主分支仍为 V1-10，未发现公开 V1-11 分支或 Tag；因此 V1-11 完整对齐仍待上游实现公开后复核。

## 下一阶段建议

1. 执行 Pilot A：3 人物 + 5 作品，验证最小真实数据闭环。
2. 分四批完成总计 10 人物 + 20 作品的端到端试运行。
3. 演练 Duplicate Issue 和 `proposed` Merge Plan；消费端支持 Redirect 前不应用真实合并。
4. Localogue V1-11 公开后重新运行契约检查并审查 Redirect 消费语义。
5. 完成至少一次 patch 数据修订和 Release / Tag 演练。
6. 后续再考虑大规模批量导入和独立 Community Asset Pack。
