import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
async function readJson(relative, fallback = null) {
  try { return JSON.parse(await fs.readFile(path.join(root, relative), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}
async function readDirJson(relative) {
  const dir = path.join(root, relative); let names = [];
  try { names = (await fs.readdir(dir)).filter((name) => name.endsWith(".json")).sort(); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  const out = []; for (const name of names) out.push(JSON.parse(await fs.readFile(path.join(dir, name), "utf8"))); return out;
}
function key(provider, externalId) { return `${provider}\0${externalId}`; }
function normalized(value) { return String(value ?? "").normalize("NFKC").trim(); }

const ledger = await readJson("staging/series-candidate-reviews.json", { schemaVersion: 1, reviews: [] });
const snapshots = await readDirJson("staging/series-index-snapshots");
const series = await readDirJson("data/series");
const mappings = (await readJson("registry/external-id-mappings.json", { mappings: [] })).mappings ?? [];
const snapshotById = new Map(snapshots.map((item) => [item.snapshotId, item]));
const seriesById = new Map(series.map((item) => [item.id, item]));
const mappingByKey = new Map(mappings.filter((m) => m.status === "approved" && m.entityType === "series").map((m) => [key(m.provider, m.externalId), m]));
const seen = new Set(); const errors = []; let publish = 0, hold = 0, reject = 0;
if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger?.reviews)) errors.push("series-candidate-reviews.json 结构无效");
for (const review of ledger?.reviews ?? []) {
  const k = key(review.provider, review.externalId);
  if (seen.has(k)) errors.push(`review 重复：${review.provider}:${review.externalId}`); else seen.add(k);
  if (!["publish","hold","reject"].includes(review.decision)) errors.push(`${review.provider}:${review.externalId}: decision 无效`);
  if (!review.reason?.trim()) errors.push(`${review.provider}:${review.externalId}: 缺少审核理由`);
  const snapshot = snapshotById.get(review.snapshotId);
  if (!snapshot) { errors.push(`${review.provider}:${review.externalId}: snapshotId 不存在：${review.snapshotId}`); continue; }
  if (snapshot.provider !== review.provider || snapshot.makerId !== review.makerId) errors.push(`${review.provider}:${review.externalId}: Review 与 Snapshot Provider/Maker 不一致`);
  const entry = (snapshot.entries ?? []).find((item) => item.externalId === review.externalId);
  if (!entry) { errors.push(`${review.provider}:${review.externalId}: Snapshot 中找不到该外部 ID`); continue; }
  if (normalized(entry.nameJa) !== normalized(review.nameJa) || entry.sourceUrl !== review.sourceUrl) errors.push(`${review.provider}:${review.externalId}: Review 名称或来源 URL 与 Snapshot 不一致`);
  if (review.decision === "publish") {
    publish += 1;
    if (!review.communityId) { errors.push(`${review.provider}:${review.externalId}: publish 必须填写 communityId`); continue; }
    const target = seriesById.get(review.communityId);
    if (!target) { errors.push(`${review.provider}:${review.externalId}: 发布目标 ${review.communityId} 不存在`); continue; }
    if (target.makerId !== review.makerId || normalized(target.names?.ja) !== normalized(review.nameJa)) errors.push(`${review.provider}:${review.externalId}: 正式 Series 与 Review 的 Maker/日文名不一致`);
    if (target.externalIds?.[review.provider] !== review.externalId || target.officialWebsite !== review.sourceUrl) errors.push(`${review.provider}:${review.externalId}: 正式 Series 的 externalIds/officialWebsite 与 Review 不一致`);
    const mapping = mappingByKey.get(k);
    if (!mapping || mapping.communityId !== review.communityId || mapping.sourceUrl !== review.sourceUrl) errors.push(`${review.provider}:${review.externalId}: 缺少一致的 approved External ID Mapping`);
  } else {
    if (review.decision === "hold") hold += 1; else reject += 1;
    if (review.communityId) errors.push(`${review.provider}:${review.externalId}: ${review.decision} 不应分配 communityId`);
  }
}
if (errors.length) {
  console.error("Series Candidate Review 校验失败："); for (const error of errors) console.error(`- ${error}`); process.exit(1);
}
console.log(`Series Candidate Review 校验通过：reviews=${ledger.reviews.length}, publish=${publish}, hold=${hold}, reject=${reject}。`);
