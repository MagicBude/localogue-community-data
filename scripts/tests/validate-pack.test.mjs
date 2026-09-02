import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const validatorPath = path.resolve("scripts/validate-pack.mjs");
const personId = "person_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

test("最小 active 实体、来源与 Registry 可以形成有效 Pack", async () => {
  const fixture = await createFixture();
  try {
    const result = runValidator(fixture);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /校验通过/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test("正式实体缺少 active Registry 条目时必须失败", async () => {
  const fixture = await createFixture({ registryEntries: [] });
  try {
    const result = runValidator(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /尚未登记到 registry\/community-ids\.json/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test("Source Record 声明实体中不存在的字段时必须失败", async () => {
  const fixture = await createFixture({ sourceFields: ["names", "imaginaryField"] });
  try {
    const result = runValidator(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /fields 指向实体中不存在的字段/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test("Redirect 不得指向另一个 Redirect", async () => {
  const oldId = "person_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const olderId = "person_cccccccc-cccc-4ccc-8ccc-cccccccccccc";
  const mergeOne = "merge_dddddddd-dddd-4ddd-8ddd-dddddddddddd";
  const mergeTwo = "merge_eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
  const registryEntries = [
    activeEntry(personId),
    redirectEntry(oldId, personId, mergeOne),
    redirectEntry(olderId, oldId, mergeTwo),
  ].sort((left, right) => left.id.localeCompare(right.id));
  const fixture = await createFixture({ registryEntries });

  try {
    await writeSource(fixture, oldId);
    await writeSource(fixture, olderId);
    await writeMergePlan(fixture, mergeOne, oldId, personId);
    await writeMergePlan(fixture, mergeTwo, olderId, oldId);
    const result = runValidator(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /禁止 Redirect 链/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

async function createFixture(options = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "localogue-community-validator-"));
  for (const collection of ["people", "works", "organizations", "series", "genres"]) {
    await mkdir(path.join(root, "library", collection), { recursive: true });
  }
  await mkdir(path.join(root, "sources"), { recursive: true });
  await mkdir(path.join(root, "registry", "merge-plans"), { recursive: true });

  await writeJson(root, "localogue-pack.json", {
    schemaVersion: 1,
    kind: "shared-library",
    id: "example.validator.fixture",
    name: "Validator Fixture",
    version: "0.2.0",
  });
  await writeJson(root, `library/people/${personId}.json`, {
    schemaVersion: 1,
    id: personId,
    names: [{ language: "ja", value: "架空テスト", type: "primary" }],
    activityStatus: "unknown",
    careerEvents: [],
    galleryAssetIds: [],
  });
  await writeJson(root, `sources/${personId}.json`, {
    schemaVersion: 1,
    entityId: personId,
    entityType: "person",
    sources: [{
      url: "https://example.com/fictional/validator-person",
      kind: "other",
      accessedAt: "2026-09-02",
      fields: options.sourceFields ?? ["names"],
    }],
  });
  await writeJson(root, "registry/community-ids.json", {
    schemaVersion: 1,
    entries: options.registryEntries ?? [activeEntry(personId)],
  });
  return root;
}

function activeEntry(id) {
  return {
    id,
    entityType: "person",
    collection: "people",
    status: "active",
    firstPublishedIn: "0.2.0",
  };
}

function redirectEntry(id, canonicalId, mergePlanId) {
  return {
    id,
    entityType: "person",
    collection: "people",
    status: "redirect",
    firstPublishedIn: "0.1.0",
    canonicalId,
    mergePlanId,
    retiredIn: "0.2.0",
  };
}

async function writeSource(root, id) {
  await writeJson(root, `sources/${id}.json`, {
    schemaVersion: 1,
    entityId: id,
    entityType: "person",
    sources: [{
      url: `https://example.com/fictional/${id}`,
      kind: "other",
      accessedAt: "2026-09-02",
      fields: ["names"],
    }],
  });
}

async function writeMergePlan(root, id, sourceId, targetId) {
  await writeJson(root, `registry/merge-plans/${id}.json`, {
    schemaVersion: 1,
    id,
    entityType: "person",
    sourceId,
    targetId,
    status: "applied",
    rationale: "完全虚构的 Validator 测试合并。",
    evidence: [{ url: "https://example.com/fictional/merge", note: "测试证据。" }],
    affectedEntityIds: [],
    createdAt: "2026-09-01",
    reviewedAt: "2026-09-02",
    decisionNote: "测试审核通过。",
    appliedAt: "2026-09-02",
  });
}

async function writeJson(root, relativePath, value) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function runValidator(root) {
  return spawnSync(process.execPath, [validatorPath], {
    cwd: root,
    encoding: "utf8",
  });
}
