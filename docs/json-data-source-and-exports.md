# JSON 事实源与导出流程

## 为什么选择 JSON

人物具有多语言姓名、多个别名、部分日期、职业、活动事件、身体资料和来源证据。JSON 能保留数组、对象、数字和空值语义，也与 Localogue 的 Shared Pack 输入一致。

CSV 与 XLSX 适合浏览和批量检查，但不是权威数据。发现错误时应修改 `data/` 中对应 JSON，再重新生成。

## 目录职责

- `data/`：人工维护、Git 审核的唯一事实源。
- `library/`：Localogue 挂载使用的生成物。
- `sources/`：从 `data/sources/` 生成的公开来源记录。
- `registry/`：根据当前正式实体生成的 active ID 清单。
- `exports/csv/`：方便程序交换与表格浏览。
- `exports/xlsx/`：冻结标题、筛选、换行和列宽优化后的人工浏览工作簿。

## 标准工作流

```bash
pnpm install
pnpm new person
# 编辑 data/people/ 与 data/sources/
pnpm data:build
pnpm data:export:xlsx
pnpm check
```

`pnpm check` 会以 `--check` 模式重新计算生成结果，阻止忘记运行 `data:build` 的提交。

## 人物派生字段

作品数、首作日期和最新作日期必须根据 `data/works/` 中的参演关系计算，不能作为人物事实手工维护。这样新增作品后，人物总览不会产生过期统计。

## 来源质量

优先级原则为：官方本人/事务所/片商页面优先，可靠数据库与百科用于补充。来源之间冲突时保留更明确、更近期的依据；无法可靠判断的活动状态使用 `unknown`，不以作品列表更新时间代替真实引退日期。
