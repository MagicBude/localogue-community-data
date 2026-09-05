import fs from "node:fs/promises";
import path from "node:path";
import { buildCandidateSet, candidateSetCsv, validateCandidateSet } from "./lib/person-identity-candidates.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
function option(name, fallback = null) {
  const eq = args.find((arg) => arg.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
}
const input = option("--input", args.find((arg) => !arg.startsWith("--")) ?? null);
if (!input) {
  console.error('缺少 --input。示例：node scripts/import-metatube-actor-candidates.mjs --input "D:/Downloads/substitution.Actor.txt"');
  process.exit(2);
}
const output = option("--output", ".local/staging/person-identity-candidates.json");
const csvOutput = option("--csv-output", ".local/staging/person-identity-candidates.csv");
const peopleDir = option("--people-dir", "data/people");

async function readPeople(relativeDir) {
  const dir = path.resolve(root, relativeDir);
  let names = [];
  try { names = (await fs.readdir(dir)).filter((name) => name.endsWith(".json")).sort(); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  const people = [];
  for (const name of names) people.push(JSON.parse(await fs.readFile(path.join(dir, name), "utf8")));
  return people;
}

const inputPath = path.resolve(root, input);
const text = await fs.readFile(inputPath, "utf8");
const people = await readPeople(peopleDir);
const candidateSet = buildCandidateSet({ text, people, inputFileName: path.basename(inputPath) });
const errors = validateCandidateSet(candidateSet);
if (errors.length) {
  console.error("Person Identity Candidate 生成结果无效：");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
for (const [relative, content] of [
  [output, `${JSON.stringify(candidateSet, null, 2)}\n`],
  [csvOutput, candidateSetCsv(candidateSet)],
]) {
  const target = path.resolve(root, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content, "utf8");
}

const s = candidateSet.stats;
console.log("MetaTube Actor Person Identity Candidate 生成完成：");
console.log(`- 映射：${s.rawMappings}（唯一 ${s.uniqueMappings}，重复 ${s.duplicateMappings}）`);
console.log(`- 姓名：${s.uniqueNames}；候选 Cluster：${s.clusters}`);
console.log(`- 冲突 source：${s.conflictSources}；自映射：${s.selfMappings}；传递 source：${s.transitiveSources}`);
console.log(`- 命中现有 Person 的 Cluster：${s.matchedClusters}（多 Person 命中 ${s.multiMatchedClusters}）`);
console.log(`- 解析错误：${s.parseErrors}`);
console.log(`- JSON：${output}`);
console.log(`- CSV：${csvOutput}`);
console.log("注意：substitution 右侧只是来源替换目标，不视为 canonical；本命令不会自动发布或合并 Person。");
