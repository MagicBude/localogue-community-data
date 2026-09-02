# Localogue Community Data V0-03 Manifest

## 目标

在 V0-02 的 ID Governance 基础上执行首个真实数据小批次，验证 Person、Work、Maker、Source Record 与 Community ID Registry 能否形成完整闭环。

## 本版本内容

- Pack Version：`0.2.1`
- 核心实体：3 Person + 5 Work
- 支撑实体：3 Maker
- Source Record：11
- active Registry Entry：11
- Redirect / Merge：0
- 图片与私人数据：0

## 人物

- 桃乃木かな
- 石川澪
- 河北彩花

## 作品品番

- IPZ-637
- IPZ-653
- MIDE-974
- MIDE-989
- SSIS-129

## 设计冻结

- Work 的人物与 Maker 关系必须引用同一 Pack 内的 active ID。
- Source Record 与 active Registry Entry 必须和实体在同一批次发布。
- 来源能够日后补强，但已经发布的实体 ID 不因来源升级而改变。
- 官方来源无法读取时必须降级标注来源类型并记录例外，不得伪造 `official` 或 `accessedAt`。
- 未核验的本地化标题、Label、Series 和 Genre 不为了“填满字段”而猜测。
- 本版本仍不包含图片、MediaFile、本地路径、用户 Tag 与任何私人状态。

## 验收边界

仓库侧以 `pnpm check`、`pnpm stats` 和完整覆盖包解压复验为准。Localogue 图形界面挂载与 Private Library 覆盖优先级仍需用户在本机完成，未把人工验收写成自动完成。
