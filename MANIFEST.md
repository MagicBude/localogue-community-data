# Localogue Community Data Manifest

本文件是仓库唯一的总清单，后续版本直接覆盖更新，不再新增 `V0_XX_MANIFEST.md`。

## 当前版本

- Pack：`0.3.2`
- Schema：`1`
- 阶段：Work–Genre Pilot

## 正式数据

- Person：13
- Work：5
- Organization：3
- Series：0
- Genre：325
- Registry Active：346
- Registry Redirect：0
- Merge Plan：0

## 当前能力

- `data/` 单实体 JSON 唯一事实源
- 六位顺序稳定 ID
- Shared Pack、Registry、CSV、XLSX 自动生成
- 日文、简体中文、英文三语分类词表
- 九个分类分面与三语别名
- 5 部 Pilot A 作品的保守 Genre 引用
- Source Record、Registry、Merge/Redirect 校验
- Localogue Shared Pack 实际读取检查

## 发布前验证

```bash
pnpm data:build
pnpm data:export:xlsx
pnpm check
pnpm stats
```

详细历史变更统一查看 `CHANGELOG.md`，当前进度与下一步统一查看 `PROJECT_STATUS.md`。
