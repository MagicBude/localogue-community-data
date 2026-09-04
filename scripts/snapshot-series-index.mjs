import fs from "node:fs/promises";
import path from "node:path";
import { parseSeriesIndexHtml } from "./lib/series-index.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
const providerKey = args[0] && !args[0].startsWith("--") ? args[0] : undefined;
const getArg = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const complete = args.includes("--complete");
const inputHtml = getArg("--input-html");
const outputArg = getArg("--output");
const capturedAt = getArg("--captured-at") ?? new Date().toISOString().slice(0, 10);

if (!providerKey) {
  console.error("用法: pnpm series:index:snapshot -- <provider-key> [--input-html path] [--output path] [--captured-at YYYY-MM-DD] [--complete]；同一日期/模式重复运行会自动分配 -001/-002/...，不会覆盖历史快照");
  process.exit(1);
}

const registry = JSON.parse(await fs.readFile(path.join(root, "registry/series-index-providers.json"), "utf8"));
const config = registry.providers?.find((item) => item.key === providerKey);
if (!config) {
  console.error(`未知 Series Index Provider: ${providerKey}`);
  process.exit(1);
}
if (complete && config.indexIsSinglePage !== true) {
  console.error(`${providerKey}: provider 未声明 indexIsSinglePage=true，不能使用 --complete`);
  process.exit(1);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(capturedAt)) {
  console.error("--captured-at 必须为 YYYY-MM-DD");
  process.exit(1);
}

let html;
let captureMethod;
if (inputHtml) {
  html = await fs.readFile(path.resolve(root, inputHtml), "utf8");
  captureMethod = "html-fixture";
} else {
  const response = await fetch(config.indexUrl, {
    headers: {
      "user-agent": "LocalogueCommunityData/series-index-snapshot (+https://github.com/MagicBude/localogue-community-data)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`${config.indexUrl}: HTTP ${response.status}`);
  html = await response.text();
  captureMethod = "live-fetch";
}

const entries = parseSeriesIndexHtml(html, config);
if (entries.length === 0) {
  console.error(`${providerKey}: 没有从官方 Series Index 解析到任何 /works/list/series/<id> 链接；拒绝写入空快照。`);
  process.exit(1);
}

const snapshotDir = path.join(root, "staging", "series-index-snapshots");
await fs.mkdir(snapshotDir, { recursive: true });
const mode = complete ? "complete" : "partial";
const prefix = `${providerKey}-series-${capturedAt}-${mode}-`;
let existingNames = [];
try { existingNames = await fs.readdir(snapshotDir); } catch {}
const used = existingNames
  .map((name) => name.match(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}(\\d{3})\\.json$`)))
  .filter(Boolean)
  .map((match) => Number.parseInt(match[1], 10));
const sequence = String((used.length ? Math.max(...used) : 0) + 1).padStart(3, "0");
const snapshotId = `${prefix}${sequence}`;
const output = outputArg ? path.resolve(root, outputArg) : path.join(snapshotDir, `${snapshotId}.json`);
const snapshot = {
  schemaVersion: 1,
  snapshotId,
  providerKey,
  provider: config.provider,
  sourceId: config.sourceId,
  makerId: config.makerId,
  indexUrl: config.indexUrl,
  capturedAt,
  captureMethod,
  completeTraversal: complete,
  notes: complete
    ? ["--complete 仅表示操作者确认该 provider 的当前官方 Series Index 已完整遍历；不会自动发布或删除正式 Series。"]
    : ["partial snapshot 只用于候选发现与差异审计，不得据此声明 Series Index 完整覆盖。"],
  entries,
};
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Series Index Snapshot 已写入 ${path.relative(root, output)}：provider=${config.provider}, entries=${entries.length}, complete=${complete}`);
