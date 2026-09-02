# Community ID Registry

这里保存 Community ID 的生命周期记录，以及经过人工审核的实体合并计划。

```text
registry/
├── community-ids.json
└── merge-plans/
    └── merge_<UUIDv4>.json
```

- `community-ids.json` 是已发布 ID 的登记簿。活跃实体和已经退休的 Redirect ID 都必须保留在这里。
- `merge-plans/` 保存人工审核过程。没有 Merge Plan，活跃 ID 不得直接变成 Redirect。
- 这些文件当前属于 Community Data 的治理元数据，不在 Localogue V1-10 的 `library/` 读取范围内。

完整规则见：

- [`docs/id-registry.md`](../docs/id-registry.md)
- [`docs/merge-and-redirect.md`](../docs/merge-and-redirect.md)
