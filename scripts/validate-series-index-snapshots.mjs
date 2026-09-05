import fs from "node:fs/promises";
import path from "node:path";
import { latestSnapshotsByProvider } from "./lib/series-index.mjs";

const root = process.cwd();
const errors = [];
async function readJson(relative, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, relative), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return fallback; errors.push(`${relative}: ${error.message}`); return fallback; }
}
async function readDirJson(relative) {
  const dir = path.join(root, relative);
  let names = [];
  try { names = (await fs.readdir(dir)).filter((name) => name.endsWith(".json")).sort(); }
  catch (error) { if (error.code !== "ENOENT") errors.push(`${relative}: ${error.message}`); return []; }
  const result = [];
  for (const name of names) {
    try { result.push(JSON.parse(await fs.readFile(path.join(dir, name), "utf8"))); }
    catch (error) { errors.push(`${relative}/${name}: ${error.message}`); }
  }
  return result;
}
function isUrl(value) { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol); } catch { return false; } }
function isDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value ?? ""); }
function unique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) errors.push(`${label}: 重复值 ${value}`);
    seen.add(value);
  }
}

const providerFile = await readJson("registry/series-index-providers.json", { providers: [] });
if (providerFile?.schemaVersion !== 1 || !Array.isArray(providerFile?.providers)) errors.push("registry/series-index-providers.json: 结构无效");
const providers = providerFile.providers ?? [];
unique(providers.map((item) => item.key), "Series Index Provider key");
unique(providers.map((item) => item.provider), "Series Index Provider namespace");

const sourceFile = await readJson("registry/public-sources.json", { sources: [] });
const sources = new Map((sourceFile.sources ?? []).map((item) => [item.id, item]));
const organizations = await readDirJson("data/organizations");
const orgById = new Map(organizations.map((item) => [item.id, item]));
for (const config of providers) {
  if (!/^[a-z0-9_-]+$/.test(config.key ?? "")) errors.push(`series index provider ${config.key}: key 无效`);
  if (!String(config.provider ?? "").endsWith(".series")) errors.push(`series index provider ${config.key}: provider 必须是 *.series namespace`);
  if (!sources.has(config.sourceId)) errors.push(`series index provider ${config.key}: sourceId 不存在 (${config.sourceId})`);
  const maker = orgById.get(config.makerId);
  if (!maker || maker.kind !== "maker") errors.push(`series index provider ${config.key}: makerId 不存在或不是 Maker (${config.makerId})`);
  if (!isUrl(config.indexUrl)) errors.push(`series index provider ${config.key}: indexUrl 无效`);
  if (!String(config.detailUrlTemplate ?? "").includes("<id>")) errors.push(`series index provider ${config.key}: detailUrlTemplate 必须包含 <id>`);
  try { new RegExp(config.detailPathPattern); } catch { errors.push(`series index provider ${config.key}: detailPathPattern 不是有效正则`); }
  if (typeof config.indexIsSinglePage !== "boolean") errors.push(`series index provider ${config.key}: indexIsSinglePage 必须为布尔值`);
}

