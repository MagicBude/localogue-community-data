# Community Stable ID Policy

## 为什么 ID 不能来自名字

姓名、艺名、旧艺名、中文译名、罗马字都可能变化；作品标题也可能修订。Community ID 必须代表“实体本身”，而不是某个当前显示文本。

## V0-01 冻结格式

使用 `<type>_<UUIDv4>`：

```text
person_550e8400-e29b-41d4-a716-446655440000
work_550e8400-e29b-41d4-a716-446655440001
maker_550e8400-e29b-41d4-a716-446655440002
label_550e8400-e29b-41d4-a716-446655440003
series_550e8400-e29b-41d4-a716-446655440004
genre_550e8400-e29b-41d4-a716-446655440005
```

生成：

```bash
pnpm new person
pnpm new work
pnpm new merge
```

## 规则

- ID 一经合并进入 `main`，不得因为改名、翻译修订、番号格式修订而更换。
- 不复用已经删除/合并实体的 ID。
- 疑似重复实体在 Merge 机制完成前保持两个 ID。
- 未来如果增加 Redirect / Alias Registry，旧 ID 必须能够解析到最终 Canonical ID，而不是直接失效。
- 正式实体必须同步登记到 `registry/community-ids.json`。
- Maker 与 Label 虽然都存放在 `organizations/`，仍分别使用 `maker_` 与 `label_` 前缀；不生成语义不明确的 `organization_` ID。
- Redirect 必须直接指向同类型 active ID，禁止跨类型 Redirect 和多跳 Redirect 链。

Registry 与 Merge 的完整规则见 [Community ID Registry](id-registry.md) 和 [Merge 与 Redirect](merge-and-redirect.md)。
