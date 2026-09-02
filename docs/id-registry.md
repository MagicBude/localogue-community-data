# Community ID Registry

## 1. 它解决什么问题

`library/` 只能告诉我们“当前有哪些活跃实体”，却无法单独回答：

- 某个 ID 是否曾经发布过；
- 旧 ID 是否已经合并到另一个 ID；
- 一个从 `library/` 消失的 ID 是被误删，还是经过审核后退休；
- 下游用户拿着旧 ID 时，应该迁移到哪里。

因此 V0-02 增加独立登记簿：

```text
registry/community-ids.json
```

它不是另一份人物/作品数据库，而是 **Community ID 生命周期索引**。

## 2. active 条目

```json
{
  "id": "person_550e8400-e29b-41d4-a716-446655440000",
  "entityType": "person",
  "collection": "people",
  "status": "active",
  "firstPublishedIn": "0.2.0"
}
```

含义：

- `id` 已经作为公共稳定 ID 发布；
- 当前应存在同名 `library/people/<id>.json`；
- `firstPublishedIn` 记录第一次进入正式 Pack 的版本，不因后续修订改变。

## 3. redirect 条目

```json
{
  "id": "person_旧UUID",
  "entityType": "person",
  "collection": "people",
  "status": "redirect",
  "firstPublishedIn": "0.2.0",
  "canonicalId": "person_新UUID",
  "mergePlanId": "merge_某个UUID",
  "retiredIn": "0.3.0"
}
```

含义：旧 ID 不再拥有独立活跃实体，但永远不能复用；它通过经过审核的 Merge Plan 指向最终 ID。

## 4. 为什么禁止 Redirect 链

本仓库只允许：

```text
旧 ID → active canonical ID
```

不允许：

```text
旧 ID A → 旧 ID B → active ID C
```

每多一层都会增加循环、断链和不同客户端解析结果不一致的风险。如果目标 ID 以后再次合并，必须把所有旧 Redirect 直接改指向新的 active ID，并保留各自 Merge Plan。

## 5. 登记规则

1. 新实体文件、Source Record 与 active Registry 条目必须在同一个 PR 中提交。
2. `entries` 按 `id` 升序排列，降低多人同时编辑时的 Git 冲突。
3. active 条目必须有实体；每个正式实体也必须有 active 条目。
4. redirect 条目不得继续保留同 ID 的 active 实体。
5. redirect 必须直接指向同一 `entityType` 的 active ID。
6. redirect 必须关联一个 `status: "applied"` 的 Merge Plan。
7. 已发布 ID 永不删除、永不复用。

这些约束由 `pnpm check` 自动验证。
