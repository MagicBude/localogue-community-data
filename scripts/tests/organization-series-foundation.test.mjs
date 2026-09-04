import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const validateScript = path.resolve(here, "..", "validate-foundation-registry.mjs");
const reconcileScript = path.resolve(here, "..", "reconcile-provider-entities.mjs");

async function fixture({ badLabelParent = false, duplicateMapping = false, crossProviderSameExternalId = false } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "localogue-foundation-"));
  for (const relative of ["data/organizations", "data/series", "registry", "staging", "exports/reports", "exports/csv"]) {
    await mkdir(path.join(root, relative), { recursive: true });
  }
  const maker = { schemaVersion: 1, id: "maker_000001", kind: "maker", names: { ja: "Maker" } };
  const company = { schemaVersion: 1, id: "company_000001", kind: "company", names: { ja: "Company" } };
  const label = {
    schemaVersion: 1, id: "label_000001", kind: "label", names: { ja: "Label" },
    parentOrganizationId: badLabelParent ? "company_000001" : "maker_000001", status: "active",
    externalIds: { "demo.label": "10" },
  };
  const series = {
    schemaVersion: 1, id: "series_000001", names: { ja: "Series" }, makerId: "maker_000001", status: "active",
    externalIds: { "demo.series": "20" },
  };
  await writeFile(path.join(root, "data/organizations/maker.json"), JSON.stringify(maker));
  await writeFile(path.join(root, "data/organizations/company.json"), JSON.stringify(company));
  await writeFile(path.join(root, "data/organizations/label.json"), JSON.stringify(label));
  await writeFile(path.join(root, "data/series/series.json"), JSON.stringify(series));
  await writeFile(path.join(root, "registry/public-sources.json"), JSON.stringify({ schemaVersion: 1, sources: [{
    id: "source_demo", name: "Demo", sourceType: "official", baseUrl: "https://example.com/", entityTypes: ["label", "series"],
    accessStatus: "reachable", lastCheckedAt: "2026-09-04", completeTraversal: false,
    coverage: [{ entityType: "label", discovered: 1, reviewed: 1, published: 1, conflicts: 0, unrecognized: 0, completeTraversal: false }], knownLimitations: [],
  }] }));
  const mappings = [
    { provider: "demo.label", entityType: "label", externalId: "10", communityId: "label_000001", status: "approved", sourceUrl: "https://example.com/label/10", reviewedAt: "2026-09-04" },
    { provider: "demo.series", entityType: "series", externalId: "20", communityId: "series_000001", status: "approved", sourceUrl: "https://example.com/series/20", reviewedAt: "2026-09-04" },
  ];
  if (duplicateMapping) mappings.push({ ...mappings[0] });
  if (crossProviderSameExternalId) {
    const secondLabel = {
      schemaVersion: 1, id: "label_000002", kind: "label", names: { ja: "Label" },
      parentOrganizationId: "maker_000001", status: "active", externalIds: { "demo2.label": "10" },
    };
    await writeFile(path.join(root, "data/organizations/label2.json"), JSON.stringify(secondLabel));
    mappings.push({ provider: "demo2.label", entityType: "label", externalId: "10", communityId: "label_000002", status: "approved", sourceUrl: "https://example.org/label/10", reviewedAt: "2026-09-04" });
  }
  await writeFile(path.join(root, "registry/external-id-mappings.json"), JSON.stringify({ schemaVersion: 1, mappings }));
  await writeFile(path.join(root, "staging/organization-candidates.json"), JSON.stringify({ schemaVersion: 1, candidates: [] }));
  await writeFile(path.join(root, "staging/provider-observations.json"), JSON.stringify({ schemaVersion: 1, observations: [
    { sourceId: "source_demo", provider: "demo.series", entityType: "series", externalId: "20", nameJa: "Series", sourceUrl: "https://example.com/series/20" },
  ] }));
  return root;
}

function run(script, cwd, args = []) {
  return spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
}

test("Organization/Series 正常层级与 reviewed mapping 可通过", async () => {
  const root = await fixture();
  try {
    const result = run(validateScript, root);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("Label 不能直接挂到 Company", async () => {
  const root = await fixture({ badLabelParent: true });
  try {
    const result = run(validateScript, root);
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /label 不能挂到 company/i);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("同一个 Provider 外部 ID 不允许重复映射", async () => {
  const root = await fixture({ duplicateMapping: true });
  try {
    const result = run(validateScript, root);
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /重复值/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("Provider 稳定外部 ID 精确映射进入 auto-applied", async () => {
  const root = await fixture();
  try {
    const generate = run(reconcileScript, root);
    assert.equal(generate.status, 0, `${generate.stdout}\n${generate.stderr}`);
    assert.match(generate.stdout, /auto-applied=1/);
    const check = run(reconcileScript, root, ["--check"]);
    assert.equal(check.status, 0, `${check.stdout}\n${check.stderr}`);
  } finally { await rm(root, { recursive: true, force: true }); }
});


test("不同 Provider 可以复用相同数值外部 ID，不能按裸 ID 错误冲突", async () => {
  const root = await fixture({ crossProviderSameExternalId: true });
  try {
    const result = run(validateScript, root);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  } finally { await rm(root, { recursive: true, force: true }); }
});


test("来源级完整度可以为 false，同时单个 Label coverage 为 complete", async () => {
  const root = await fixture();
  try {
    const sourcePath = path.join(root, "registry/public-sources.json");
    const registry = JSON.parse(await readFile(sourcePath, "utf8"));
    registry.sources[0].coverage[0].completeTraversal = true;
    // series 位于 entityTypes 但没有 complete coverage，所以来源级仍应是 false。
    await writeFile(sourcePath, JSON.stringify(registry));
    const result = run(validateScript, root);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("来源级 completeTraversal 不能在部分实体类型未完整时错误标 true", async () => {
  const root = await fixture();
  try {
    const sourcePath = path.join(root, "registry/public-sources.json");
    const registry = JSON.parse(await readFile(sourcePath, "utf8"));
    registry.sources[0].completeTraversal = true;
    registry.sources[0].coverage[0].completeTraversal = true;
    await writeFile(sourcePath, JSON.stringify(registry));
    const result = run(validateScript, root);
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /来源级 completeTraversal/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
