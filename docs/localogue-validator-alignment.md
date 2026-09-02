# 与 Localogue Pack Validator 的对齐

## 当前可验证结论

2026-09-02 审查 GitHub 公开仓库 `MagicBude/Localogue` 时，远端只有 `main`，当前提交为 `e2483a1`，项目阶段仍是 V1-10；没有可读取的 V1-11 分支或 Tag。

因此本版本不声称已经与“尚未公开的 V1-11 实现”完全一致。当前能够诚实确认的是：

- `schemas/shared-pack-manifest.schema.json` 与 Localogue V1-10 完全一致；
- Localogue V1-10 能把本仓库根目录识别为有效 Shared Pack；
- Localogue V1-10 自己的 `scripts/validate-library.mjs` 能读取并校验本仓库 `library/`；
- `registry/`、`sources/` 和 `docs/` 是 Community Data 治理层，V1-10 不会加载它们；
- Community Validator 比消费端更严格，因为它还必须保护来源、稳定 ID、权利边界和发布历史。

## 双重验证

本仓库日常检查：

```bash
pnpm check
```

如果本地同时 Clone 了 Localogue，可以让 Localogue 自己读取本 Pack：

```bash
pnpm check:localogue -- ../Localogue
```

这个命令会：

1. 结构化比较双方 Manifest JSON Schema；
2. 创建一次性临时设置，把本仓库配置为 Shared Pack；
3. 调用指定 Localogue checkout 自带的资料库 Validator；
4. 删除临时设置；
5. 不修改 Localogue 仓库。

## V1-11 发布后的对齐步骤

1. 将 Localogue checkout 更新到明确的 V1-11 Tag 或提交。
2. 运行 `pnpm check:localogue -- <path>`。
3. 阅读 V1-11 的 Domain Model、Pack Resolver 与 Validator 变更。
4. 若 Manifest 或实体结构变化，先写兼容性说明，再同步 Schema 和 Community Validator。
5. 若 V1-11 实现 Redirect，必须确认其读取位置、解析顺序、循环防护和 Private Override 语义与本仓库一致。
6. 只有实际验证完成后，才把“V1-11 对齐”标为完成。
