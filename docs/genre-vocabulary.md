# 三语分类词表

## 目标

本词表为作品提供稳定、可翻译、可检索的分类 ID。日文是规范原名，简体中文与英文用于显示和检索；改名或优化翻译时不改变 ID。

V0.3.1 首批收录 323 个公开常见概念；V0.3.2 根据现有作品标题补充“初体験”“性感開発”，现为 325 个。词表覆盖用户提供的五张分类截图、Averia 旧词表、Localogue 内置词表，以及日本公开作品目录中常见的分类叫法。

“越全越好”不等于把所有网站标签原样堆在一起。不同站点会把角色、服装、行为、清晰度和发行载体都称为 Genre；如果不分层，同一个作品会出现大量互相冲突的标签。因此每个条目必须指定 `facet` 和 `assignmentTarget`。

## 九个分面

| facet | 中文 | 用途 | 当前引用目标 |
| --- | --- | --- | --- |
| `theme` | 主题 | 故事、场景、关系与题材 | `genreIds` |
| `role` | 角色 | 作品中的身份或人物设定 | `genreIds` |
| `wardrobe` | 服装 | 服饰、制服与造型 | `genreIds` |
| `body` | 体型与外观 | 可观察的身体或外观特征 | `genreIds` |
| `act` | 行为 | 作品明确表现的行为 | `genreIds` |
| `practice` | 玩法与偏好 | 场景玩法、关系偏好或 fetish | `genreIds` |
| `production` | 制作类别 | 合集、VR、纪录片等作品形式 | 未来 `workType` |
| `media` | 媒介与格式 | DVD、Blu-ray、流媒体、4K 等 | 未来 `mediaFormat` |
| `rating` | 分级 | R-15、R-18 等年龄区分 | 未来 `contentRating` |

`production`、`media`、`rating` 当前也生成 Genre 实体，目的是让 Shared Pack 和表格先拥有稳定对照 ID；但其 `assignmentTarget` 明确表明它们最终不应永久塞入 `Work.genreIds`。Localogue 增加相应字段后可无损迁移。

## 数据结构

```json
{
  "schemaVersion": 1,
  "id": "genre_000001",
  "facet": "theme",
  "facetNames": { "ja": "テーマ", "zh-CN": "主题", "en": "Theme" },
  "assignmentTarget": "genreIds",
  "names": { "ja": "美少女", "zh-CN": "美少女", "en": "Beautiful Girl" },
  "aliases": { "ja": [], "zh-CN": [], "en": [] },
  "status": "active",
  "translationStatus": "reviewed",
  "contentContext": "adult-metadata"
}
```

同一个表面词可以在不同分面拥有不同 ID。例如“女王”作为角色和作为玩法不是同一个概念；同一分面内则禁止重复日文规范名。

## 别名与敏感旧称

站点旧称、缩写和中文社区俗称写入 `aliases`，默认界面只显示 `names`。过时、含贬义或可能误导的叫法不得作为规范名。例如规范名使用“跨性别女性 / Transgender Woman”，历史站点用语只作为检索别名保留。

别名不是新的 Genre，不得分配第二个 ID。发现同义词时，应把它追加到已有条目，而不是新增实体。

## 来源边界

词表是对多个公开分类系统的事实性整理和自行翻译，不复制第三方简介。主要依据层级如下：

1. 用户提供的分类截图，用于确保迁移时不漏掉已有中文入口；
2. 仓库内 Averia 与 Localogue 既有词表，用于保持已使用术语兼容；
3. 日本厂商、发行平台和公共资料中的日文常用名称，用于确定规范日文名；
4. 中文与英文名称由项目自行翻译，存在语义歧义时保留原词为别名。

没有可靠读法或仅由截图 OCR 猜出的词不会进入规范表。后续新增网站词条时必须先进行“精确匹配 → 别名匹配 → 人工审核”，不得模糊自动合并。

## 浏览与维护

人工维护 `data/genres/genre_XXXXXX--slug.json`，然后运行：

```bash
pnpm data:build
pnpm data:export:xlsx
pnpm check
```

导出物包括：

- `exports/csv/genre-overview.csv`：一行一个规范条目；
- `exports/csv/genre-aliases.csv`：一行一个别名，方便反向查找；
- `exports/xlsx/localogue-community-data.xlsx`：含“分类词表”和“分类别名”工作表。

不要直接编辑 `library/genres/`、`exports/csv/` 或 XLSX；它们都是生成物。
