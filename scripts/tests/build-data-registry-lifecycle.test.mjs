import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const buildScript = path.resolve(here, "..", "build-data.mjs");

async function makeRoot(entries) {
  const root = await mkdtemp(path.join(tmpdir(), "localogue-registry-lifecycle-"));
  for (const relative of [
    "data/people", "data/works", "data/organizations", "data/series", "data/genres", "data/sources",
    "registry", "library", "sources", "exports/csv", "staging",
  ]) await mkdir(path.join(root, relative), { recursive: true });

  await writeFile(path.join(root, "localogue-pack.json"), JSON.stringify({ version: "0.4.0" }));
  await writeFile(path.join(root, "data/organizations/maker.json"), JSON.stringify({
    schemaVersion: 1,
    id: "maker_000001",
    kind: "maker",
    names: { ja: "Maker" },
  }));
  await writeFile(path.join(root, "registry/community-ids.json"), JSON.stringify({ schemaVersion: 1, entries }));
  await writeFile(path.join(root, "registry/public-sources.json"), JSON.stringify({ schemaVersion: 1, sources: [] }));
  await writeFile(path.join(root, "registry/external-id-mappings.json"), JSON.stringify({ schemaVersion: 1, mappings: [] }));
  await writeFile(path.join(root, "staging/organization-candidates.json"), JSON.stringify({ schemaVersion: 1, candidates: [] }));
  return root;
}

function run(cwd) {
  return spawnSync(process.execPath, [buildScript], { cwd, encoding: "utf8" });
}

test("data:build 保留历史 Redirect，而不是只按当前 data 机械重建 Registry", async () => {
  const root = await makeRoot([
    { id: "label_000001", entityType: "label", collection: "organizations", status: "redirect", redirectTo: "label_000002", firstPublishedIn: "0.3.0" },
    { id: "maker_000001", entityType: "maker", collection: "organizations", status: "active", firstPublishedIn: "0.3.0" },
  ]);
  try {
    await writeFile(path.join(root, "data/organizations/label.json"), JSON.stringify({
      schemaVersion: 1, id: "label_000002", kind: "label", names: { ja: "Current Label" }, parentOrganizationId: "maker_000001"
    }));
    const registry = JSON.parse(await readFile(path.join(root, "registry/community-ids.json"), "utf8"));
    registry.entries.push({ id: "label_000002", entityType: "label", collection: "organizations", status: "active", firstPublishedIn: "0.3.0" });
    await writeFile(path.join(root, "registry/community-ids.json"), JSON.stringify(registry));
    const result = run(root);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const rebuiltRegistry = JSON.parse(await readFile(path.join(root, "registry/community-ids.json"), "utf8"));
    const redirect = rebuiltRegistry.entries.find((entry) => entry.id === "label_000001");
    assert.equal(redirect?.status, "redirect");
    assert.equal(redirect?.redirectTo, "label_000002");
    assert.equal(redirect?.firstPublishedIn, "0.3.0");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("已发布 active ID 从 data 消失且未建立 Redirect 时，data:build 必须失败", async () => {
  const root = await makeRoot([
    { id: "maker_000001", entityType: "maker", collection: "organizations", status: "active", firstPublishedIn: "0.3.0" },
    { id: "series_000001", entityType: "series", collection: "series", status: "active", firstPublishedIn: "0.3.0" },
  ]);
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /不允许静默删除/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("data:build 为 Series 写入 entityType=series，而不是错误单数化为 serie", async () => {
  const root = await makeRoot([
    { id: "maker_000001", entityType: "maker", collection: "organizations", status: "active", firstPublishedIn: "0.3.0" },
  ]);
  try {
    await writeFile(path.join(root, "data/series/series.json"), JSON.stringify({
      schemaVersion: 1, id: "series_000001", names: { ja: "Series" }, makerId: "maker_000001", status: "unknown"
    }));
    const result = run(root);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const registry = JSON.parse(await readFile(path.join(root, "registry/community-ids.json"), "utf8"));
    const entry = registry.entries.find((item) => item.id === "series_000001");
    assert.equal(entry?.entityType, "series");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
