import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");

async function readJson(relative, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, relative), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}
async function readEntities(relative) {
  const dir = path.join(root, relative);
  let names = [];
  try { names = (await fs.readdir(dir)).filter((name) => name.endsWith(".json")).sort(); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  const result = [];
  for (const name of names) result.push(JSON.parse(await fs.readFile(path.join(dir, name), "utf8")));
  return result;
}
function normalize(value) {
  return String(value ?? "").normalize("NFKC").trim().toLocaleLowerCase("ja");
}
function csvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
function csv(rows) { return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`; }

const organizations = await readEntities("data/organizations");
const series = await readEntities("data/series");
const entities = [
  ...organizations.map((entity) => ({ ...entity, entityType: entity.kind })),
  ...series.map((entity) => ({ ...entity, entityType: "series" })),
];
const mappingsFile = await readJson("registry/external-id-mappings.json", { mappings: [] });
const observationsFile = await readJson("staging/provider-observations.json", { observations: [] });
const approvedMappings = (mappingsFile.mappings ?? []).filter((mapping) => mapping.status === "approved");
const mappingByKey = new Map(approvedMappings.map((mapping) => [
  `${mapping.provider}\0${mapping.entityType}\0${mapping.externalId}`,
  mapping,
]));
const entityById = new Map(entities.map((entity) => [entity.id, entity]));

function exactNameCandidates(observation) {
  const wanted = normalize(observation.nameJa);
  if (!wanted) return [];
  return entities.filter((entity) => entity.entityType === observation.entityType && normalize(entity.names?.ja) === wanted);
}
function aliasCandidates(observation) {
  const wanted = normalize(observation.nameJa);
  if (!wanted) return [];
  return entities.filter((entity) =>
    entity.entityType === observation.entityType &&
    (entity.aliases?.ja ?? []).some((alias) => normalize(alias) === wanted),
  );
}

const results = [];
for (const observation of observationsFile.observations ?? []) {
  const mapping = observation.externalId
    ? mappingByKey.get(`${observation.provider}\0${observation.entityType}\0${observation.externalId}`)
    : null;
  if (mapping) {
    results.push({
      classification: "auto-applied",
      reason: "approved-external-id",
      sourceId: observation.sourceId,
      provider: observation.provider,
      entityType: observation.entityType,
      externalId: observation.externalId,
      nameJa: observation.nameJa,
      communityId: mapping.communityId,
      sourceUrl: observation.sourceUrl,
    });
    continue;
  }

  const exact = exactNameCandidates(observation);
  if (exact.length === 1) {
    results.push({
      classification: "auto-applied",
      reason: "canonical-name-exact",
      sourceId: observation.sourceId,
      provider: observation.provider,
      entityType: observation.entityType,
      externalId: observation.externalId ?? "",
      nameJa: observation.nameJa,
      communityId: exact[0].id,
      sourceUrl: observation.sourceUrl,
    });
    continue;
  }
  if (exact.length > 1) {
    results.push({
      classification: "conflict",
      reason: "canonical-name-ambiguous",
      sourceId: observation.sourceId,
      provider: observation.provider,
      entityType: observation.entityType,
      externalId: observation.externalId ?? "",
      nameJa: observation.nameJa,
      candidateCommunityIds: exact.map((entity) => entity.id),
      sourceUrl: observation.sourceUrl,
    });
    continue;
  }

  const aliases = aliasCandidates(observation);
  if (aliases.length === 1) {
    results.push({
      classification: "auto-applied",
      reason: "registered-alias-exact",
      sourceId: observation.sourceId,
      provider: observation.provider,
      entityType: observation.entityType,
      externalId: observation.externalId ?? "",
      nameJa: observation.nameJa,
      communityId: aliases[0].id,
      sourceUrl: observation.sourceUrl,
    });
    continue;
  }
  if (aliases.length > 1) {
    results.push({
      classification: "conflict",
      reason: "registered-alias-ambiguous",
      sourceId: observation.sourceId,
      provider: observation.provider,
      entityType: observation.entityType,
      externalId: observation.externalId ?? "",
      nameJa: observation.nameJa,
      candidateCommunityIds: aliases.map((entity) => entity.id),
      sourceUrl: observation.sourceUrl,
    });
    continue;
  }

  if (observation.codePrefix || observation.titleSignal) {
    results.push({
      classification: "suggested",
      reason: observation.codePrefix ? "code-prefix-candidate" : "title-signal-candidate",
      sourceId: observation.sourceId,
      provider: observation.provider,
      entityType: observation.entityType,
      externalId: observation.externalId ?? "",
      nameJa: observation.nameJa,
      communityId: null,
      sourceUrl: observation.sourceUrl,
    });
    continue;
  }

  results.push({
    classification: "unrecognized",
    reason: "no-exact-reviewed-match",
    sourceId: observation.sourceId,
    provider: observation.provider,
    entityType: observation.entityType,
    externalId: observation.externalId ?? "",
    nameJa: observation.nameJa,
    communityId: null,
    sourceUrl: observation.sourceUrl,
  });
}

const counts = Object.fromEntries(["auto-applied", "suggested", "conflict", "unrecognized"].map((key) => [
  key,
  results.filter((result) => result.classification === key).length,
]));
const report = {
  schemaVersion: 1,
  generatedFrom: {
    mappings: "registry/external-id-mappings.json",
    observations: "staging/provider-observations.json"
  },
  policy: {
    autoApplied: ["approved external ID exact match", "unique Japanese canonical name exact match", "unique registered Japanese alias exact match"],
    suggestedOnly: ["code prefix candidate", "title signal candidate"],
    neverAutoApply: ["fuzzy similarity", "AI inference", "ambiguous name or alias"]
  },
  counts,
  results,
};
const jsonContent = `${JSON.stringify(report, null, 2)}\n`;
const csvHeader = ["classification","reason","source_id","provider","entity_type","external_id","name_ja","community_id","candidate_community_ids","source_url"];
const csvRows = results.map((result) => [
  result.classification,
  result.reason,
  result.sourceId,
  result.provider,
  result.entityType,
  result.externalId,
  result.nameJa,
  result.communityId ?? "",
  (result.candidateCommunityIds ?? []).join(";"),
  result.sourceUrl,
]);
const csvContent = csv([csvHeader, ...csvRows]);
const outputs = new Map([
  ["exports/reports/provider-reconciliation.json", jsonContent],
  ["exports/csv/provider-reconciliation.csv", csvContent],
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
  console.error(`Provider 对账报告不是最新状态：\n- ${stale.join("\n- ")}\n请运行 pnpm provider:reconcile`);
  process.exit(1);
}
console.log(`Provider 对账：auto-applied=${counts["auto-applied"]}, suggested=${counts.suggested}, conflicts=${counts.conflict}, unrecognized=${counts.unrecognized}`);

// 防止 approved mapping 指向已经不存在的正式实体。
for (const mapping of approvedMappings) {
  if (!entityById.has(mapping.communityId)) {
    console.error(`External ID Mapping 指向不存在的实体：${mapping.provider}:${mapping.externalId} -> ${mapping.communityId}`);
    process.exitCode = 1;
  }
}
