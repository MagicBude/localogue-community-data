import { readdir } from "node:fs/promises";
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
console.table(stats);
