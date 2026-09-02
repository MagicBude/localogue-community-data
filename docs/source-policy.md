# Source Record Policy

Community Data 的目标不是“抓到数据就算完成”，而是让重要事实能够回到公开来源核验。

## 文件位置

```text
sources/<entity-id>.json
```

一个 Source Record 对应一个 Community Entity，可以记录多个来源。

## 推荐来源优先级

1. 官方厂商 / Label / 系列页面
2. 官方事务所 / 官方人物资料页
3. 官方社交账号中明确发布的职业资料
4. 可靠的公开数据库
5. 其它可以独立核验的公开来源

## fields

每个来源可以声明它支持哪些字段，例如：

```json
{
  "url": "https://example.com/person/123",
  "kind": "official",
  "fields": ["names", "birthDate", "heightCm"]
}
```

## 禁止

- 不把“搜索结果摘要”当最终来源。
- 不记录需要登录后才能合法查看的私人内容。
- 不把来源页面整段文字复制进实体简介。
- 不虚构 accessedAt、URL 或字段来源。
