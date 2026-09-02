# Schemas

- `shared-pack-manifest.schema.json`：与 Localogue V1-10 Shared Pack Manifest 对齐。
- `source-record.schema.json`：Community Data 自己维护的来源记录协议。
- `community-id-registry.schema.json`：已发布 Community ID 的生命周期登记簿。
- `merge-plan.schema.json`：人工 Entity Merge 的提案、审核与应用记录。
- `person.schema.example.json` / `work.schema.example.json`：从 Localogue V1-10 同步的实体结构示例快照。

注意：Person / Work 当前仍是“结构示例快照”，真正的兼容性最终以 Localogue 主项目 Domain Model 与 Pack Validator 为准。V0-02 已提供 `pnpm check:localogue -- <path>` 做实际消费端验证；V1-11 公开后仍需再次同步审查。
