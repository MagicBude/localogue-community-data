import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const libraryRoot = path.join(repoRoot, "library");
const sourceRoot = path.join(repoRoot, "sources");
const registryRoot = path.join(repoRoot, "registry");
const errors = [];
const warnings = [];

const ENTITY_TYPES = ["person", "work", "maker", "label", "series", "genre"];
const SOURCE_KINDS = ["official", "agency", "social", "database", "other"];
const SOURCE_ENTITY_TYPES = ["person", "work", "organization", "series", "genre"];
const COLLECTION_BY_TYPE = {
  person: "people",
  work: "works",
  maker: "organizations",
  label: "organizations",
  series: "series",
  genre: "genres",
};

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
const registry = await readRegistry();
const mergePlans = await readMergePlans();
validateRegistry(registry, mergePlans);
validateMergePlans(mergePlans, registry);
await validateSourceRecords(registry);
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
  if (value.version && !isSemver(value.version)) errors.push("localogue-pack.json: version 必须使用 SemVer，例如 0.2.0");
  if (value.languages !== undefined) {
    if (!Array.isArray(value.languages)) errors.push("localogue-pack.json: languages 必须为数组");
    else {
      requireUniqueStrings(value.languages, "localogue-pack.json: languages");
      for (const language of value.languages) {
        if (!["ja", "zh-CN", "en"].includes(language)) errors.push(`localogue-pack.json: 不支持的 language (${language})`);
      }
    }
  }
  for (const key of ["createdAt", "updatedAt"]) {
    if (value[key] !== undefined && !isDateTime(value[key])) errors.push(`localogue-pack.json: ${key} 必须为有效 ISO 8601 时间`);
  }
  requireOnlyKeys(value, [
    "schemaVersion", "kind", "id", "name", "version", "description", "languages",
    "license", "sourceUrl", "createdAt", "updatedAt",
  ], "localogue-pack.json");
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
    for (const relation of person.organizationRelations ?? []) {
      if (!relation?.organizationId || !indexes.organizations.has(relation.organizationId)) {
        errors.push(`person ${person.id}: organization 引用不存在 (${relation?.organizationId ?? "<empty>"})`);
      }
    }
  }
}

function validateOrganizations() {
  for (const org of collections.organizations) {
    if (org.schemaVersion !== 1) errors.push(`organization ${org.id}: schemaVersion 必须为 1`);
    if (!["maker", "label"].includes(org.kind)) errors.push(`organization ${org.id}: kind 必须为 maker 或 label`);
    requireUuidId(org.id, org.kind === "label" ? "label" : org.kind === "maker" ? "maker" : "organization", `organization ${org.id}`);
    if (!org.names?.ja?.trim()) errors.push(`organization ${org.id}: 缺少 names.ja 日文原名`);
    if (org.parentOrganizationId && !indexes.organizations.has(org.parentOrganizationId)) {
      errors.push(`organization ${org.id}: parentOrganizationId 不存在 (${org.parentOrganizationId})`);
    } else if (org.kind === "label" && org.parentOrganizationId) {
      const parent = indexes.organizations.get(org.parentOrganizationId);
      if (parent?.kind !== "maker") errors.push(`organization ${org.id}: Label 的 parentOrganizationId 必须指向 Maker`);
    }
  }
}

function validateSeries() {
  for (const series of collections.series) {
    requireUuidId(series.id, "series", `series ${series.id}`);
    if (series.schemaVersion !== 1) errors.push(`series ${series.id}: schemaVersion 必须为 1`);
    if (!series.names?.ja?.trim()) errors.push(`series ${series.id}: 缺少 names.ja 日文原名`);
  }
}

