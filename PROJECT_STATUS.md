# Project Status

## 当前版本

`0.4.0 — Organization & Series Registry Foundation`

基线：0.3.2 / `c59e6711c26925b0eb446e63c6dc0d48b208d941`

## 已完成

1. 冻结 Group / Company / Maker / Label 的语义边界与父级矩阵。
2. 建立 Organization 与 Series Foundation Schema。
3. 建立 Public Source Registry，覆盖范围按 Provider/来源记录，不再使用“全世界分类已经完整”一类无法证明的表述。
4. 建立 Candidate/Staging 层，使未审核关系不会直接污染正式 Shared Pack。
5. 建立 approved External ID Mapping 与 Provider Observation。
6. 建立精确对账流程：稳定外部 ID、日文规范名、已登记别名可以唯一精确匹配；番号前缀和标题信号只能产生建议；模糊/AI 推测禁止自动写入。
7. 正式新增 2 个 MOODYZ Label 与 4 个高复用官方 Series。
8. 将株式会社WILL 作为已核验 Company Candidate 保存；在 Localogue 尚未一等支持 Company 前不伪装成 Maker。
9. 扩展 CSV/XLSX 人工浏览导出。
10. 修正 Registry 生成逻辑：保留已发布 Redirect；active ID 从 data 消失时直接阻止生成，避免历史 ID 静默丢失。

## 当前正式统计

- People: 13
- Works: 5
- Organizations: 5（Maker 3 / Label 2）
- Series: 4
- Genres: 325
- Registry Active: 352
- Registry Redirect: 0
- Merge Plans: 0
- Public Sources: 4
- External ID Mappings: 6
- Organization Candidates: 1

## 当前已知边界

- IdeaPocket / MOODYZ / S1 的公开目录尚未完整遍历所有分页，因此不能声明 Provider 当前目录已完整覆盖。
- Group/Company 的正式 Shared Pack 发布仍等待 Localogue 消费契约升级。
- WILL 与现有 Maker 的品牌/法人父子关系没有在本阶段仅凭搜索摘要或第三方数据推断。
- Series 数量持续增长，本项目目标是建立可持续枚举/审核工作流，而不是一次性收全。

## 下一阶段建议

### 0.4.x：Organization Registry 扩充

1. 继续从官方集团/公司/Maker/Label 页面收集第一批主流 Organization；
2. 优先补齐 Maker ↔ Label 的稳定官方外部 ID；
3. 对 Group/Company 建立更多可核验 Candidate，并准备 Localogue 一等 kind 消费契约；
4. 增加冲突与未识别样本，验证人工审核流程。

### 随后：Provider Series 枚举

在 Maker/Label 基础更稳定后，再按 Provider 分批遍历 Series，并按来源输出 discovered/reviewed/published/conflicts/unrecognized 与 `completeTraversal`。
