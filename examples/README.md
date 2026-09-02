# Fictional Examples

这里所有人物、作品、Organization、Series、Genre 均为完全虚构数据。

`examples/` 不属于 Pack 的 `library/`，Localogue 挂载本仓库时不会读取这些示例。

`examples/registry/` 演示已应用 Merge 后“旧 ID 保留为 Redirect、目标 ID 继续 active”的状态。示例 ID、证据 URL 和说明同样完全虚构。

`examples/localogue-pack.json` 让整套示例可以作为独立 Fixture 交给正式 Validator。根目录执行 `pnpm check` 时会同时校验空的正式 Pack、完整虚构 Fixture 和 Validator 回归测试。
