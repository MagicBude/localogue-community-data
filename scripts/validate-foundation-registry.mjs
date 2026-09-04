import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];

async function readJson(relative, fallback = null) {
  try { return JSON.parse(await fs.readFile(path.join(root, relative), "utf8")); }
  catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    errors.push(`${relative}: 无法读取或解析 JSON (${error.message})`);
    return fallback;
  }
}
async function readDirEntities(relative) {
  const dir = path.join(root, relative);
  let names = [];
  try { names = (await fs.readdir(dir)).filter((name) => name.endsWith(".json")).sort(); }
  catch (error) { if (error.code !== "ENOENT") errors.push(`${relative}: 无法读取目录 (${error.message})`); }
  const items = [];
  for (const name of names) {
    try { items.push(JSON.parse(await fs.readFile(path.join(dir, name), "utf8"))); }
    catch (error) { errors.push(`${relative}/${name}: 无法解析 (${error.message})`); }
  }
  return items;
}
function unique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) errors.push(`${label}: 重复值 ${value}`);
    seen.add(value);
  }
}
function isUrl(value) { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol); } catch { return false; } }
function isDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value ?? ""); }

const organizations = await readDirEntities("data/organizations");
const series = await readDirEntities("data/series");
const orgById = new Map(organizations.map((item) => [item.id, item]));
const seriesById = new Map(series.map((item) => [item.id, item]));
const entityById = new Map([...organizations, ...series].map((item) => [item.id, item]));

for (const org of organizations) {
  if (!/^(group|company|maker|label)_\d{6}$/.test(org.id ?? "")) errors.push(`organization ${org.id}: ID 格式无效`);
  if (!["group", "company", "maker", "label"].includes(org.kind)) errors.push(`organization ${org.id}: kind 无效 (${org.kind})`);
  if (!org.names?.ja?.trim()) errors.push(`organization ${org.id}: 缺少 names.ja`);
  if (org.status !== undefined && !["active", "inactive", "unknown"].includes(org.status)) errors.push(`organization ${org.id}: status 无效`);
  if (org.officialWebsite !== undefined && !isUrl(org.officialWebsite)) errors.push(`organization ${org.id}: officialWebsite 无效`);
  if (org.parentOrganizationId) {
    const parent = orgById.get(org.parentOrganizationId);
    if (!parent) errors.push(`organization ${org.id}: parentOrganizationId 不存在 (${org.parentOrganizationId})`);
    else {
      const allowed = {
        group: [],
        company: ["group"],
        maker: ["group", "company"],
        label: ["maker"],
      }[org.kind] ?? [];
      if (!allowed.includes(parent.kind)) errors.push(`organization ${org.id}: ${org.kind} 不能挂到 ${parent.kind}`);
    }
  } else if (org.kind === "label") {
    errors.push(`organization ${org.id}: Label 必须明确 parentOrganizationId，并直接指向 Maker`);
  }
}

for (const item of series) {
  if (!/^series_\d{6}$/.test(item.id ?? "")) errors.push(`series ${item.id}: ID 格式无效`);
  if (!item.names?.ja?.trim()) errors.push(`series ${item.id}: 缺少 names.ja`);
  if (!/^maker_\d{6}$/.test(item.makerId ?? "")) errors.push(`series ${item.id}: makerId 必须指向 Maker`);
  const maker = orgById.get(item.makerId);
  if (!maker || maker.kind !== "maker") errors.push(`series ${item.id}: makerId 不存在或不是 Maker (${item.makerId})`);
  if (item.labelId) {
    const label = orgById.get(item.labelId);
    if (!label || label.kind !== "label") errors.push(`series ${item.id}: labelId 不存在或不是 Label (${item.labelId})`);
    else if (label.parentOrganizationId !== item.makerId) errors.push(`series ${item.id}: Label 与 Maker 不属于同一层级关系`);
  }
  if (!["active", "inactive", "unknown"].includes(item.status)) errors.push(`series ${item.id}: status 必须为 active/inactive/unknown`);
  if (item.officialWebsite !== undefined && !isUrl(item.officialWebsite)) errors.push(`series ${item.id}: officialWebsite 无效`);
}
const seriesNames = new Map();
for (const item of series) {
  const key = item.names?.ja?.trim();
  if (!key) continue;
  const prior = seriesNames.get(key) ?? [];
  prior.push(item.id);
  seriesNames.set(key, prior);
}
for (const [name, ids] of seriesNames) {
  if (ids.length > 1) warnings.push(`Series 日文名重复，需要人工确认而不是自动合并：${name} -> ${ids.join(", ")}`);
}

