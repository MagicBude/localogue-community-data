## 变更类型

- [ ] 新增人物
- [ ] 新增作品
- [ ] 新增 Maker / Label / Series / Genre
- [ ] 修正已有资料
- [ ] 来源补充
- [ ] 规范 / 工具修改

## 说明

请说明修改了什么，以及为什么。

## 来源

请确认正式实体已经同步更新 `sources/<entity-id>.json`。

## 检查

- [ ] 日文原始资料优先，翻译没有覆盖原文
- [ ] 未复制第三方长篇表达性文本
- [ ] 未加入未经许可的图片二进制
- [ ] 未加入私人 MediaFile / Tag / Presentation Preference
- [ ] 新实体使用 `<type>_<UUIDv4>` 稳定 ID
- [ ] 已运行 `pnpm check`
