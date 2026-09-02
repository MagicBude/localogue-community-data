# 数据格式

## 目录

```text
library/
├── people/
├── works/
├── organizations/
├── series/
└── genres/
```

所有正式实体都是一个独立 UTF-8 JSON 文件：

```text
library/people/<person-id>.json
```

文件名必须等于 JSON 内 `id`。

## Person

关键原则：

- `schemaVersion: 1`
- 至少一个 `language: "ja" + type: "primary"` 姓名
- 中文使用 `localized`
- 英文/罗马字使用 `romanized`
- 别名、旧艺名、曾用名分别保留类型
- Partial Date 使用 `{ value, precision }`
- 未知字段省略，不编造

参见 `examples/library/people/`。

## Work

关键原则：

- `schemaVersion: 1`
- `code` 保存标准显示番号
- `originalLanguage` 默认 `ja`
- `titles.ja` 保存日文原题
- 人物、Maker、Label、Series、Genre 使用稳定 ID 关系
- Community Work 不记录私人 MediaFile
- Community Work 原则上不记录用户个人 Tag

参见 `examples/library/works/`。

## Organization

Maker 与 Label 都存放在 `organizations/`，使用 `kind` 区分。Label 可以通过 `parentOrganizationId` 指向 Maker。

## Series / Genre

Series 是作品系列实体；Genre 是受控分类实体。二者均必须拥有稳定 ID。