function validateGenres() {
  for (const genre of collections.genres) {
    requireUuidId(genre.id, "genre", `genre ${genre.id}`);
    if (genre.schemaVersion !== 1) errors.push(`genre ${genre.id}: schemaVersion 必须为 1`);
    if (!genre.names?.ja?.trim()) errors.push(`genre ${genre.id}: 缺少 names.ja 日文原名`);
  }
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
    if (work.makerId) requireOrganizationRef(work.id, "maker", work.makerId);
    if (work.labelId) requireOrganizationRef(work.id, "label", work.labelId);
    for (const id of work.seriesIds ?? []) requireRef(work.id, "series", id, indexes.series);
    for (const id of work.genreIds ?? []) requireRef(work.id, "genre", id, indexes.genres);
    if ((work.tagIds?.length ?? 0) > 0) errors.push(`work ${work.id}: Community Work 不应包含用户 Tag`);
    if ((work.assetIds?.length ?? 0) > 0) errors.push(`work ${work.id}: community-data 当前不接受图片 Asset 引用`);
    if ((work.mediaFileIds?.length ?? 0) > 0) errors.push(`work ${work.id}: Community Work 不得包含私人 MediaFile 引用`);
  }
}

async function readRegistry() {
  const registryPath = path.join(registryRoot, "community-ids.json");
  const value = await readJson(registryPath, "registry/community-ids.json");
  const entries = new Map();
  if (!value) return { value: null, entries };

  if (value.schemaVersion !== 1) errors.push("registry/community-ids.json: schemaVersion 必须为 1");
  if (!Array.isArray(value.entries)) {
    errors.push("registry/community-ids.json: entries 必须为数组");
    return { value, entries };
  }
  requireOnlyKeys(value, ["schemaVersion", "entries"], "registry/community-ids.json");

  const idsInOrder = [];
  for (const [index, entry] of value.entries.entries()) {
    const label = `registry/community-ids.json: entries[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`${label} 必须为对象`);
      continue;
    }
    if (typeof entry.id !== "string" || !entry.id.trim()) {
      errors.push(`${label} 缺少 id`);
      continue;
    }
    idsInOrder.push(entry.id);
    if (entries.has(entry.id)) errors.push(`${label} 出现重复 id (${entry.id})`);
    else entries.set(entry.id, entry);
  }
  if (idsInOrder.join("\n") !== [...idsInOrder].sort().join("\n")) {
    errors.push("registry/community-ids.json: entries 必须按 id 升序排列，减少多人编辑时的无意义冲突");
  }
  return { value, entries };
}

async function readMergePlans() {
  const planRoot = path.join(registryRoot, "merge-plans");
  let names = [];
  try { names = await readdir(planRoot); }
  catch (error) {
    if (error?.code !== "ENOENT") errors.push(`registry/merge-plans/: 无法读取 (${error.message})`);
  }

  const plans = new Map();
  for (const fileName of names.filter((name) => name.endsWith(".json")).sort()) {
    const label = `registry/merge-plans/${fileName}`;
    const plan = await readJson(path.join(planRoot, fileName), label);
    if (!plan) continue;
    if (!plan.id || `${plan.id}.json` !== fileName) errors.push(`${label}: 文件名必须等于 id`);
    if (plans.has(plan.id)) errors.push(`${label}: 重复 Merge Plan ID (${plan.id})`);
    else plans.set(plan.id, plan);
  }
  return plans;
}

function validateRegistry(registry, mergePlans) {
  for (const [id, entry] of registry.entries) {
    const label = `registry entry ${id}`;
    const prefix = getIdPrefix(id);
    if (!ENTITY_TYPES.includes(entry.entityType)) errors.push(`${label}: entityType 无效 (${entry.entityType})`);
    if (prefix !== entry.entityType) errors.push(`${label}: entityType 必须与 ID 前缀一致`);
    requireUuidId(id, entry.entityType ?? "unknown", label);

    const expectedCollection = COLLECTION_BY_TYPE[entry.entityType];
    if (entry.collection !== expectedCollection) {
      errors.push(`${label}: collection 应为 ${expectedCollection ?? "<unknown>"}`);
    }
    if (!isSemver(entry.firstPublishedIn)) errors.push(`${label}: firstPublishedIn 必须为 SemVer`);
    else if (manifest?.version && compareSemver(entry.firstPublishedIn, manifest.version) > 0) {
      errors.push(`${label}: firstPublishedIn 不得晚于当前 Pack 版本 ${manifest.version}`);
    }

    if (entry.status === "active") {
      requireOnlyKeys(entry, ["id", "entityType", "collection", "status", "firstPublishedIn"], label);
      const entity = allEntities.get(id);
      if (!entity) errors.push(`${label}: active ID 必须存在对应 library 实体`);
      else if (entity.collection !== entry.collection) errors.push(`${label}: library collection 与 Registry 不一致`);
    } else if (entry.status === "redirect") {
      requireOnlyKeys(entry, [
        "id", "entityType", "collection", "status", "firstPublishedIn",
        "canonicalId", "mergePlanId", "retiredIn",
      ], label);
      if (allEntities.has(id)) errors.push(`${label}: redirect ID 不得继续保留 active library 实体`);
      if (entry.canonicalId === id) errors.push(`${label}: canonicalId 不得指向自己`);
      if (!isSemver(entry.retiredIn)) errors.push(`${label}: retiredIn 必须为 SemVer`);
      else if (manifest?.version && compareSemver(entry.retiredIn, manifest.version) > 0) {
        errors.push(`${label}: retiredIn 不得晚于当前 Pack 版本 ${manifest.version}`);
      }
      if (!isUuidId(entry.mergePlanId, "merge")) errors.push(`${label}: mergePlanId 必须使用 merge_<UUIDv4>`);
      if (!mergePlans.has(entry.mergePlanId)) errors.push(`${label}: 找不到 Merge Plan (${entry.mergePlanId})`);
    } else {
      errors.push(`${label}: status 必须为 active 或 redirect`);
    }
  }

  for (const [id] of allEntities) {
    const entry = registry.entries.get(id);
    if (!entry) errors.push(`library 实体 ${id}: 尚未登记到 registry/community-ids.json`);
    else if (entry.status !== "active") errors.push(`library 实体 ${id}: Registry 状态必须为 active`);
  }

  for (const [id, entry] of registry.entries) {
    if (entry.status !== "redirect") continue;
    const target = registry.entries.get(entry.canonicalId);
    if (!target) errors.push(`registry entry ${id}: canonicalId 未登记 (${entry.canonicalId})`);
    else {
      if (target.status !== "active") errors.push(`registry entry ${id}: canonicalId 必须直接指向 active ID，禁止 Redirect 链`);
      if (target.entityType !== entry.entityType) errors.push(`registry entry ${id}: Redirect 不得跨 entityType`);
    }
  }
}

function validateMergePlans(mergePlans, registry) {
  for (const [id, plan] of mergePlans) {
    const label = `merge plan ${id}`;
    requireUuidId(id, "merge", label);
    if (plan.schemaVersion !== 1) errors.push(`${label}: schemaVersion 必须为 1`);
    if (!ENTITY_TYPES.includes(plan.entityType)) errors.push(`${label}: entityType 无效 (${plan.entityType})`);
    if (plan.sourceId === plan.targetId) errors.push(`${label}: sourceId 与 targetId 不得相同`);
    if (getIdPrefix(plan.sourceId) !== plan.entityType || getIdPrefix(plan.targetId) !== plan.entityType) {
      errors.push(`${label}: sourceId、targetId 与 entityType 必须使用相同前缀`);
    }
    requireUuidId(plan.sourceId, plan.entityType ?? "unknown", label);
    requireUuidId(plan.targetId, plan.entityType ?? "unknown", label);
    if (!["proposed", "approved", "applied", "rejected"].includes(plan.status)) {
      errors.push(`${label}: status 无效 (${plan.status})`);
    }
    if (typeof plan.rationale !== "string" || !plan.rationale.trim()) errors.push(`${label}: rationale 不能为空`);
    if (!isDate(plan.createdAt)) errors.push(`${label}: createdAt 必须为 YYYY-MM-DD`);
    if (!Array.isArray(plan.evidence) || plan.evidence.length === 0) {
      errors.push(`${label}: evidence 至少需要一项公开证据`);
    } else {
      for (const [index, evidence] of plan.evidence.entries()) {
        if (!isHttpUrl(evidence?.url)) errors.push(`${label}: evidence[${index}].url 必须为 http/https URL`);
        if (!evidence?.note?.trim()) errors.push(`${label}: evidence[${index}].note 不能为空`);
        requireOnlyKeys(evidence, ["url", "note"], `${label}: evidence[${index}]`);
      }
    }
    if (!Array.isArray(plan.affectedEntityIds)) errors.push(`${label}: affectedEntityIds 必须为数组`);
    else {
      requireUniqueStrings(plan.affectedEntityIds, `${label}: affectedEntityIds`);
      for (const affectedId of plan.affectedEntityIds) {
        if (!allEntities.has(affectedId)) errors.push(`${label}: affectedEntityIds 中的实体不存在 (${affectedId})`);
      }
    }

    const source = registry.entries.get(plan.sourceId);
    const target = registry.entries.get(plan.targetId);
    if (["proposed", "approved", "rejected"].includes(plan.status)) {
      if (source?.status !== "active") errors.push(`${label}: ${plan.status} 阶段 sourceId 必须保持 active`);
      if (target?.status !== "active") errors.push(`${label}: ${plan.status} 阶段 targetId 必须保持 active`);
    }
    if (["approved", "applied", "rejected"].includes(plan.status)) {
      if (!isDate(plan.reviewedAt)) errors.push(`${label}: ${plan.status} 状态必须填写 reviewedAt`);
      if (!plan.decisionNote?.trim()) errors.push(`${label}: ${plan.status} 状态必须填写 decisionNote`);
    }
    if (plan.status === "applied") {
      if (!isDate(plan.appliedAt)) errors.push(`${label}: applied 状态必须填写 appliedAt`);
      if (source?.status !== "redirect") errors.push(`${label}: applied 后 sourceId 必须成为 redirect`);
      if (source?.canonicalId !== plan.targetId) errors.push(`${label}: Redirect canonicalId 必须等于 targetId`);
      if (source?.mergePlanId !== plan.id) errors.push(`${label}: Registry mergePlanId 必须指向本计划`);
      if (target?.status !== "active") errors.push(`${label}: applied 后 targetId 必须保持 active`);
    }

    requireOnlyKeys(plan, [
      "schemaVersion", "id", "entityType", "sourceId", "targetId", "status",
      "rationale", "evidence", "affectedEntityIds", "createdAt", "reviewedAt",
      "decisionNote", "appliedAt",
    ], label);
  }
}

async function validateSourceRecords(registry) {
  let names = [];
  try { names = await readdir(sourceRoot); }
  catch (error) {
    if (error?.code !== "ENOENT") errors.push(`sources/: 无法读取 (${error.message})`);
  }
  const records = new Map();
  for (const fileName of names.filter((name) => name.endsWith(".json")).sort()) {
    const record = await readJson(path.join(sourceRoot, fileName), `sources/${fileName}`);
    if (!record) continue;
    const label = `sources/${fileName}`;
    if (!record.entityId || `${record.entityId}.json` !== fileName) errors.push(`${label}: 文件名必须等于 entityId`);
    const registryEntry = registry.entries.get(record.entityId);
    if (!registryEntry) errors.push(`${label}: entityId 未登记到 Community ID Registry (${record.entityId})`);
    if (!allEntities.has(record.entityId) && registryEntry?.status !== "redirect") {
      errors.push(`${label}: entityId 既不是 active library 实体，也不是已登记 Redirect (${record.entityId})`);
    }
    if (record.schemaVersion !== 1) errors.push(`${label}: schemaVersion 必须为 1`);
    if (!SOURCE_ENTITY_TYPES.includes(record.entityType)) errors.push(`${label}: entityType 无效 (${record.entityType})`);
    const expectedSourceType = sourceEntityTypeForId(record.entityId);
    if (record.entityType !== expectedSourceType) errors.push(`${label}: entityType 应为 ${expectedSourceType}`);
    if (!Array.isArray(record.sources) || record.sources.length === 0) errors.push(`sources/${fileName}: 至少需要一个 source`);
    const supportedFields = new Set();
    for (const [index, source] of (record.sources ?? []).entries()) {
      const sourceLabel = `${label}: sources[${index}]`;
      if (!isHttpUrl(source?.url)) errors.push(`${sourceLabel} url 必须为 http/https URL`);
      if (!SOURCE_KINDS.includes(source?.kind)) errors.push(`${sourceLabel} kind 无效 (${source?.kind})`);
      if (!isDate(source?.accessedAt)) errors.push(`${sourceLabel} accessedAt 必须为 YYYY-MM-DD`);
      if (!Array.isArray(source?.fields) || source.fields.length === 0) errors.push(`${sourceLabel} fields 不能为空`);
      else {
        requireUniqueStrings(source.fields, `${sourceLabel} fields`);
        for (const field of source.fields) {
          supportedFields.add(field);
          const rootField = field.split(".")[0];
          const entity = allEntities.get(record.entityId)?.item;
          if (entity && !Object.hasOwn(entity, rootField)) {
            errors.push(`${sourceLabel}: fields 指向实体中不存在的字段 (${field})`);
          }
        }
      }
      requireOnlyKeys(source, ["url", "kind", "title", "accessedAt", "fields", "note"], sourceLabel);
    }
    requireOnlyKeys(record, ["schemaVersion", "entityId", "entityType", "sources"], label);
    if (records.has(record.entityId)) errors.push(`${label}: entityId 重复 (${record.entityId})`);
    records.set(record.entityId, record);

    const requiredEvidenceFields = requiredSourceFieldsForId(record.entityId);
    for (const requiredField of requiredEvidenceFields) {
      if (![...supportedFields].some((field) => field === requiredField || field.startsWith(`${requiredField}.`))) {
        errors.push(`${label}: 至少一个 source 必须声明支持 ${requiredField}`);
      }
    }
  }

  for (const [id, info] of allEntities) {
    if (["people", "works", "organizations", "series"].includes(info.collection) && !records.has(id)) {
      errors.push(`${info.collection}/${id}: 缺少 sources/${id}.json`);
    }
  }

  for (const [id, entry] of registry.entries) {
    if (entry.status === "redirect" && entry.collection !== "genres" && !records.has(id)) {
      errors.push(`redirect ${id}: 必须保留 sources/${id}.json，不能因合并丢失原始来源历史`);
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

function requireOrganizationRef(ownerId, kind, id) {
  const organization = indexes.organizations.get(id);
  if (!organization) errors.push(`work ${ownerId}: ${kind} 引用不存在 (${id ?? "<empty>"})`);
  else if (organization.kind !== kind) errors.push(`work ${ownerId}: ${id} 的 kind 不是 ${kind}`);
}

function normalizeCode(value) {
  return String(value).normalize("NFKC").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function requireOnlyKeys(value, allowedKeys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${label}: 必须为对象`);
    return;
  }
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors.push(`${label}: 不允许未知字段 ${key}`);
  }
}