const snapshots = await readDirJson("staging/series-index-snapshots");
unique(snapshots.map((item) => item.snapshotId), "Series Index Snapshot snapshotId");
const snapshotById = new Map(snapshots.map((item) => [item.snapshotId, item]));
const configByKey = new Map(providers.map((item) => [item.key, item]));
for (const snapshot of snapshots) {
  const config = configByKey.get(snapshot.providerKey);
  if (snapshot.schemaVersion !== 1) errors.push(`snapshot ${snapshot.snapshotId}: schemaVersion 必须为 1`);
  if (!config) errors.push(`snapshot ${snapshot.snapshotId}: providerKey 未登记 (${snapshot.providerKey})`);
  if (!isDate(snapshot.capturedAt)) errors.push(`snapshot ${snapshot.snapshotId}: capturedAt 必须为 YYYY-MM-DD`);
  if (!["live-fetch", "html-fixture", "web-review"].includes(snapshot.captureMethod)) errors.push(`snapshot ${snapshot.snapshotId}: captureMethod 无效`);
  if (typeof snapshot.completeTraversal !== "boolean") errors.push(`snapshot ${snapshot.snapshotId}: completeTraversal 必须为布尔值`);
  if (!Array.isArray(snapshot.entries) || snapshot.entries.length === 0) errors.push(`snapshot ${snapshot.snapshotId}: entries 不能为空`);
  const window = snapshot.coverageWindow;
  if (!window || typeof window !== "object" || Array.isArray(window)) {
    errors.push(`snapshot ${snapshot.snapshotId}: coverageWindow 必填`);
  } else {
    const allowedKinds = new Set(["sample", "segment", "expansion", "complete-index"]);
    const allowedOrderBasis = new Set(["sample-order", "manual-review-order", "parsed-index-order"]);
    if (!allowedKinds.has(window.kind)) errors.push(`snapshot ${snapshot.snapshotId}: coverageWindow.kind 无效 (${window.kind})`);
    if (!allowedOrderBasis.has(window.orderBasis)) errors.push(`snapshot ${snapshot.snapshotId}: coverageWindow.orderBasis 无效 (${window.orderBasis})`);
    if (!String(window.startExternalId ?? "").trim()) errors.push(`snapshot ${snapshot.snapshotId}: coverageWindow.startExternalId 不能为空`);
    if (!String(window.endExternalId ?? "").trim()) errors.push(`snapshot ${snapshot.snapshotId}: coverageWindow.endExternalId 不能为空`);
    if (window.resumeAfterExternalId !== null && !String(window.resumeAfterExternalId ?? "").trim()) errors.push(`snapshot ${snapshot.snapshotId}: coverageWindow.resumeAfterExternalId 必须为 null 或非空字符串`);
    if (window.continuesFromSnapshotId !== null && !String(window.continuesFromSnapshotId ?? "").trim()) errors.push(`snapshot ${snapshot.snapshotId}: coverageWindow.continuesFromSnapshotId 必须为 null 或非空字符串`);
    if (snapshot.completeTraversal && window.kind !== "complete-index") errors.push(`snapshot ${snapshot.snapshotId}: completeTraversal=true 时 coverageWindow.kind 必须为 complete-index`);
    if (!snapshot.completeTraversal && window.kind === "complete-index") errors.push(`snapshot ${snapshot.snapshotId}: partial snapshot 不能使用 complete-index coverageWindow`);
    if (window.kind === "sample" && window.resumeAfterExternalId !== null) errors.push(`snapshot ${snapshot.snapshotId}: sample coverageWindow 不应设置 resumeAfterExternalId`);
    if (window.kind === "complete-index" && window.resumeAfterExternalId !== null) errors.push(`snapshot ${snapshot.snapshotId}: complete-index 不应设置 resumeAfterExternalId`);
    if (["segment", "expansion"].includes(window.kind) && window.resumeAfterExternalId !== window.endExternalId) errors.push(`snapshot ${snapshot.snapshotId}: segment/expansion 的 resumeAfterExternalId 必须等于 endExternalId`);
    if (window.kind === "expansion" && !window.continuesFromSnapshotId) errors.push(`snapshot ${snapshot.snapshotId}: expansion 必须声明 continuesFromSnapshotId`);
  }
  if (config) {
    for (const [field, expected] of [["provider", config.provider], ["sourceId", config.sourceId], ["makerId", config.makerId], ["indexUrl", config.indexUrl]]) {
      if (snapshot[field] !== expected) errors.push(`snapshot ${snapshot.snapshotId}: ${field} 与 Provider Registry 不一致`);
    }
    if (snapshot.completeTraversal && config.indexIsSinglePage !== true) errors.push(`snapshot ${snapshot.snapshotId}: Provider 未声明单页索引，不能标记 completeTraversal=true`);
  }
  const ids = [];
  const positions = [];
  for (const entry of snapshot.entries ?? []) {
    ids.push(entry.externalId);
    positions.push(entry.position);
    if (!Number.isInteger(entry.position) || entry.position < 1) errors.push(`snapshot ${snapshot.snapshotId}: position 必须为正整数`);
    if (!String(entry.externalId ?? "").trim()) errors.push(`snapshot ${snapshot.snapshotId}: externalId 不能为空`);
    if (!String(entry.nameJa ?? "").trim()) errors.push(`snapshot ${snapshot.snapshotId}: nameJa 不能为空`);
    if (!isUrl(entry.sourceUrl)) errors.push(`snapshot ${snapshot.snapshotId}: sourceUrl 无效 (${entry.sourceUrl})`);
    if (config && entry.sourceUrl !== config.detailUrlTemplate.replace("<id>", entry.externalId)) errors.push(`snapshot ${snapshot.snapshotId}: ${entry.externalId} sourceUrl 不符合 Provider detailUrlTemplate`);
  }
  unique(ids, `snapshot ${snapshot.snapshotId} externalId`);
  unique(positions, `snapshot ${snapshot.snapshotId} position`);
  const sortedPositions = [...positions].sort((a, b) => a - b);
  if (sortedPositions.some((value, index) => value !== index + 1)) errors.push(`snapshot ${snapshot.snapshotId}: position 必须从 1 连续编号`);
  if (snapshot.entries?.length && snapshot.coverageWindow) {
    if (snapshot.coverageWindow.startExternalId !== snapshot.entries[0].externalId) errors.push(`snapshot ${snapshot.snapshotId}: coverageWindow.startExternalId 必须等于第一条 entry externalId`);
    if (snapshot.coverageWindow.endExternalId !== snapshot.entries.at(-1).externalId) errors.push(`snapshot ${snapshot.snapshotId}: coverageWindow.endExternalId 必须等于最后一条 entry externalId`);
  }
}

