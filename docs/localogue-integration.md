# 接入 Localogue

## 目录挂载

Clone：

```bash
git clone https://github.com/MagicBude/localogue-community-data.git D:/Localogue-Packs/localogue-community-data
```

Localogue：

```text
/settings
→ Shared Packs
→ D:/Localogue-Packs/localogue-community-data
→ 保存
```

Localogue 会读取：

```text
localogue-pack.json
library/
```

`examples/`、`sources/`、`docs/` 不参与当前 V1 Shared Repository 查询。

## 优先级

```text
Private Library
> 本 Pack
> 后续 Shared Packs
```

同一个稳定 ID 在 Private Library 出现时，本 Pack 实体被完整覆盖。

## 更新

```bash
cd D:/Localogue-Packs/localogue-community-data
git pull
pnpm check
```

Localogue 下一次服务器请求即可读取更新后的 Shared Pack；如页面仍有缓存，刷新或重启开发服务器即可。
