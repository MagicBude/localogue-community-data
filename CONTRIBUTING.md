# 贡献指南

## 基本原则

1. **日文原始资料优先。** 人物至少保留一个 `ja + primary` 姓名；作品以日文原题作为 canonical 原始标题。
2. **事实与翻译分离。** 中文、英文是本地化映射，不覆盖日文原始字段。
3. **来源可追溯。** 正式人物、作品、Organization、Series 必须有 `sources/<entity-id>.json`。
4. **禁止用名称/番号当永久主键。** 新实体使用 `<类型>_<六位顺序号>`，删除后不复用。
5. **不做模糊自动合并。** 怀疑重复时先 Issue/PR 讨论，不自行换 ID 或删除旧实体。
6. **不提交私人数据。** 本地标签、观看记录、评分、MediaFile 路径、Presentation Preference 不属于 Community Data。
7. **不提交未经许可的图片和长篇第三方文本。**
8. **新实体同步登记 Registry。** 实体、Source Record 和 active ID 条目必须在同一个 PR。
9. **Merge 必须人工审核。** 不直接删除疑似重复实体，不创建 Redirect 链。
10. **第三方人物姓名表先进入 Candidate。** 未确认可 CC0 再发布的 substitution/alias 整表只保留在 `.local/`；`A=B` 不得直接改正式 Person。

## 推荐工作流

```bash
git checkout -b data/add-example-person
pnpm new person
# 新建 data/people/<id>--<readable-slug>.json
# 新建 data/sources/<id>.json
pnpm data:build
pnpm data:export:xlsx
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
- 对应的 active Registry 条目

## 新作品最低要求

- 稳定 `id`
- `schemaVersion: 1`
- 规范作品番号 `code`
- `originalLanguage: "ja"`
- 日文标题
- 已知人物/厂商/系列/Genre 使用现有稳定 ID
- 对应 `sources/<work-id>.json`
- 对应的 active Registry 条目

## Source Record 最低要求

- URL 必须是可公开核验的 `http` / `https` 地址，不使用搜索结果摘要。
- `accessedAt` 使用真实访问日期 `YYYY-MM-DD`。
- `fields` 填写来源实际支持的实体字段，例如 `names`、`titles.ja`、`releaseDate`。
- Person 至少有来源支持 `names`；Work 至少有来源支持 `code` 和 `titles`。
- Maker、Label、Series 至少有来源支持 `names`。

## 文本版权

可以记录事实，例如日期、番号、身高、公开职业状态等。不要把来源网站的长篇介绍原样复制到 `biographies` / `descriptions`。如需简介，请自行用事实进行简短概括，并在 source record 中保留核验来源。