const publicSources = await readJson("registry/public-sources.json", { sources: [] });
if (publicSources?.schemaVersion !== 1 || !Array.isArray(publicSources?.sources)) errors.push("registry/public-sources.json: 结构无效");
unique((publicSources?.sources ?? []).map((source) => source.id), "Public Source Registry source.id");
for (const source of publicSources?.sources ?? []) {
  if (!/^source_[a-z0-9_]+$/.test(source.id ?? "")) errors.push(`public source ${source.id}: id 格式无效`);
  if (!["official", "distributor", "database"].includes(source.sourceType)) errors.push(`public source ${source.id}: sourceType 无效`);
  if (!isUrl(source.baseUrl)) errors.push(`public source ${source.id}: baseUrl 无效`);
  if (!isDate(source.lastCheckedAt)) errors.push(`public source ${source.id}: lastCheckedAt 必须为 YYYY-MM-DD`);
  if (typeof source.completeTraversal !== "boolean") errors.push(`public source ${source.id}: completeTraversal 必须为布尔值`);
  for (const coverage of source.coverage ?? []) {
    for (const key of ["discovered", "reviewed", "published", "conflicts", "unrecognized"]) {
      if (!Number.isInteger(coverage[key]) || coverage[key] < 0) errors.push(`public source ${source.id}: coverage.${key} 必须为非负整数`);
    }
    if ((coverage.reviewed ?? 0) > (coverage.discovered ?? 0)) errors.push(`public source ${source.id}: reviewed 不得大于 discovered`);
    if ((coverage.published ?? 0) > (coverage.reviewed ?? 0)) errors.push(`public source ${source.id}: published 不得大于 reviewed`);
  }
}

const mappings = await readJson("registry/external-id-mappings.json", { mappings: [] });
if (mappings?.schemaVersion !== 1 || !Array.isArray(mappings?.mappings)) errors.push("registry/external-id-mappings.json: 结构无效");
const mappingKeys = [];
const targetProviderKeys = [];
for (const mapping of mappings?.mappings ?? []) {
  const key = `${mapping.provider}\0${mapping.entityType}\0${mapping.externalId}`;
  mappingKeys.push(key);
  targetProviderKeys.push(`${mapping.communityId}\0${mapping.provider}`);
  if (!["approved", "disabled"].includes(mapping.status)) errors.push(`mapping ${key}: status 无效`);
  if (!isUrl(mapping.sourceUrl)) errors.push(`mapping ${key}: sourceUrl 无效`);
  if (!isDate(mapping.reviewedAt)) errors.push(`mapping ${key}: reviewedAt 无效`);
  const target = entityById.get(mapping.communityId);
  if (!target) errors.push(`mapping ${key}: communityId 不存在 (${mapping.communityId})`);
  else {
    const expectedType = target.kind ?? "series";
    if (expectedType !== mapping.entityType) errors.push(`mapping ${key}: entityType 与目标实体不一致，应为 ${expectedType}`);
    if (mapping.status === "approved" && target.externalIds?.[mapping.provider] !== mapping.externalId) {
      errors.push(`mapping ${key}: 目标实体 externalIds.${mapping.provider} 未记录同一 externalId`);
    }
  }
}
unique(mappingKeys, "External ID Mapping provider/entityType/externalId");
unique(targetProviderKeys, "External ID Mapping communityId/provider");

const staging = await readJson("staging/organization-candidates.json", { candidates: [] });
if (staging?.schemaVersion !== 1 || !Array.isArray(staging?.candidates)) errors.push("staging/organization-candidates.json: 结构无效");
unique((staging?.candidates ?? []).map((candidate) => candidate.candidateId), "Organization Candidate candidateId");
for (const candidate of staging?.candidates ?? []) {
  if (!["group", "company", "maker", "label"].includes(candidate.kind)) errors.push(`candidate ${candidate.candidateId}: kind 无效`);
  if (!candidate.names?.ja?.trim()) errors.push(`candidate ${candidate.candidateId}: 缺少日文名称`);
  if (!candidate.reasonNotPublished?.trim()) errors.push(`candidate ${candidate.candidateId}: 必须说明未正式发布原因`);
  if (!Array.isArray(candidate.sources) || candidate.sources.length === 0) errors.push(`candidate ${candidate.candidateId}: 至少需要一条来源`);
  for (const source of candidate.sources ?? []) if (!isUrl(source.url)) errors.push(`candidate ${candidate.candidateId}: source URL 无效`);
}

if (warnings.length) {
  console.warn("Organization & Series Foundation 校验提醒：");
  for (const warning of warnings) console.warn(`- ${warning}`);
}
if (errors.length) {
  console.error("Organization & Series Foundation 校验失败：");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Organization & Series Foundation 校验通过：organizations=${organizations.length}, series=${series.length}, mappings=${mappings.mappings.length}, sources=${publicSources.sources.length}。`);
