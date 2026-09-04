import ExcelJS from "exceljs";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "exports", "xlsx", "organization-series-registry.xlsx");

async function readJson(relative, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, relative), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}
async function readEntities(relative) {
  const dir = path.join(root, relative);
  let names = [];
  try { names = (await fs.readdir(dir)).filter((name) => name.endsWith(".json")).sort(); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  const items = [];
  for (const name of names) items.push(JSON.parse(await fs.readFile(path.join(dir, name), "utf8")));
  return items;
}
function aliases(entity, language) { return (entity.aliases?.[language] ?? []).join("; "); }
function externalIds(entity) { return Object.entries(entity.externalIds ?? {}).map(([key, value]) => `${key}:${value}`).join("; "); }
function setupSheet(workbook, name, columns, rows) {
  const sheet = workbook.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = columns.map(([header, key, width]) => ({ header, key, width }));
  for (const row of rows) sheet.addRow(row);
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF243447" } };
  header.alignment = { vertical: "middle", horizontal: "center" };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  for (const row of sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) row.alignment = { vertical: "top", wrapText: true };
  }) ?? []) void row;
  return sheet;
}

const organizations = await readEntities("data/organizations");
const series = await readEntities("data/series");
const sources = await readJson("registry/public-sources.json", { sources: [] });
const mappings = await readJson("registry/external-id-mappings.json", { mappings: [] });
const candidates = await readJson("staging/organization-candidates.json", { candidates: [] });
const reconciliation = await readJson("exports/reports/provider-reconciliation.json", { results: [] });
const seriesIndexDiff = await readJson("exports/reports/series-index-diff.json", { selectedSnapshots: [], results: [] });
const orgById = new Map(organizations.map((item) => [item.id, item]));

const workbook = new ExcelJS.Workbook();
workbook.creator = "Localogue Community Data";
workbook.created = new Date("2026-09-04T00:00:00Z");

setupSheet(workbook, "Organizations", [
  ["ID", "id", 18], ["Kind", "kind", 12], ["日本語", "ja", 28], ["简体中文", "zh", 28], ["English", "en", 30],
  ["日文别名", "aliasesJa", 28], ["Parent", "parent", 18], ["Status", "status", 12], ["Official URL", "url", 48], ["External IDs", "external", 28],
], organizations.map((item) => ({
  id: item.id, kind: item.kind, ja: item.names?.ja ?? "", zh: item.names?.["zh-CN"] ?? "", en: item.names?.en ?? "",
  aliasesJa: aliases(item, "ja"), parent: item.parentOrganizationId ?? "", status: item.status ?? "", url: item.officialWebsite ?? "", external: externalIds(item),
})));

setupSheet(workbook, "Series", [
  ["ID", "id", 18], ["日本語", "ja", 38], ["简体中文", "zh", 38], ["English", "en", 44],
  ["Maker ID", "makerId", 18], ["Maker", "maker", 24], ["Label ID", "labelId", 18], ["Status", "status", 12], ["Official URL", "url", 50], ["External IDs", "external", 28],
], series.map((item) => ({
  id: item.id, ja: item.names?.ja ?? "", zh: item.names?.["zh-CN"] ?? "", en: item.names?.en ?? "", makerId: item.makerId ?? "",
  maker: orgById.get(item.makerId)?.names?.ja ?? item.makerId ?? "", labelId: item.labelId ?? "", status: item.status ?? "", url: item.officialWebsite ?? "", external: externalIds(item),
})));

