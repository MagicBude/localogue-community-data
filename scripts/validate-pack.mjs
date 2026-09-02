import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const libraryRoot = path.join(repoRoot, "library");
const sourceRoot = path.join(repoRoot, "sources");
const errors = [];
const warnings = [];

const manifest = await readJson(path.join(repoRoot, "localogue-pack.json"), "localogue-pack.json");
validateManifest(manifest);

const collections = {
  people: await readCollection("people"),
  works: await readCollection("works"),
  organizations: await readCollection("organizations"),
  series: await readCollection("series"),
  genres: await readCollection("genres"),
};

const indexes = Object.fromEntries(
  Object.entries(collections).map(([name, items]) => [name, new Map(items.map((item) => [item.id, item]))]),
);
const allEntities = new Map();
for (const [collection, items] of Object.entries(collections)) {
  for (const item of items) {
    if (allEntities.has(item.id)) {
      errors.push(`跨 collection 重复 id: ${item.id}`);
    } else {
      allEntities.set(item.id, { collection, item });
    }
  }
}

validatePeople();
validateOrganizations();
validateSeries();
validateGenres();
validateWorks();
await validateSourceRecords();
await validateForbiddenCommunityData();

if (warnings.length) {
  console.warn("\nLocalogue Community Data 校验提醒：\n");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error("\nLocalogue Community Data 校验失败：\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Localogue Community Data 校验通过。\n");
  console.table(Object.fromEntries(Object.entries(collections).map(([key, values]) => [key, values.length])));
}

function validateManifest(value) {
  if (!value) return;
  if (value.schemaVersion !== 1) errors.push("localogue-pack.json: schemaVersion 必须为 1");
  if (value.kind !== "shared-library") errors.push("localogue-pack.json: kind 必须为 shared-library");
  for (const key of ["id", "name", "version"]) {
    if (typeof value[key] !== "string" || !value[key].trim()) errors.push(`localogue-pack.json: 缺少 ${key}`);
  }
}

async function readCollection(name) {
  const dir = path.join(libraryRoot, name);
  let fileNames;
  try { fileNames = await readdir(dir); }
  catch (error) {
    if (error?.code === "ENOENT") return [];
    errors.push(`${name}: 无法读取目录 (${error.message})`);
    return [];
  }
  const items = [];
  const ids = new Set();
  for (const fileName of fileNames.filter((name) => name.endsWith(".json")).sort()) {
    const item = await readJson(path.join(dir, fileName), `${name}/${fileName}`);
    if (!item) continue;
    if (typeof item.id !== "string" || !item.id) {
      errors.push(`${name}/${fileName}: 缺少字符串 id`);
      continue;
    }
    if (`${item.id}.json` !== fileName) errors.push(`${name}/${fileName}: 文件名必须与 id 完全一致`);
    if (ids.has(item.id)) errors.push(`${name}: 重复 id ${item.id}`);
    ids.add(item.id);
    items.push(item);
  }
  return items;
}

function validatePeople() {
  for (const person of collections.people) {
    requireUuidId(person.id, "person", `person ${person.id}`);
    if (person.schemaVersion !== 1) errors.push(`person ${person.id}: schemaVersion 必须为 1`);
    const names = Array.isArray(person.names) ? person.names : [];
    if (!names.some((name) => name?.language === "ja" && name?.type === "primary" && name?.value?.trim())) {
      errors.push(`person ${person.id}: 至少需要一个日文 primary 姓名`);
    }
    if (person.portraitAssetId || (person.galleryAssetIds?.length ?? 0) > 0) {
      errors.push(`person ${person.id}: community-data 当前不接受图片 Asset 引用，请留给独立 Asset Pack 或本地偏好`);
    }
  }
}

function validateOrganizations() {
  for (const org of collections.organizations) {
    if (!['maker','label'].includes(org.kind)) errors.push(`organization ${org.id}: kind 必须为 maker 或 label`);
    requireUuidId(org.id, org.kind === 'label' ? 'label' : org.kind === 'maker' ? 'maker' : 'organization', `organization ${org.id}`);
    if (org.parentOrganizationId && !indexes.organizations.has(org.parentOrganizationId)) {
      errors.push(`organization ${org.id}: parentOrganizationId 不存在 (${org.parentOrganizationId})`);
    }
  }
}

function validateSeries() {
  for (const series of collections.series) requireUuidId(series.id, "series", `series ${series.id}`);
}

function validateGenres() {
  for (const genre of collections.genres) requireUuidId(genre.id, "genre", `genre ${genre.id}`);
}

