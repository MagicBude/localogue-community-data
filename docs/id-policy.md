# Community Stable ID Policy

## 实体 ID

正式实体使用“小写类型前缀 + 六位十进制顺序号”：

```text
person_000001
work_000001
maker_000001
label_000001
series_000001
genre_000001
```

姓名、标题和番号会变化，因此不能作为永久主键。顺序号一经发布不得修改、回收或复用；不同实体类型分别递增。

运行 `pnpm new person` 等命令可扫描 `data/` 并生成下一编号。多人 PR 撞号时，后合并的分支重新取号。

## 可读文件名

事实源文件采用：

```text
data/people/person_000001--momonogi-kana.json
```

`person_000001` 是稳定 ID；后面的 slug 只用于人工识别。Shared Pack 生成文件仍为 `library/people/person_000001.json`。

## Merge Plan

Merge Plan 不是实体，继续使用 `merge_<UUIDv4>`，避免并行审核时碰撞。Redirect 必须指向相同类型的 active 顺序 ID。
