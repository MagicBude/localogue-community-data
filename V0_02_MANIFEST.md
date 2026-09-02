# Localogue Community Data V0-02 Manifest

## 目标

在正式录入真实人物和作品之前，冻结 Community ID 的发布、退休、合并和 Redirect 规则，并建立能够同时由 Community Data 与 Localogue 消费端验证的检查路径。

## 本版本新增冻结

- `registry/community-ids.json` 作为已发布 ID 生命周期登记簿。
- 正式实体必须拥有 active Registry 条目。
- 已发布 ID 永不删除、永不复用。
- Merge 使用 `merge_<UUIDv4>` 独立计划文件。
- Merge 状态为 `proposed → approved → applied` 或 `rejected`。
- applied 后 source ID 变为 redirect，直接指向同类型 active target。
- 禁止 Redirect 链、循环与跨类型合并。
- 合并后保留旧 `sources/<sourceId>.json`。
- Source Record 的 URL、访问日期、kind、fields 与最低字段覆盖进入 Validator。
- Organization 必须明确使用 `maker_` 或 `label_` ID，不生成 `organization_` ID。
- Manifest 继续保持 Localogue V1-10 schemaVersion 1，不在消费端实现公开前擅自增加 Manifest 字段。

## 兼容性结论

- 本仓库 Manifest Schema 与 2026-09-02 可读取的 Localogue V1-10 主分支一致。
- 本 Pack 已通过 Localogue 自带 `scripts/validate-library.mjs` 的挂载读取验证。
- Localogue 公开仓库当时没有 V1-11 分支或 Tag；V1-11 完整对齐仍为待办事项。
- V1-10 不读取 `registry/`，因此真实 Merge 在消费端支持 Redirect 前原则上不得推进到 applied。

## 数据范围

正式 `library/` 继续保持为空。本版本只建立治理协议、验证脚本和虚构示例；下一版本从 Pilot A 的 3 人物 + 5 作品开始录入真实数据。
