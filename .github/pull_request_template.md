## 变更类型

- [ ] 新增人物
- [ ] 新增作品
- [ ] 新增 Maker / Label / Series / Genre
- [ ] 修正已有资料
- [ ] 来源补充
- [ ] Duplicate / Merge / Redirect
- [ ] 规范 / 工具修改

## 说明

请说明修改了什么，以及为什么。

## 来源

请确认正式实体已经同步更新 `sources/<entity-id>.json`，并说明每个来源实际支持哪些字段。

## ID Registry / Merge

请确认新实体已加入 `registry/community-ids.json`。如涉及合并，请提供 Merge Plan，并说明受影响引用如何迁移。

## 检查

- [ ] 日文原始资料优先，翻译没有覆盖原文
- [ ] 未复制第三方长篇表达性文本
- [ ] 未加入未经许可的图片二进制
- [ ] 未加入私人 MediaFile / Tag / Presentation Preference
- [ ] 新实体使用 `<type>_<UUIDv4>` 稳定 ID
- [ ] 新实体、Source Record 与 active Registry 条目在同一个 PR
- [ ] 没有自动模糊合并、Redirect 链或跨类型 Redirect
- [ ] applied Merge 保留了旧 ID 的 Source Record
- [ ] 已运行 `pnpm check`
