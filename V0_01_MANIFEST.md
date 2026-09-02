# Localogue Community Data V0-01 Manifest

## 目标

建立一个可以被 Localogue V1-09+ 直接以 Shared Pack 方式挂载的社区公共数据仓库，同时在开始大规模真实数据收集之前冻结最重要的数据治理边界。

## 本版本冻结

- Shared Pack 根目录与 `localogue-pack.json`
- `library/{people,works,organizations,series,genres}`
- 一实体一 JSON 文件
- 文件名与实体 ID 一致
- `<type>_<UUIDv4>` 稳定 ID
- 人物至少一个日文 primary name
- 作品日文原题优先
- 人物/作品/Organization/Series 必须配套 Source Record
- Community Data 不包含 MediaFile、私人 Tag、Presentation Preference
- 当前 Community Data 仓库不接受图片二进制
- 修改后必须通过 `pnpm check`

## 文件数量说明

正式 `library/` 初始为空。所有示例位于 `examples/`，不会被 Localogue 挂载。
