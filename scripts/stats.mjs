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
  const registry = JSON.parse(
    await readFile(path.resolve(process.cwd(), "registry/community-ids.json"), "utf8"),
  );
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
console.table(stats);