setupSheet(workbook, "Source Registry", [
  ["Source ID", "id", 28], ["名称", "name", 34], ["类型", "type", 14], ["Base URL", "url", 42], ["可枚举实体", "entities", 30],
  ["访问状态", "status", 14], ["最后检查", "checked", 14], ["完整遍历", "complete", 12], ["覆盖统计", "coverage", 54], ["已知限制", "limits", 70],
], (sources.sources ?? []).map((source) => ({
  id: source.id, name: source.name, type: source.sourceType, url: source.baseUrl, entities: (source.entityTypes ?? []).join("; "), status: source.accessStatus,
  checked: source.lastCheckedAt, complete: source.completeTraversal ? "yes" : "no",
  coverage: (source.coverage ?? []).map((item) => `${item.entityType}: ${item.published}/${item.discovered} published, complete=${item.completeTraversal ? "yes" : "no"}`).join("; "), limits: (source.knownLimitations ?? []).join(" | "),
})));

setupSheet(workbook, "External ID Mapping", [
  ["Provider", "provider", 24], ["Entity Type", "type", 16], ["External ID", "externalId", 18], ["Community ID", "communityId", 20],
  ["Status", "status", 14], ["Reviewed", "reviewed", 14], ["Source URL", "url", 54],
], (mappings.mappings ?? []).map((mapping) => ({ provider: mapping.provider, type: mapping.entityType, externalId: mapping.externalId, communityId: mapping.communityId, status: mapping.status, reviewed: mapping.reviewedAt, url: mapping.sourceUrl })));

setupSheet(workbook, "Candidates", [
  ["Candidate ID", "id", 40], ["Kind", "kind", 14], ["日本語", "ja", 28], ["Status", "status", 20], ["未发布原因", "reason", 70], ["Official URL", "url", 48],
], (candidates.candidates ?? []).map((candidate) => ({ id: candidate.candidateId, kind: candidate.kind, ja: candidate.names?.ja ?? "", status: candidate.status, reason: candidate.reasonNotPublished, url: candidate.facts?.officialWebsite ?? "" })));

setupSheet(workbook, "Reconciliation", [
  ["Result", "result", 16], ["Reason", "reason", 28], ["Provider", "provider", 24], ["Type", "type", 14], ["External ID", "externalId", 18],
  ["日本語", "ja", 40], ["Community ID", "communityId", 20], ["Candidates", "candidates", 28], ["Source URL", "url", 54],
], (reconciliation.results ?? []).map((item) => ({ result: item.classification, reason: item.reason, provider: item.provider, type: item.entityType, externalId: item.externalId, ja: item.nameJa, communityId: item.communityId ?? "", candidates: (item.candidateCommunityIds ?? []).join("; "), url: item.sourceUrl })));



setupSheet(workbook, "Series Index Snapshots", [
  ["Snapshot ID", "snapshotId", 38], ["Provider", "provider", 24], ["Source ID", "sourceId", 30], ["Maker ID", "makerId", 18],
  ["Captured", "capturedAt", 14], ["Complete", "complete", 12], ["Entries", "entries", 12],
], (seriesIndexDiff.selectedSnapshots ?? []).map((item) => ({ snapshotId: item.snapshotId, provider: item.provider, sourceId: item.sourceId, makerId: item.makerId, capturedAt: item.capturedAt, complete: item.completeTraversal ? "yes" : "no", entries: item.entries })));

setupSheet(workbook, "Series Index Candidates", [
  ["Classification", "classification", 24], ["Reason", "reason", 36], ["Provider", "provider", 24], ["Snapshot ID", "snapshotId", 38],
  ["External ID", "externalId", 18], ["日本語", "ja", 42], ["Maker ID", "makerId", 18], ["Community ID", "communityId", 20], ["Candidates", "candidates", 28], ["Source URL", "url", 56],
], (seriesIndexDiff.results ?? []).filter((item) => item.classification !== "published").map((item) => ({ classification: item.classification, reason: item.reason, provider: item.provider, snapshotId: item.snapshotId, externalId: item.externalId, ja: item.nameJa, makerId: item.makerId, communityId: item.communityId ?? "", candidates: (item.candidateCommunityIds ?? []).join("; "), url: item.sourceUrl })));

await fs.mkdir(path.dirname(out), { recursive: true });
await workbook.xlsx.writeFile(out);
console.log(`已生成 ${path.relative(root, out)}。`);
