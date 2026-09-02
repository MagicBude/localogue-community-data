# 贡献指南

## 基本原则

1. **日文原始资料优先。** 人物至少保留一个 `ja + primary` 姓名；作品以日文原题作为 canonical 原始标题。
2. **事实与翻译分离。** 中文、英文是本地化映射，不覆盖日文原始字段。
3. **来源可追溯。** 正式人物、作品、Organization、Series 必须有 `sources/<entity-id>.json`。
4. **禁止用名称/番号当永久主键。** 新实体使用本仓库生成的稳定 ID。
5. **不做模糊自动合并。** 怀疑重复时先 Issue/PR 讨论，不自行换 ID 或删除旧实体。
6. **不提交私人数据。** 本地标签、观看记录、评分、MediaFile 路径、Presentation Preference 不属于 Community Data。
7. **不提交未经许可的图片和长篇第三方文本。**

## 推荐工作流

```bash
git checkout -b data/add-example-person
pnpm new:id person
# 新建 library/people/<id>.json
# 新建 sources/<id>.json
pnpm check
git add .
git commit
```

然后提交 Pull Request。

## 新人物最低要求

- 稳定 `id`
- `schemaVersion: 1`
- 至少一个日文 `primary` 姓名
- 已知时填写 `activityStatus`
- 对未知字段宁可省略，不猜测
- 对应 `sources/<person-id>.json`

## 新作品最低要求

- 稳定 `id`
- `schemaVersion: 1`
- 规范作品番号 `code`
- `originalLanguage: "ja"`
- 日文标题
- 已知人物/厂商/系列/Genre 使用现有稳定 ID
- 对应 `sources/<work-id>.json`

## 文本版权

可以记录事实，例如日期、番号、身高、公开职业状态等。不要把来源网站的长篇介绍原样复制到 `biographies` / `descriptions`。如需简介，请自行用事实进行简短概括，并在 source record 中保留核验来源。
