# Release Process

当前 Pack 使用独立版本号，例如：

```text
0.1.0
0.1.1
0.2.0
```

建议：

- 数据修正、小批量实体新增：patch
- 数据协议/目录策略扩展：minor
- 不兼容 Pack Schema：major

发布前：

```bash
pnpm check
pnpm stats
```

然后同步更新：

- `localogue-pack.json.version`
- `localogue-pack.json.updatedAt`
- `CHANGELOG.md`

如果本次新增或退休 ID，还要确认：

- `registry/community-ids.json` 的 `firstPublishedIn` / `retiredIn` 与发布版本一致；
- applied Merge Plan 已完成引用迁移并保留旧 Source Record；
- Registry 没有 Redirect 链。

再创建 Git Tag / GitHub Release。
