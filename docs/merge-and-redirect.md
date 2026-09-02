# Entity Merge 与 Redirect 工作流

## 1. Merge 不是“删掉重复文件”

两个实体看起来相似，不代表它们一定相同。姓名相同、番号相近、翻译相同都只能形成候选，不能直接触发自动合并。

真正的 Merge 至少涉及：

- 身份证据；
- source / target 方向；
- 所有入站引用迁移；
- 旧来源历史保留；
- 旧 ID 到最终 ID 的 Redirect；
- Pack 版本与变更记录。

所以每次合并使用独立文件：

```text
registry/merge-plans/merge_<UUIDv4>.json
```

## 2. sourceId 与 targetId

- `sourceId`：合并后退休的 ID。
- `targetId`：合并后继续 active 的 canonical ID。

target 的选择不是“哪个名字更好看”，优先考虑：

1. 哪个 ID 更早公开发布；
2. 哪个实体拥有更完整、可靠的来源历史；
3. 哪个 ID 已被更多作品或下游 Pack 引用；
4. 是否存在无法安全迁移的外部依赖。

## 3. 状态机

```text
proposed → approved → applied
    └──────────────→ rejected
```

- `proposed`：只是疑似重复，双方 ID 都保持 active。
- `approved`：人工审核确认应合并，但引用迁移尚未完成，双方仍保持 active。
- `applied`：引用已迁移，source 从 `library/` 移除并在 Registry 变为 redirect。
- `rejected`：审核认定不是同一实体，双方继续 active。

状态不能靠模糊匹配脚本自动推进。

## 4. applied 前检查清单

1. `sourceId` 与 `targetId` 类型相同。
2. 至少有一个可公开核验的证据 URL，并说明它证明了什么。
3. 列出 `affectedEntityIds`，逐个检查引用迁移。
4. 将 Work、Organization、Series 等对 source 的引用改为 target。
5. 合并非冲突事实；冲突字段在 PR 中说明采用依据。
6. 保留 `sources/<sourceId>.json`，避免来源历史随实体文件一起消失。
7. 将 source Registry 条目改为 redirect，并直接指向 active target。
8. 更新 Pack 版本、CHANGELOG，运行 `pnpm check`。

## 5. 当前 Localogue 兼容性边界

Localogue 当前公开主分支是 V1-10，它只读取 `localogue-pack.json` 和 `library/`，尚不读取本仓库的 `registry/`。

因此 V0-02 先冻结协议、Schema 和 Validator，但在 Localogue 消费端正式支持 Redirect 解析之前，真实数据原则上只推进到 `approved`，不要急于把已有公共 ID 改成 `applied`。否则持有旧 ID 的私人 Library 或其它 Pack 无法自动迁移。
