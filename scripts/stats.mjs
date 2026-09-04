import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd(), "library");
const collections = ["people", "works", "organizations", "series", "genres"];
const stats = {};
for (const collection of collections) {
  try {
    const names = await readdir(path.join(root, collection));
    stats[collection] = names.filter((name) => name.endsWith(".json")).length;
  } catch (error) {
    stats[collection] = error?.code === "ENOENT" ? 0 : "ERROR";
  }
}
try {
  const names = (await readdir(path.join(root, "organizations"))).filter((name) => name.endsWith(".json"));
  const kindCounts = { group: 0, company: 0, maker: 0, label: 0, other: 0 };
  for (const name of names) {
    const value = JSON.parse(await readFile(path.join(root, "organizations", name), "utf8"));
    if (Object.hasOwn(kindCounts, value.kind)) kindCounts[value.kind] += 1;
    else kindCounts.other += 1;
  }
  stats.organizationGroups = kindCounts.group;
  stats.organizationCompanies = kindCounts.company;
  stats.organizationMakers = kindCounts.maker;
  stats.organizationLabels = kindCounts.label;
} catch {
  stats.organizationGroups = "ERROR";
  stats.organizationCompanies = "ERROR";
  stats.organizationMakers = "ERROR";
  stats.organizationLabels = "ERROR";
}
try {
  const registry = JSON.parse(await readFile(path.resolve(process.cwd(), "registry/community-ids.json"), "utf8"));
  const entries = Array.isArray(registry.entries) ? registry.entries : [];
  stats.registryActive = entries.filter((entry) => entry.status === "active").length;
  stats.registryRedirects = entries.filter((entry) => entry.status === "redirect").length;
} catch {
  stats.registryActive = "ERROR";
  stats.registryRedirects = "ERROR";
}
try {
  const names = await readdir(path.resolve(process.cwd(), "registry/merge-plans"));
  stats.mergePlans = names.filter((name) => name.endsWith(".json")).length;
} catch (error) {
  stats.mergePlans = error?.code === "ENOENT" ? 0 : "ERROR";
}
try {
  const sourceRegistry = JSON.parse(await readFile(path.resolve(process.cwd(), "registry/public-sources.json"), "utf8"));
  stats.publicSources = Array.isArray(sourceRegistry.sources) ? sourceRegistry.sources.length : "ERROR";
} catch { stats.publicSources = "ERROR"; }
try {
  const mappings = JSON.parse(await readFile(path.resolve(process.cwd(), "registry/external-id-mappings.json"), "utf8"));
  stats.externalIdMappings = Array.isArray(mappings.mappings) ? mappings.mappings.length : "ERROR";
} catch { stats.externalIdMappings = "ERROR"; }
try {
  const candidates = JSON.parse(await readFile(path.resolve(process.cwd(), "staging/organization-candidates.json"), "utf8"));
  stats.organizationCandidates = Array.isArray(candidates.candidates) ? candidates.candidates.length : "ERROR";
} catch { stats.organizationCandidates = "ERROR"; }

try {
  const providerRegistry = JSON.parse(await readFile(path.resolve(process.cwd(), "registry/series-index-providers.json"), "utf8"));
  stats.seriesIndexProviders = Array.isArray(providerRegistry.providers) ? providerRegistry.providers.length : "ERROR";
} catch { stats.seriesIndexProviders = "ERROR"; }
try {
  const dir = path.resolve(process.cwd(), "staging/series-index-snapshots");
  const names = (await readdir(dir)).filter((name) => name.endsWith(".json"));
  stats.seriesIndexSnapshots = names.length;
  let entries = 0;
  for (const name of names) {
    const snapshot = JSON.parse(await readFile(path.join(dir, name), "utf8"));
    entries += Array.isArray(snapshot.entries) ? snapshot.entries.length : 0;
  }
  stats.seriesIndexSnapshotEntries = entries;
} catch (error) {
  stats.seriesIndexSnapshots = error?.code === "ENOENT" ? 0 : "ERROR";
  stats.seriesIndexSnapshotEntries = error?.code === "ENOENT" ? 0 : "ERROR";
}
try {
  const report = JSON.parse(await readFile(path.resolve(process.cwd(), "exports/reports/series-index-diff.json"), "utf8"));
  const counts = report.counts ?? {};
  stats.seriesIndexCandidates = (counts["candidate-new"] ?? 0) + (counts["candidate-existing-name"] ?? 0) + (counts["published-name-drift"] ?? 0);
  stats.seriesIndexMissingFromComplete = counts["missing-from-complete-index"] ?? 0;
} catch {
  stats.seriesIndexCandidates = "ERROR";
  stats.seriesIndexMissingFromComplete = "ERROR";
}
console.table(stats);
