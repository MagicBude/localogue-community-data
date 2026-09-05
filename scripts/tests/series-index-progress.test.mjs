import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const progressScript = path.resolve(import.meta.dirname, "../report-series-index-progress.mjs");
const validatorScript = path.resolve(import.meta.dirname, "../validate-series-index-snapshots.mjs");

async function writeJson(root, relative, value) {
  const target = path.join(root, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function provider(key, makerId = "maker_000001") {
  return {
    key,
    sourceId: `source_${key}`,
    provider: `${key}.series`,
    makerId,
    indexUrl: `https://${key}.example.test/works/series`,
    detailUrlTemplate: `https://${key}.example.test/works/list/series/<id>`,
    detailPathPattern: "^/works/list/series/(\\d+)$",
    indexIsSinglePage: false,
  };
}

function snapshot(config, id, entries, coverageWindow) {
  return {
    schemaVersion: 1,
    snapshotId: id,
    providerKey: config.key,
    provider: config.provider,
    sourceId: config.sourceId,
    makerId: config.makerId,
    indexUrl: config.indexUrl,
    capturedAt: "2026-09-04",
    captureMethod: "web-review",
    completeTraversal: false,
    coverageWindow,
    notes: ["test"],
    entries: entries.map((externalId, index) => ({
      position: index + 1,
      externalId,
      nameJa: `シリーズ${externalId}`,
      sourceUrl: config.detailUrlTemplate.replace("<id>", externalId),
    })),
  };
}

test("Series Index Progress 从 coverageWindow 生成 resume checkpoint，不把 sample 猜成连续进度", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "localogue-series-progress-"));
  const a = provider("alpha");
  const b = provider("beta", "maker_000002");
  await writeJson(root, "registry/series-index-providers.json", { schemaVersion: 1, providers: [a, b] });
  await writeJson(root, "registry/public-sources.json", { schemaVersion: 1, sources: [
    { id: a.sourceId, coverage: [{ entityType: "series", discovered: 2, reviewed: 2, published: 2, conflicts: 0, unrecognized: 0, completeTraversal: false }] },
    { id: b.sourceId, coverage: [{ entityType: "series", discovered: 2, reviewed: 2, published: 0, conflicts: 0, unrecognized: 2, completeTraversal: false }] },
  ] });
  await writeJson(root, "registry/external-id-mappings.json", { schemaVersion: 1, mappings: [
    { provider: a.provider, entityType: "series", externalId: "10", communityId: "series_000001", status: "approved" },
    { provider: a.provider, entityType: "series", externalId: "11", communityId: "series_000002", status: "approved" },
  ] });
  await writeJson(root, "staging/series-candidate-reviews.json", { schemaVersion: 1, reviews: [
    { provider: a.provider, decision: "publish" },
    { provider: b.provider, decision: "hold" },
  ] });
  await writeJson(root, "staging/series-index-snapshots/alpha-series-2026-09-04-partial-001.json", snapshot(a, "alpha-series-2026-09-04-partial-001", ["10", "11"], {
    kind: "segment", orderBasis: "manual-review-order", startExternalId: "10", endExternalId: "11", resumeAfterExternalId: "11", continuesFromSnapshotId: null,
  }));
  await writeJson(root, "staging/series-index-snapshots/beta-series-2026-09-04-partial-001.json", snapshot(b, "beta-series-2026-09-04-partial-001", ["20", "99"], {
    kind: "sample", orderBasis: "sample-order", startExternalId: "20", endExternalId: "99", resumeAfterExternalId: null, continuesFromSnapshotId: null,
  }));

  const run = spawnSync(process.execPath, [progressScript], { cwd: root, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const report = JSON.parse(await fs.readFile(path.join(root, "exports/reports/series-index-progress.json"), "utf8"));
  assert.equal(report.counts.providers, 2);
  assert.equal(report.counts.withResumeCheckpoint, 1);
  assert.equal(report.counts.holdReviews, 1);
  const alpha = report.providers.find((item) => item.providerKey === "alpha");
  const beta = report.providers.find((item) => item.providerKey === "beta");
  assert.equal(alpha.resumeCheckpoint.externalId, "11");
  assert.equal(alpha.resumeCheckpoint.semantics, "resume-after-reviewed-anchor");
  assert.equal(beta.resumeCheckpoint.available, false);
  assert.equal(beta.resumeCheckpoint.externalId, null);
});

test("Snapshot Validator 拒绝不存在的 continuation predecessor 和错误 resume anchor", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "localogue-series-progress-validator-"));
  const a = provider("alpha");
  await writeJson(root, "registry/series-index-providers.json", { schemaVersion: 1, providers: [a] });
  await writeJson(root, "registry/public-sources.json", { schemaVersion: 1, sources: [{
    id: a.sourceId, coverage: [{ entityType: "series", discovered: 1, reviewed: 0, published: 0, conflicts: 0, unrecognized: 1, completeTraversal: false }],
  }] });
  await writeJson(root, "registry/external-id-mappings.json", { schemaVersion: 1, mappings: [] });
  await writeJson(root, "data/organizations/maker_000001--alpha.json", { id: "maker_000001", kind: "maker" });
  await writeJson(root, "staging/series-index-snapshots/alpha-series-2026-09-04-partial-001.json", snapshot(a, "alpha-series-2026-09-04-partial-001", ["10"], {
    kind: "segment", orderBasis: "manual-review-order", startExternalId: "10", endExternalId: "10", resumeAfterExternalId: "999", continuesFromSnapshotId: "missing-snapshot",
  }));
  const run = spawnSync(process.execPath, [validatorScript], { cwd: root, encoding: "utf8" });
  assert.notEqual(run.status, 0);
  assert.match(run.stderr + run.stdout, /resumeAfterExternalId 必须等于 endExternalId/);
  assert.match(run.stderr + run.stdout, /continuesFromSnapshotId 不存在/);
});
