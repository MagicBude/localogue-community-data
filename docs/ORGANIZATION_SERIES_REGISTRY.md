# Organization & Series Registry

> 适用版本：Localogue Community Data 0.4.1

本文说明 Community Data 如何区分 Group、Company、Maker、Label 与 Series，以及为什么这些概念不能只用“厂商”一个字段混在一起。

## 1. 为什么要拆分层级

公开目录里经常同时出现法律公司、运营集团、制作品牌、发行厂牌和作品系列。它们可能拥有相同或相近名称，但生命周期、父子关系和外部 ID 并不相同。如果把它们压成一个字符串，后续会出现三个问题：

1. 同名实体被错误合并；
2. Provider 的稳定 ID 无法准确映射；
3. 公司重组、品牌停用或厂牌迁移后，历史作品无法保持稳定引用。

因此 0.4.0 冻结以下语义边界。

| kind | 中文语义 | 核心判断 | 允许父级 |
| --- | --- | --- | --- |
| `group` | 运营集团 / 品牌集团 | 管理多个公司或业务单元的上层组织 | 无 |
| `company` | 法律公司 | 可以从官方公司信息核验的法人主体 | `group` |
| `maker` | 制作 Maker / Studio | 作品目录直接使用的制作品牌或 Studio | `group` / `company` |
| `label` | Label / 厂牌 | Maker 下用于发行、编辑或产品线区分的品牌 | **必须直接指向 `maker`** |

### 1.1 不允许的做法

- 不因为某网站把名称写成“メーカー”就自动判断它是法律公司。
- 不把 Company 为了兼容旧消费端伪装成 Maker。
- 不因为两个实体名字相同或相似就自动合并。
- 不因为番号前缀相同就直接创建 Maker/Label/Series。

## 2. 当前发布兼容策略

0.4.0 已把 `group/company/maker/label` 的治理模型和 Schema 建立起来，但当前 Localogue 正式 Shared Pack 消费契约仍以 Maker/Label 为主要 Organization kind。

因此本版本采用“模型先行、正式发布保守”的策略：

- 已能被当前 Shared Pack 稳定消费的 Maker/Label 可以进入正式 `data/organizations/`；
- 官方可核验、但消费端尚未一等支持的 Group/Company 先进入 `staging/organization-candidates.json`；
- 禁止为了追求数量把 Company/Group 改标为 Maker/Label。

这使 Community Data 可以先把语义做正确，同时避免破坏现有 Localogue。

## 3. Organization 字段

`schemas/organization-registry.schema.json` 描述 Registry Foundation 允许使用的字段。关键字段包括：

- `id`：稳定六位顺序 ID，例如 `label_000001`；
- `kind`：`group/company/maker/label`；
- `names`：日文原名优先，同时允许 `zh-CN`、`en` 本地化；
- `aliases`：只保存已核验的别名，不用模糊匹配结果回填；
- `parentOrganizationId`：按上表的父级矩阵约束；
- `status`：`active/inactive/unknown`；
- `foundedDate` / `closedDate`：支持 `year/month/day` 精度；
- `officialWebsite`：正式官网或官方目录入口；
- `externalIds`：按 Provider 命名空间保存稳定外部 ID；
- `firstPublishedIn`：首次进入 Community Pack 的版本。

`status=unknown` 是正常状态。官网页面仍可访问，并不自动等于实体仍处于 active 状态。

## 4. Series 字段

Series 是独立实体，不是作品上的任意文本标签。正式 Series 至少需要：

- 稳定 `series_######` ID；
- `names.ja`；
- `makerId`；
- `status`；
- 独立 Source Record。

可选字段包括三语名称/别名、`labelId`、稳定 Provider Series ID、官网/目录 URL、可靠来源支持的首次已知发行时间。

### 4.1 同名 Series

同名不能作为唯一身份依据。不同 Maker，甚至同一 Maker 下不同 Label，都可能出现同名 Series。

Validator 对重复日文规范名只给出人工审核提醒，不自动合并。

## 5. 关系校验

0.4.0 的 Foundation Validator 执行以下关键规则：

1. Label 必须有 `parentOrganizationId`；
2. Label 的父级必须直接是 Maker；
3. Series 的 `makerId` 必须存在且指向 Maker；
4. Series 如有 `labelId`，Label 必须属于同一个 Maker；
5. Provider Mapping 的目标类型必须与 Community Entity 一致；
6. 同一 Provider 的稳定外部 ID 不允许映射到多个 Community Entity。

这些规则的目标不是“尽量自动匹配”，而是防止错误关系一旦发布后污染稳定 ID。

## 6. 0.4.0 第一批正式数据

本版本正式新增两条 MOODYZ Label 与四条官方 Series。它们只使用官方目录中可核验的稳定 ID / URL；没有因为名称相似、演员、作品风格或番号前缀补推关系。

WILL 公司信息已经通过官方公司页核验，但由于当前消费兼容边界，只进入 Candidate/Staging，不进入正式 Shared Pack。

## 7. 后续演进

当 Localogue 正式支持 Group/Company 一等 Organization kind 后，可把已审核 Candidate 发布为正式 `data/organizations/` 实体，并为其分配稳定顺序 ID。发布前仍必须重新核验：

- 法律主体名称；
- 父子层级；
- 是否存在同名历史实体；
- 官方来源；
- 外部 ID 是否与既有 Mapping 冲突。

## 8. 0.4.1：Maker-local Label 身份

ATTACKERS 与 Madonna 的官方 Label Index 同时出现了 `AVOPEN`、`AVグランプリ`、`おっぱい祭り`、`春のパンツまつり`、`背徳ビチョビチョ！NTR大放出` 等名称。

当前 Organization 模型规定 Label 必须直接挂 Maker，所以这些条目按**各自官方 Maker 目录中的 Label 身份**分别发布。即使名称相同、官网底层数值 ID 相同，也不能绕过父级关系直接合并。

这并不否认它们可能来自同一个跨 Maker 活动；它只是说明“跨 Maker 活动”与“Maker 目录里的 Label”是两个不同层级的问题。未来如果需要表达活动实体，应新增合适的数据模型，而不是让一个 Label 同时拥有多个 Maker 父级。


## Series 批量建设规则（0.4.3 起）

1. Series 必须来自官方 Series 页面或已审核 Provider 稳定 ID。
2. `makerId` 可以由官方站点域名/来源 Registry 明确归属；`labelId` 只有来源明确给出时才填写。
3. 同名 Series 不跨 Maker 自动合并。
4. 批次样本不等于完整 Series Index；未完成索引遍历时 `coverage.completeTraversal` 必须为 `false`。
5. 当一个此前只有 Maker/Label 的 Source 新增 Series coverage 时，即使 Maker/Label 已 complete，来源级 `completeTraversal` 也必须回到 `false`，直到全部声明实体类型都完整。
