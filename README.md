# Localogue Community Data

Localogue 的社区公共元数据 Shared Pack。

这个仓库只负责**可共享的结构化公共资料**；Localogue 程序本身位于 [`MagicBude/Localogue`](https://github.com/MagicBude/Localogue)。

## 为什么单独一个仓库

同一个公开人物、作品、厂商和系列不应该由每个 Localogue 用户从零重复整理。因此社区可以共同维护一份只读基础资料，用户在本地继续拥有更高优先级的修正和展示偏好。

Localogue 的读取优先级是：

```text
Private Library
    > Shared Pack 1
    > Shared Pack 2
    > ...
```

因此社区资料永远不会强制覆盖用户自己的本地资料；用户选择自己喜欢的头像/封面时，也应使用 Localogue 的 Presentation Preference，而不是修改社区事实数据。

## 仓库结构

```text
localogue-community-data/
├── localogue-pack.json
├── library/
│   ├── people/
│   ├── works/
│   ├── organizations/
│   ├── series/
│   └── genres/
├── sources/
├── registry/
│   ├── community-ids.json
│   └── merge-plans/
├── schemas/
├── examples/
├── scripts/
└── docs/
```

正式数据遵循“一实体一 JSON 文件”。`examples/` 只包含虚构示例，不会被 Localogue 当成 Shared Pack 数据读取。

## 快速开始

要求 Node.js 22+。本仓库没有第三方运行依赖。

```bash
pnpm check
pnpm stats
pnpm new person
```

### 接入 Localogue

1. Clone 本仓库，例如：

```bash
git clone https://github.com/MagicBude/localogue-community-data.git D:/Localogue-Packs/localogue-community-data
```

2. 启动 Localogue，进入 `/settings`。
3. 在 **Shared Packs** 中添加仓库根目录：

```text
D:/Localogue-Packs/localogue-community-data
```

4. 保存。Localogue 会读取根目录的 `localogue-pack.json`，并把 `library/` 作为只读基础资料挂载。

## 贡献前必须阅读

- [贡献指南](CONTRIBUTING.md)
- [数据格式](docs/data-format.md)
- [稳定 ID 规则](docs/id-policy.md)
- [Community ID Registry](docs/id-registry.md)
- [Merge 与 Redirect](docs/merge-and-redirect.md)
- [来源与证据](docs/source-policy.md)
- [共享边界与许可](docs/licensing-and-rights.md)
- [Localogue 接入说明](docs/localogue-integration.md)
- [Localogue Validator 对齐](docs/localogue-validator-alignment.md)
- [首批真实数据试运行](docs/real-data-pilot.md)

## 当前阶段

当前版本是 **0.2.0 / ID Governance**：已增加 Community ID Registry、Merge Plan、Redirect 预案和双重 Validator 检查。正式 Library 仍保持为空；下一步按 10 人物 + 20 作品的小规模 Pilot 验证真实数据工作流。