function requireUniqueStrings(values, label) {
  if (!Array.isArray(values)) {
    errors.push(`${label}: 必须为数组`);
    return;
  }
  const seen = new Set();
  for (const value of values) {
    if (typeof value !== "string" || !value.trim()) errors.push(`${label}: 只能包含非空字符串`);
    else if (seen.has(value)) errors.push(`${label}: 包含重复值 (${value})`);
    else seen.add(value);
  }
}

function getIdPrefix(value) {
  return typeof value === "string" ? value.slice(0, value.indexOf("_")) : "";
}

function sourceEntityTypeForId(id) {
  const prefix = getIdPrefix(id);
  return ["maker", "label"].includes(prefix) ? "organization" : prefix;
}

function requiredSourceFieldsForId(id) {
  const prefix = getIdPrefix(id);
  if (prefix === "person") return ["names"];
  if (prefix === "work") return ["code", "titles"];
  if (["maker", "label", "series"].includes(prefix)) return ["names"];
  return [];
}

function isUuidId(value, prefix) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, "i").test(value ?? "");
}

function isSemver(value) {
  return typeof value === "string" && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value);
}

function compareSemver(left, right) {
  const leftParts = left.split("-")[0].split(".").map(Number);
  const rightParts = right.split("-")[0].split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) return leftParts[index] - rightParts[index];
  }
  return 0;
}

function isDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isDateTime(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) && /T/.test(value);
}

function isHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
