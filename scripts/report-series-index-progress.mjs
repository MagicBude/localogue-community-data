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

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
function csv(rows) { return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`; }

function chainDepth(snapshot, byId) {
  let depth = 1;
  let current = snapshot;
  const seen = new Set([snapshot.snapshotId]);
  while (current?.coverageWindow?.continuesFromSnapshotId) {
    const previousId = current.coverageWindow.continuesFromSnapshotId;
    if (seen.has(previousId)) return null;
    const previous = byId.get(previousId);
    if (!previous || previous.provider !== snapshot.provider) return null;
    seen.add(previousId);
    current = previous;
    depth += 1;
  }
  return depth;
}

const providerRegistry = await readJson("registry/series-index-providers.json", { providers: [] });
const snapshots = await readDirJson("staging/series-index-snapshots");
const latest = latestSnapshotsByProvider(snapshots);
const snapshotById = new Map(snapshots.map((item) => [item.snapshotId, item]));
const mappings = (await readJson("registry/external-id-mappings.json", { mappings: [] })).mappings ?? [];
const reviews = (await readJson("staging/series-candidate-reviews.json", { reviews: [] })).reviews ?? [];
const sourceRegistry = await readJson("registry/public-sources.json", { sources: [] });
const sourceById = new Map((sourceRegistry.sources ?? []).map((item) => [item.id, item]));

const rows = [];
for (const config of [...(providerRegistry.providers ?? [])].sort((a, b) => a.key.localeCompare(b.key))) {
  const providerSnapshots = snapshots
    .filter((item) => item.provider === config.provider)
    .sort((a, b) => `${a.capturedAt}\0${a.snapshotId}`.localeCompare(`${b.capturedAt}\0${b.snapshotId}`));
  const latestSnapshot = latest.get(config.provider) ?? null;
  const uniqueSnapshotIds = new Set(providerSnapshots.flatMap((item) => item.entries?.map((entry) => entry.externalId) ?? []));
  const approvedMappings = mappings.filter((item) => item.entityType === "series" && item.status === "approved" && item.provider === config.provider);
  const providerReviews = reviews.filter((item) => item.provider === config.provider);
  const sourceCoverage = sourceById.get(config.sourceId)?.coverage?.find((item) => item.entityType === "series") ?? null;
  const window = latestSnapshot?.coverageWindow ?? null;
  const resumeExternalId = window?.resumeAfterExternalId ?? null;
  const progress = {
    providerKey: config.key,
    provider: config.provider,
    makerId: config.makerId,
    sourceId: config.sourceId,
    totalSnapshots: providerSnapshots.length,
    totalSnapshotEntries: providerSnapshots.reduce((sum, item) => sum + (item.entries?.length ?? 0), 0),
    uniqueSnapshotExternalIds: uniqueSnapshotIds.size,
    approvedMappings: approvedMappings.length,
    reviews: {
      publish: providerReviews.filter((item) => item.decision === "publish").length,
      hold: providerReviews.filter((item) => item.decision === "hold").length,
      reject: providerReviews.filter((item) => item.decision === "reject").length,
    },
    latestSnapshotId: latestSnapshot?.snapshotId ?? null,
    latestCapturedAt: latestSnapshot?.capturedAt ?? null,
    latestCompleteTraversal: latestSnapshot?.completeTraversal ?? false,
    continuationChainDepth: latestSnapshot ? chainDepth(latestSnapshot, snapshotById) : 0,
    coverageWindow: window,
    resumeCheckpoint: latestSnapshot && resumeExternalId
      ? {
          available: true,
          externalId: resumeExternalId,
          sourceUrl: config.detailUrlTemplate.replace("<id>", resumeExternalId),
          semantics: "resume-after-reviewed-anchor",
        }
      : {
          available: false,
          externalId: null,
          sourceUrl: null,
          semantics: latestSnapshot?.completeTraversal ? "complete-index-no-resume-needed" : "no-reviewed-resume-anchor",
        },
    sourceCoverage,
  };
  rows.push(progress);
}

const counts = {
  providers: rows.length,
  partialProviders: rows.filter((item) => !item.latestCompleteTraversal).length,
  completeProviders: rows.filter((item) => item.latestCompleteTraversal).length,
  withResumeCheckpoint: rows.filter((item) => item.resumeCheckpoint.available).length,
  withoutResumeCheckpoint: rows.filter((item) => !item.resumeCheckpoint.available).length,
  holdReviews: rows.reduce((sum, item) => sum + item.reviews.hold, 0),
};

const report = {
  schemaVersion: 1,
  generatedFrom: {
    providers: "registry/series-index-providers.json",
    snapshots: "staging/series-index-snapshots/*.json",
    mappings: "registry/external-id-mappings.json",
    reviews: "staging/series-candidate-reviews.json",
    sources: "registry/public-sources.json",
  },
  policy: {
    resumeAnchorIsHintOnly: true,
    externalIdsAreNotAssumedContiguous: true,
    checkpointDoesNotImplyCompleteCoverage: true,
    historicalSnapshotsRemainImmutableAuditRecords: true,
  },
  counts,
  providers: rows,
};

const reportContent = `${JSON.stringify(report, null, 2)}\n`;
const csvContent = csv([
  [
    "provider_key","provider","maker_id","source_id","snapshots","snapshot_entries","unique_snapshot_external_ids",
    "approved_mappings","review_publish","review_hold","review_reject","latest_snapshot_id","latest_captured_at",
    "latest_complete_traversal","window_kind","order_basis","window_start_external_id","window_end_external_id",
    "resume_after_external_id","continues_from_snapshot_id","continuation_chain_depth","source_discovered","source_reviewed",
    "source_published","source_unrecognized","source_complete_traversal"
  ],
  ...rows.map((item) => [
    item.providerKey,item.provider,item.makerId,item.sourceId,item.totalSnapshots,item.totalSnapshotEntries,item.uniqueSnapshotExternalIds,
    item.approvedMappings,item.reviews.publish,item.reviews.hold,item.reviews.reject,item.latestSnapshotId ?? "",item.latestCapturedAt ?? "",
    item.latestCompleteTraversal ? "true" : "false",item.coverageWindow?.kind ?? "",item.coverageWindow?.orderBasis ?? "",
    item.coverageWindow?.startExternalId ?? "",item.coverageWindow?.endExternalId ?? "",item.resumeCheckpoint.externalId ?? "",
    item.coverageWindow?.continuesFromSnapshotId ?? "",item.continuationChainDepth ?? "",
    item.sourceCoverage?.discovered ?? "",item.sourceCoverage?.reviewed ?? "",item.sourceCoverage?.published ?? "",
    item.sourceCoverage?.unrecognized ?? "",item.sourceCoverage?.completeTraversal ? "true" : "false",
  ]),
]);

const outputs = new Map([
  ["exports/reports/series-index-progress.json", reportContent],
  ["exports/csv/series-index-progress.csv", csvContent],
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
  console.error(`Series Index Progress 不是最新状态：\n- ${stale.join("\n- ")}\n请运行 pnpm series:index:progress`);
  process.exit(1);
}
console.log(`Series Index Progress：providers=${counts.providers}, resume=${counts.withResumeCheckpoint}, complete=${counts.completeProviders}, holds=${counts.holdReviews}`);
