import fs from "node:fs/promises";
import path from "node:path";
import { latestSnapshotsByProvider } from "./lib/series-index.mjs";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
async function readJson(relative, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, relative), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}
async function readDirJson(relative) {
  const dir = path.join(root, relative);
  let names = [];
  try { names = (await fs.readdir(dir)).filter((name) => name.endsWith(".json")).sort(); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  const result = [];
  for (const name of names) result.push(JSON.parse(await fs.readFile(path.join(dir, name), "utf8")));
  return result;
}
function normalize(value) { return String(value ?? "").normalize("NFKC").trim().toLocaleLowerCase("ja"); }
function csvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
function csv(rows) { return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`; }

const configs = (await readJson("registry/series-index-providers.json", { providers: [] })).providers ?? [];
const configByProvider = new Map(configs.map((item) => [item.provider, item]));
const snapshots = await readDirJson("staging/series-index-snapshots");
const latest = latestSnapshotsByProvider(snapshots);
const mappings = (await readJson("registry/external-id-mappings.json", { mappings: [] })).mappings ?? [];
const series = await readDirJson("data/series");
const seriesById = new Map(series.map((item) => [item.id, item]));
const approvedSeriesMappings = mappings.filter((item) => item.status === "approved" && item.entityType === "series");
const mappingByKey = new Map(approvedSeriesMappings.map((item) => [`${item.provider}\0${item.externalId}`, item]));

const results = [];
const selectedSnapshots = [];
for (const [provider, snapshot] of [...latest.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const config = configByProvider.get(provider);
  selectedSnapshots.push({
    snapshotId: snapshot.snapshotId,
    provider,
    sourceId: snapshot.sourceId,
    makerId: snapshot.makerId,
    capturedAt: snapshot.capturedAt,
    completeTraversal: snapshot.completeTraversal,
    entries: snapshot.entries.length,
    coverageWindow: snapshot.coverageWindow ?? null,
  });
  const snapshotIds = new Set();
  for (const entry of snapshot.entries) {
    snapshotIds.add(entry.externalId);
    const mapping = mappingByKey.get(`${provider}\0${entry.externalId}`);
    if (mapping) {
      const target = seriesById.get(mapping.communityId);
      if (!target) {
        results.push({ classification: "conflict", reason: "mapping-target-missing", provider, snapshotId: snapshot.snapshotId, externalId: entry.externalId, nameJa: entry.nameJa, makerId: snapshot.makerId, communityId: mapping.communityId, candidateCommunityIds: [], sourceUrl: entry.sourceUrl });
      } else if (target.makerId !== snapshot.makerId) {
        results.push({ classification: "conflict", reason: "mapping-maker-mismatch", provider, snapshotId: snapshot.snapshotId, externalId: entry.externalId, nameJa: entry.nameJa, makerId: snapshot.makerId, communityId: mapping.communityId, candidateCommunityIds: [], sourceUrl: entry.sourceUrl });
      } else if (normalize(target.names?.ja) !== normalize(entry.nameJa)) {
        results.push({ classification: "published-name-drift", reason: "approved-id-name-drift", provider, snapshotId: snapshot.snapshotId, externalId: entry.externalId, nameJa: entry.nameJa, makerId: snapshot.makerId, communityId: mapping.communityId, candidateCommunityIds: [], sourceUrl: entry.sourceUrl });
      } else {
        results.push({ classification: "published", reason: "approved-external-id", provider, snapshotId: snapshot.snapshotId, externalId: entry.externalId, nameJa: entry.nameJa, makerId: snapshot.makerId, communityId: mapping.communityId, candidateCommunityIds: [], sourceUrl: entry.sourceUrl });
      }
      continue;
    }

    const exactName = series.filter((item) => item.makerId === snapshot.makerId && normalize(item.names?.ja) === normalize(entry.nameJa));
    if (exactName.length > 0) {
      results.push({ classification: "candidate-existing-name", reason: "same-maker-canonical-name-without-id-mapping", provider, snapshotId: snapshot.snapshotId, externalId: entry.externalId, nameJa: entry.nameJa, makerId: snapshot.makerId, communityId: null, candidateCommunityIds: exactName.map((item) => item.id), sourceUrl: entry.sourceUrl });
    } else {
      results.push({ classification: "candidate-new", reason: "unmapped-official-series-id", provider, snapshotId: snapshot.snapshotId, externalId: entry.externalId, nameJa: entry.nameJa, makerId: snapshot.makerId, communityId: null, candidateCommunityIds: [], sourceUrl: entry.sourceUrl });
    }
  }

  if (snapshot.completeTraversal) {
    for (const mapping of approvedSeriesMappings.filter((item) => item.provider === provider)) {
      if (!snapshotIds.has(mapping.externalId)) {
        const target = seriesById.get(mapping.communityId);
        results.push({ classification: "missing-from-complete-index", reason: "published-id-not-present-in-complete-snapshot", provider, snapshotId: snapshot.snapshotId, externalId: mapping.externalId, nameJa: target?.names?.ja ?? "", makerId: config?.makerId ?? snapshot.makerId, communityId: mapping.communityId, candidateCommunityIds: [], sourceUrl: mapping.sourceUrl });
      }
    }
  }
}

const classifications = ["published", "published-name-drift", "candidate-new", "candidate-existing-name", "missing-from-complete-index", "conflict"];
const counts = Object.fromEntries(classifications.map((key) => [key, results.filter((item) => item.classification === key).length]));
const report = {
  schemaVersion: 1,
  generatedFrom: {
    providers: "registry/series-index-providers.json",
    snapshots: "staging/series-index-snapshots/*.json",
    mappings: "registry/external-id-mappings.json",
    series: "data/series/*.json"
  },
  policy: {
    snapshotDoesNotPublish: true,
    approvedExternalIdIsIdentity: true,
    exactNameWithoutMappingRequiresReview: true,
    missingFromCompleteSnapshotNeverDeletes: true
  },
  selectedSnapshots,
  counts,
  results,
};
const reportContent = `${JSON.stringify(report, null, 2)}\n`;
const allCsv = csv([
  ["classification","reason","provider","snapshot_id","external_id","name_ja","maker_id","community_id","candidate_community_ids","source_url"],
  ...results.map((item) => [item.classification,item.reason,item.provider,item.snapshotId,item.externalId,item.nameJa,item.makerId,item.communityId ?? "",(item.candidateCommunityIds ?? []).join(";"),item.sourceUrl]),
]);
const candidateRows = results.filter((item) => item.classification !== "published");
const candidateCsv = csv([
  ["classification","reason","provider","snapshot_id","external_id","name_ja","maker_id","community_id","candidate_community_ids","source_url"],
  ...candidateRows.map((item) => [item.classification,item.reason,item.provider,item.snapshotId,item.externalId,item.nameJa,item.makerId,item.communityId ?? "",(item.candidateCommunityIds ?? []).join(";"),item.sourceUrl]),
]);
const snapshotCsv = csv([
  ["snapshot_id","provider","source_id","maker_id","captured_at","complete_traversal","entries","window_kind","order_basis","window_start_external_id","window_end_external_id","resume_after_external_id","continues_from_snapshot_id"],
  ...selectedSnapshots.map((item) => [
    item.snapshotId,item.provider,item.sourceId,item.makerId,item.capturedAt,item.completeTraversal ? "true" : "false",item.entries,
    item.coverageWindow?.kind ?? "",item.coverageWindow?.orderBasis ?? "",item.coverageWindow?.startExternalId ?? "",
    item.coverageWindow?.endExternalId ?? "",item.coverageWindow?.resumeAfterExternalId ?? "",item.coverageWindow?.continuesFromSnapshotId ?? "",
  ]),
]);

const outputs = new Map([
  ["exports/reports/series-index-diff.json", reportContent],
  ["exports/csv/series-index-diff.csv", allCsv],
  ["exports/csv/series-index-candidates.csv", candidateCsv],
  ["exports/csv/series-index-snapshots.csv", snapshotCsv],
]);
const stale = [];
for (const [relative, content] of outputs) {
  const target = path.join(root, relative);
  if (checkOnly) {
    let actual = "";
    try { actual = await fs.readFile(target, "utf8"); } catch {}
    if (actual !== content) stale.push(relative);
  } else {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, "utf8");
  }
}
if (checkOnly && stale.length) {
  console.error(`Series Index Diff 不是最新状态：\n- ${stale.join("\n- ")}\n请运行 pnpm series:index:diff`);
  process.exit(1);
}
console.log(`Series Index Diff：snapshots=${selectedSnapshots.length}, published=${counts.published}, candidates=${counts["candidate-new"] + counts["candidate-existing-name"]}, drift=${counts["published-name-drift"]}, missing=${counts["missing-from-complete-index"]}, conflicts=${counts.conflict}`);