for (const snapshot of snapshots) {
  const previousId = snapshot.coverageWindow?.continuesFromSnapshotId;
  if (!previousId) continue;
  const previous = snapshotById.get(previousId);
  if (!previous) {
    errors.push(`snapshot ${snapshot.snapshotId}: continuesFromSnapshotId 不存在 (${previousId})`);
    continue;
  }
  if (previous.provider !== snapshot.provider) errors.push(`snapshot ${snapshot.snapshotId}: predecessor Provider 不一致 (${previousId})`);
  if (`${previous.capturedAt}\0${previous.snapshotId}` >= `${snapshot.capturedAt}\0${snapshot.snapshotId}`) errors.push(`snapshot ${snapshot.snapshotId}: predecessor 必须早于当前快照 (${previousId})`);
}
for (const snapshot of snapshots) {
  const seen = new Set([snapshot.snapshotId]);
  let current = snapshot;
  while (current?.coverageWindow?.continuesFromSnapshotId) {
    const nextId = current.coverageWindow.continuesFromSnapshotId;
    if (seen.has(nextId)) { errors.push(`snapshot ${snapshot.snapshotId}: coverageWindow continuation 链存在循环 (${nextId})`); break; }
    seen.add(nextId);
    current = snapshotById.get(nextId);
    if (!current) break;
  }
}

const mappings = (await readJson("registry/external-id-mappings.json", { mappings: [] })).mappings ?? [];
const approved = mappings.filter((item) => item.status === "approved" && item.entityType === "series");
const latest = latestSnapshotsByProvider(snapshots);
for (const [provider, snapshot] of latest) {
  const source = sources.get(snapshot.sourceId);
  const coverage = source?.coverage?.find((item) => item.entityType === "series");
  if (!coverage) {
    errors.push(`snapshot ${snapshot.snapshotId}: source ${snapshot.sourceId} 缺少 series coverage`);
    continue;
  }
  const publishedIds = new Set(approved.filter((item) => item.provider === provider).map((item) => item.externalId));
  const snapshotIds = new Set(snapshot.entries.map((item) => item.externalId));
  const unionSize = new Set([...publishedIds, ...snapshotIds]).size;
  const unmatched = [...snapshotIds].filter((id) => !publishedIds.has(id)).length;
  if (coverage.discovered < unionSize) errors.push(`source ${snapshot.sourceId}: series.discovered=${coverage.discovered} 小于已发布+最新快照联合发现数 ${unionSize}`);
  if (coverage.published !== publishedIds.size) errors.push(`source ${snapshot.sourceId}: series.published=${coverage.published} 与 approved Mapping 数 ${publishedIds.size} 不一致`);
  if (coverage.unrecognized < unmatched) errors.push(`source ${snapshot.sourceId}: series.unrecognized=${coverage.unrecognized} 小于最新快照未映射候选 ${unmatched}`);
  if (snapshot.completeTraversal && coverage.completeTraversal !== true) errors.push(`source ${snapshot.sourceId}: 最新完整快照存在，但 series coverage.completeTraversal 不是 true`);
}

if (errors.length) {
  console.error("Series Index Snapshot 校验失败：");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Series Index Snapshot 校验通过：providers=${providers.length}, snapshots=${snapshots.length}, entries=${snapshots.reduce((sum, item) => sum + item.entries.length, 0)}。`);
