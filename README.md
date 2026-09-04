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
├── data/                         # 唯一事实源：单实体 JSON
├── library/                      # 自动生成：Localogue Shared Pack
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
├── exports/csv/                  # 自动生成：规范表与浏览总览
├── exports/xlsx/                 # 自动生成：格式化工作簿
└── docs/
```

正式数据在 `data/` 遵循“一实体一 JSON 文件”。`library/`、Registry、CSV 和 XLSX 都由它自动生成；`examples/` 只包含虚构示例。

## 快速开始

要求 Node.js 22+。本仓库没有第三方运行依赖。

```bash
pnpm install
pnpm data:build
pnpm data:export:xlsx
pnpm check
pnpm stats
pnpm new person
```

不要直接修改 `library/` 或 `exports/`。人物事实源可使用 `data/people/person_000001--momonogi-kana.json` 这样的可读文件名，程序引用仍只使用稳定 ID。

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

当前版本是 **0.3.2 / Work–Genre Pilot**：除 13 位人物、5 部作品和 3 个 Maker 外，已建立 325 个日文、简体中文、英文对照的分类条目，并为现有 5 部作品完成第一轮保守 Genre 引用。详见 [三语分类词表](docs/genre-vocabulary.md)。CSV、XLSX、Shared Pack 与 Registry 均由 `data/` 自动生成。
