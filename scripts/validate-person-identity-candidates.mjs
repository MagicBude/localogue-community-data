import fs from "node:fs/promises";
import path from "node:path";
import { validateCandidateSet } from "./lib/person-identity-candidates.mjs";

const relative = process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? ".local/staging/person-identity-candidates.json";
const target = path.resolve(process.cwd(), relative);
let value;
try { value = JSON.parse(await fs.readFile(target, "utf8")); }
catch (error) {
  console.error(`${relative}: 无法读取或解析 (${error.message})`);
  process.exit(1);
}
const errors = validateCandidateSet(value);
if (errors.length) {
  console.error("Person Identity Candidate Set 校验失败：");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Person Identity Candidate Set 校验通过：${value.clusters.length} 个 cluster，${value.stats.conflictSources} 个冲突 source。`);
