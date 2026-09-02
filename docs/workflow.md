# Community Data Workflow

## 新实体

1. 搜索仓库，确认没有已有实体或别名记录。
2. `pnpm new <type>` 生成稳定 ID。
3. 创建 `library/<collection>/<id>.json`。
4. 创建 `sources/<id>.json`。
5. 在 `registry/community-ids.json` 增加 active 条目并按 ID 排序。
6. 检查所有引用 ID 已存在。
7. `pnpm check`。
8. 提交 Pull Request。

## 修改实体

- 保持 ID 不变。
- 新增/修正字段时同步更新 Source Record。
- 重大冲突在 PR 中解释为何采用新值。

## 疑似重复

不要自行删除其中一个实体。提交 Issue，并列出：

- 两个稳定 ID
- 重叠姓名/番号/关系
- 支持“同一实体”判断的来源
- 可能受影响的作品/关系

等待未来 Merge Plan / Redirect 机制统一处理。

V0-02 已提供 Merge Plan 与 Redirect 协议；具体状态流转与当前消费端限制见 [Merge 与 Redirect](merge-and-redirect.md)。
