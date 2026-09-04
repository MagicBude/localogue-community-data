import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { parseSeriesIndexHtml, latestSnapshotsByProvider } from "../lib/series-index.mjs";

const diffScript = path.resolve(import.meta.dirname, "../diff-series-index-snapshots.mjs");

async function writeJson(root, relative, value) {
  const target = path.join(root, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

test("Series Index HTML parser 只提取 detailPathPattern，并按 externalId 去重", () => {
  const html = `
    <a href="/works/list/series/100">第一シリーズ</a>
    <a href="/works/list/series/100">第一シリーズ</a>
    <a href="https://example.test/works/list/series/101"><span>第二シリーズ</span></a>
    <a href="/works/list/label/999">不是 Series</a>`;
  const entries = parseSeriesIndexHtml(html, {
    indexUrl: "https://example.test/works/series",
    detailUrlTemplate: "https://example.test/works/list/series/<id>",
    detailPathPattern: "^/works/list/series/(\\d+)$",
  });
  assert.deepEqual(entries, [
    { position: 1, externalId: "100", nameJa: "第一シリーズ", sourceUrl: "https://example.test/works/list/series/100" },
    { position: 2, externalId: "101", nameJa: "第二シリーズ", sourceUrl: "https://example.test/works/list/series/101" },
  ]);
});

test("latestSnapshotsByProvider 只选择每个 Provider 最新快照", () => {
  const result = latestSnapshotsByProvider([
    { provider: "a.series", capturedAt: "2026-09-03", snapshotId: "a-old" },
    { provider: "a.series", capturedAt: "2026-09-04", snapshotId: "a-new" },
    { provider: "b.series", capturedAt: "2026-09-04", snapshotId: "b-new" },
  ]);
  assert.equal(result.get("a.series").snapshotId, "a-new");
  assert.equal(result.get("b.series").snapshotId, "b-new");
});

test("Snapshot Diff 不自动发布未映射 Series；完整快照缺失正式 ID 只产生审核警告", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "localogue-series-snapshot-"));
  await writeJson(root, "registry/series-index-providers.json", { schemaVersion: 1, providers: [{ key: "demo", sourceId: "source_demo", provider: "demo.series", makerId: "maker_000001", indexUrl: "https://example.test/works/series", detailUrlTemplate: "https://example.test/works/list/series/<id>", detailPathPattern: "^/works/list/series/(\\d+)$", indexIsSinglePage: true }] });
  await writeJson(root, "registry/external-id-mappings.json", { schemaVersion: 1, mappings: [
    { provider: "demo.series", entityType: "series", externalId: "1", communityId: "series_000001", status: "approved", sourceUrl: "https://example.test/works/list/series/1", reviewedAt: "2026-09-04" },
    { provider: "demo.series", entityType: "series", externalId: "3", communityId: "series_000003", status: "approved", sourceUrl: "https://example.test/works/list/series/3", reviewedAt: "2026-09-04" },
  ] });
  await writeJson(root, "data/series/series_000001--one.json", { id: "series_000001", makerId: "maker_000001", names: { ja: "既存シリーズ" } });
  await writeJson(root, "data/series/series_000003--three.json", { id: "series_000003", makerId: "maker_000001", names: { ja: "消えたかもしれないシリーズ" } });
  await writeJson(root, "staging/series-index-snapshots/demo-series-2026-09-04-complete.json", {
    schemaVersion: 1, snapshotId: "demo-series-2026-09-04-complete", providerKey: "demo", provider: "demo.series", sourceId: "source_demo", makerId: "maker_000001", indexUrl: "https://example.test/works/series", capturedAt: "2026-09-04", captureMethod: "html-fixture", completeTraversal: true,
    entries: [
      { position: 1, externalId: "1", nameJa: "既存シリーズ", sourceUrl: "https://example.test/works/list/series/1" },
      { position: 2, externalId: "2", nameJa: "新規候補", sourceUrl: "https://example.test/works/list/series/2" },
    ],
  });
  const beforeMappings = await fs.readFile(path.join(root, "registry/external-id-mappings.json"), "utf8");
  const run = spawnSync(process.execPath, [diffScript], { cwd: root, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const report = JSON.parse(await fs.readFile(path.join(root, "exports/reports/series-index-diff.json"), "utf8"));
  assert.equal(report.counts.published, 1);
  assert.equal(report.counts["candidate-new"], 1);
  assert.equal(report.counts["missing-from-complete-index"], 1);
  assert.equal(await fs.readFile(path.join(root, "registry/external-id-mappings.json"), "utf8"), beforeMappings);
  await assert.doesNotReject(fs.access(path.join(root, "data/series/series_000003--three.json")));
});