function validateWorks() {
  const codes = new Map();
  for (const work of collections.works) {
    requireUuidId(work.id, "work", `work ${work.id}`);
    if (work.schemaVersion !== 1) errors.push(`work ${work.id}: schemaVersion 必须为 1`);
    if (work.originalLanguage !== "ja") warnings.push(`work ${work.id}: originalLanguage 不是 ja，请确认是否确实为非日文原始作品`);
    if (!work.titles?.ja?.trim()) errors.push(`work ${work.id}: 缺少 titles.ja 日文原题`);
    if (!work.code?.trim()) {
      errors.push(`work ${work.id}: 缺少 code`);
    } else {
      const normalized = normalizeCode(work.code);
      if (codes.has(normalized)) errors.push(`work ${work.id}: 番号与 ${codes.get(normalized)} 重复 (${work.code})`);
      else codes.set(normalized, work.id);
    }
    for (const relation of work.personRelations ?? []) requireRef(work.id, "person", relation.personId, indexes.people);
    if (work.makerId) requireRef(work.id, "maker", work.makerId, indexes.organizations);
    if (work.labelId) requireRef(work.id, "label", work.labelId, indexes.organizations);
    for (const id of work.seriesIds ?? []) requireRef(work.id, "series", id, indexes.series);
    for (const id of work.genreIds ?? []) requireRef(work.id, "genre", id, indexes.genres);
    if ((work.tagIds?.length ?? 0) > 0) errors.push(`work ${work.id}: Community Work 不应包含用户 Tag`);
    if ((work.assetIds?.length ?? 0) > 0) errors.push(`work ${work.id}: community-data 当前不接受图片 Asset 引用`);
    if ((work.mediaFileIds?.length ?? 0) > 0) errors.push(`work ${work.id}: Community Work 不得包含私人 MediaFile 引用`);
  }
}

async function validateSourceRecords() {
  let names = [];
  try { names = await readdir(sourceRoot); }
  catch (error) {
    if (error?.code !== "ENOENT") errors.push(`sources/: 无法读取 (${error.message})`);
  }
  const records = new Map();
  for (const fileName of names.filter((name) => name.endsWith(".json")).sort()) {
    const record = await readJson(path.join(sourceRoot, fileName), `sources/${fileName}`);
    if (!record) continue;
    if (!record.entityId || `${record.entityId}.json` !== fileName) errors.push(`sources/${fileName}: 文件名必须等于 entityId`);
    if (!allEntities.has(record.entityId)) errors.push(`sources/${fileName}: entityId 不存在于 library (${record.entityId})`);
    if (!Array.isArray(record.sources) || record.sources.length === 0) errors.push(`sources/${fileName}: 至少需要一个 source`);
    for (const [index, source] of (record.sources ?? []).entries()) {
      if (!source?.url?.trim()) errors.push(`sources/${fileName}: sources[${index}] 缺少 url`);
      if (!source?.accessedAt?.trim()) errors.push(`sources/${fileName}: sources[${index}] 缺少 accessedAt`);
      if (!Array.isArray(source?.fields) || source.fields.length === 0) errors.push(`sources/${fileName}: sources[${index}] fields 不能为空`);
    }
    records.set(record.entityId, record);
  }

  for (const [id, info] of allEntities) {
    if (["people", "works", "organizations", "series"].includes(info.collection) && !records.has(id)) {
      errors.push(`${info.collection}/${id}: 缺少 sources/${id}.json`);
    }
  }
}

async function validateForbiddenCommunityData() {
  for (const name of ["media-files", "presentation-preferences", "person-edits", "evidence", "review-commits"]) {
    const dir = path.join(libraryRoot, name);
    try {
      const info = await stat(dir);
      if (!info.isDirectory()) continue;
      const names = await readdir(dir);
      if (names.some((file) => file.endsWith(".json"))) errors.push(`library/${name}: Community Data 不允许包含私人运行数据`);
    } catch (error) {
      if (error?.code !== "ENOENT") errors.push(`library/${name}: 无法检查 (${error.message})`);
    }
  }
  const tagsDir = path.join(libraryRoot, "tags");
  try {
    const names = await readdir(tagsDir);
    if (names.some((file) => file.endsWith(".json"))) errors.push("library/tags: Tag 属于用户组织层，Community Data 当前不共享 Tag");
  } catch (error) {
    if (error?.code !== "ENOENT") errors.push(`library/tags: 无法检查 (${error.message})`);
  }
  const assetsDir = path.join(libraryRoot, "assets");
  try {
    const names = await readdir(assetsDir);
    if (names.some((file) => file.endsWith(".json"))) errors.push("library/assets: 当前数据仓库不接受图片 Asset；未来使用独立 Community Asset Pack");
  } catch (error) {
    if (error?.code !== "ENOENT") errors.push(`library/assets: 无法检查 (${error.message})`);
  }
}

async function readJson(filePath, label) {
  try { return JSON.parse(await readFile(filePath, "utf8")); }
  catch (error) { errors.push(`${label}: JSON 无法解析或文件不可读 (${error.message})`); return null; }
}

function requireUuidId(id, prefix, owner) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escaped}_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, "i");
  if (!pattern.test(id ?? "")) errors.push(`${owner}: id 必须使用 ${prefix}_<UUIDv4>`);
}

function requireRef(ownerId, kind, id, index) {
  if (!id || !index.has(id)) errors.push(`work ${ownerId}: ${kind} 引用不存在 (${id ?? "<empty>"})`);
}

function normalizeCode(value) {
  return String(value).normalize("NFKC").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
