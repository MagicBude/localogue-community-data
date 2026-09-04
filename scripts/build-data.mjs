import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const collections = ["people", "works", "organizations", "series", "genres"];

async function jsonFiles(dir) {
  try {
    return (await fs.readdir(dir)).filter((name) => name.endsWith(".json")).sort();
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function readJson(relative, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(path.join(root, relative), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function readEntities(collection) {
  const dir = path.join(root, "data", collection);
  const result = [];
  for (const file of await jsonFiles(dir)) {
    result.push(JSON.parse(await fs.readFile(path.join(dir, file), "utf8")));
  }
  return result.sort((a, b) => a.id.localeCompare(b.id));
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
function csv(rows) {
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}
function name(person, language, type) {
  return person.names.find((n) => n.language === language && (!type || n.type === type))?.value ?? "";
}
function career(person, type) {
  return person.careerEvents?.find((event) => event.type === type)?.date?.value ?? "";
}
function localizedAliases(entity, language) {
  return (entity.aliases?.[language] ?? []).join(";");
}
function externalIds(entity) {
  return Object.entries(entity.externalIds ?? {}).map(([provider, id]) => `${provider}:${id}`).join(";");
}

const data = Object.fromEntries(
  await Promise.all(collections.map(async (collection) => [collection, await readEntities(collection)])),
);
const output = new Map();

for (const collection of collections) {
  for (const entity of data[collection]) {
    output.set(`library/${collection}/${entity.id}.json`, `${JSON.stringify(entity, null, 2)}\n`);
  }
}
for (const file of await jsonFiles(path.join(root, "data", "sources"))) {
  output.set(`sources/${file}`, await fs.readFile(path.join(root, "data", "sources", file), "utf8"));
}

// Registry 是已发布 ID 的生命周期账本，不应只根据当前 data/ 机械重建。
// 0.4.0 起保留既有 redirect，并拒绝“删除 active 实体后静默丢 ID”的情况。
const currentRegistry = await readJson("registry/community-ids.json", { schemaVersion: 1, entries: [] });
const currentById = new Map((currentRegistry.entries ?? []).map((entry) => [entry.id, entry]));
const manifest = await readJson("localogue-pack.json", { version: "0.0.0" });
const typeFor = (collection, entity) => collection === "organizations" ? entity.kind : collection === "people" ? "person" : collection === "series" ? "series" : collection.slice(0, -1);
const activeEntries = [];
const activeIds = new Set();
for (const collection of collections) {
  for (const entity of data[collection]) {
    const entityType = typeFor(collection, entity);
    const previous = currentById.get(entity.id);
    if (previous?.status === "redirect") {
      throw new Error(`Registry 生命周期冲突：${entity.id} 已是 redirect，不能重新作为 active 实体发布。`);
    }
    activeIds.add(entity.id);
    activeEntries.push({
      id: entity.id,
      entityType,
      collection,
      status: "active",
      firstPublishedIn: previous?.firstPublishedIn ?? entity.firstPublishedIn ?? manifest.version,
    });
  }
}
const redirects = [];
for (const entry of currentRegistry.entries ?? []) {
  if (activeIds.has(entry.id)) continue;
  if (entry.status === "redirect") {
    redirects.push(entry);
    continue;
  }
  throw new Error(
    `Registry active ID ${entry.id} 在 data/ 中消失。已发布 ID 不允许静默删除；请先建立 Merge Plan/Redirect，或恢复实体。`,
  );
}
const entries = [...activeEntries, ...redirects].sort((a, b) => a.id.localeCompare(b.id));
output.set("registry/community-ids.json", `${JSON.stringify({ schemaVersion: 1, entries }, null, 2)}\n`);

const peopleHeader = ["id","name_ja","name_zh","name_en","occupation","status","aliases","debut_date","retirement_date","comeback_date","birth_date","height_cm","cup","bust_cm","waist_cm","hip_cm","birthplace_ja","blood_type","agency","biography_zh"];
const peopleRows = data.people.map((person) => [
  person.id,
  name(person, "ja", "primary"),
  name(person, "zh-CN"),
  name(person, "en"),
  (person.occupations ?? []).join(";"),
  person.activityStatus,
  (person.names ?? []).filter((entry) => entry.type === "alias").map((entry) => entry.value).join(";"),
  career(person, "debut"),
  career(person, "retirement"),
  career(person, "comeback"),
  person.birthDate?.value,
  person.heightCm,
  person.measurements?.cup,
  person.measurements?.bustCm,
  person.measurements?.waistCm,
  person.measurements?.hipCm,
  person.birthPlace?.ja,
  person.bloodType,
  person.agency?.name,
  person.biographies?.["zh-CN"],
]);
output.set("exports/csv/actress-overview.csv", csv([peopleHeader, ...peopleRows]));
output.set("exports/csv/people.csv", csv([peopleHeader, ...peopleRows]));

const workHeader = ["id","code","title_ja","release_date","duration_minutes","performers","maker_id","genre_ids","genres_ja","genres_zh","genres_en"];
const peopleById = new Map(data.people.map((person) => [person.id, name(person, "ja", "primary")]));
const genresById = new Map(data.genres.map((genre) => [genre.id, genre]));
const workRows = data.works.map((work) => {
  const genres = (work.genreIds ?? []).map((id) => genresById.get(id)).filter(Boolean);
  return [
    work.id,
    work.code,
    work.titles?.ja,
    work.releaseDate?.value,
    work.durationMinutes,
    (work.personRelations ?? []).map((relation) => peopleById.get(relation.personId) ?? relation.personId).join(";"),
    work.makerId,
    (work.genreIds ?? []).join(";"),
    genres.map((genre) => genre.names?.ja).join(";"),
    genres.map((genre) => genre.names?.["zh-CN"]).join(";"),
    genres.map((genre) => genre.names?.en).join(";"),
  ];
});
output.set("exports/csv/work-overview.csv", csv([workHeader, ...workRows]));

const genreHeader = ["id","facet","facet_ja","facet_zh","facet_en","assignment_target","name_ja","name_zh","name_en","aliases_ja","aliases_zh","aliases_en","status","translation_status"];
const genreRows = data.genres.map((genre) => [
  genre.id,
  genre.facet,
  genre.facetNames?.ja,
  genre.facetNames?.["zh-CN"],
  genre.facetNames?.en,
  genre.assignmentTarget,
  genre.names?.ja,
  genre.names?.["zh-CN"],
  genre.names?.en,
  (genre.aliases?.ja ?? []).join(";"),
  (genre.aliases?.["zh-CN"] ?? []).join(";"),
  (genre.aliases?.en ?? []).join(";"),
  genre.status,
  genre.translationStatus,
]);
output.set("exports/csv/genre-overview.csv", csv([genreHeader, ...genreRows]));
const aliasHeader = ["genre_id","facet","language","alias","canonical_name"];
const aliasRows = data.genres.flatMap((genre) => Object.entries(genre.aliases ?? {}).flatMap(([language, values]) =>
  (values ?? []).map((alias) => [genre.id, genre.facet, language, alias, genre.names?.[language] ?? ""]),
));
output.set("exports/csv/genre-aliases.csv", csv([aliasHeader, ...aliasRows]));

const organizationHeader = ["id","kind","name_ja","parent_organization_id","status","official_website","external_ids","first_published_in"];
const organizationRows = data.organizations.map((org) => [
  org.id,
  org.kind,
  org.names?.ja,
  org.parentOrganizationId,
  org.status ?? "",
  org.officialWebsite,
  externalIds(org),
  org.firstPublishedIn,
]);
output.set("exports/csv/organization-overview.csv", csv([organizationHeader, ...organizationRows]));

const organizationById = new Map(data.organizations.map((org) => [org.id, org]));
const seriesHeader = ["id","name_ja","name_zh","name_en","aliases_ja","aliases_zh","aliases_en","maker_id","maker_ja","label_id","label_ja","status","official_website","external_ids","first_known_release_date","first_published_in"];
const seriesRows = data.series.map((series) => [
  series.id,
  series.names?.ja,
  series.names?.["zh-CN"],
  series.names?.en,
  localizedAliases(series, "ja"),
  localizedAliases(series, "zh-CN"),
  localizedAliases(series, "en"),
  series.makerId,
  organizationById.get(series.makerId)?.names?.ja,
  series.labelId,
  organizationById.get(series.labelId)?.names?.ja,
  series.status,
  series.officialWebsite,
  externalIds(series),
  series.firstKnownReleaseDate?.value,
  series.firstPublishedIn,
]);
output.set("exports/csv/series-overview.csv", csv([seriesHeader, ...seriesRows]));

const publicSources = await readJson("registry/public-sources.json", { sources: [] });
const sourceRegistryHeader = ["source_id","name","source_type","base_url","entity_types","access_status","last_checked_at","complete_traversal","coverage","known_limitations"];
const sourceRegistryRows = (publicSources.sources ?? []).map((source) => [
  source.id,
  source.name,
  source.sourceType,
  source.baseUrl,
  (source.entityTypes ?? []).join(";"),
  source.accessStatus,
  source.lastCheckedAt,
  source.completeTraversal,
  (source.coverage ?? []).map((item) => `${item.entityType}:discovered=${item.discovered}|reviewed=${item.reviewed}|published=${item.published}|conflicts=${item.conflicts}|unrecognized=${item.unrecognized}`).join(";"),
  (source.knownLimitations ?? []).join(" | "),
]);
output.set("exports/csv/public-source-registry.csv", csv([sourceRegistryHeader, ...sourceRegistryRows]));

const mappings = await readJson("registry/external-id-mappings.json", { mappings: [] });
const mappingHeader = ["provider","entity_type","external_id","community_id","status","source_url","reviewed_at"];
const mappingRows = (mappings.mappings ?? []).map((mapping) => [
  mapping.provider,
  mapping.entityType,
  mapping.externalId,
  mapping.communityId,
  mapping.status,
  mapping.sourceUrl,
  mapping.reviewedAt,
]);
output.set("exports/csv/external-id-mappings.csv", csv([mappingHeader, ...mappingRows]));

const candidates = await readJson("staging/organization-candidates.json", { candidates: [] });
const candidateHeader = ["candidate_id","kind","name_ja","name_zh","name_en","status","reason_not_published","official_website","founded_date","source_urls"];
const candidateRows = (candidates.candidates ?? []).map((candidate) => [
  candidate.candidateId,
  candidate.kind,
  candidate.names?.ja,
  candidate.names?.["zh-CN"],
  candidate.names?.en,
  candidate.status,
  candidate.reasonNotPublished,
  candidate.facts?.officialWebsite,
  candidate.facts?.foundedDate?.value,
  (candidate.sources ?? []).map((source) => source.url).join(";"),
]);
output.set("exports/csv/organization-candidates.csv", csv([candidateHeader, ...candidateRows]));

let stale = [];
if (!checkOnly) {
  for (const collection of collections) {
    const dir = path.join(root, "library", collection);
    await fs.mkdir(dir, { recursive: true });
    for (const file of await jsonFiles(dir)) await fs.unlink(path.join(dir, file));
  }
  await fs.mkdir(path.join(root, "sources"), { recursive: true });
  for (const file of await jsonFiles(path.join(root, "sources"))) await fs.unlink(path.join(root, "sources", file));
}
for (const [relative, content] of output) {
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
  console.error(`生成物不是最新状态：\n- ${stale.join("\n- ")}\n请运行 pnpm data:build`);
  process.exit(1);
}
if (!checkOnly) console.log(`已从 data/ 生成 ${output.size} 个 JSON/CSV 文件；Registry 已保留历史生命周期记录。`);
