import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

/**
 * 使用方式：
 *
 *   pnpm check:localogue -- ../Localogue
 *
 * 这个脚本只读取 Localogue checkout，并在系统临时目录创建一次性 settings。
 * 它不修改主程序仓库，目的有两个：
 * 1. 确认双方保存的 Shared Pack Manifest JSON Schema 没有漂移；
 * 2. 让 Localogue 自己的 validate-library.mjs 把本仓库作为 Shared Pack 读取一次。
 */

const communityRoot = process.cwd();
const configuredLocalogueRoot = process.argv.slice(2).find((value) => value !== "--");

if (!configuredLocalogueRoot) {
  console.error("用法: pnpm check:localogue -- <Localogue 仓库路径>");
  process.exit(1);
}

const localogueRoot = path.resolve(communityRoot, configuredLocalogueRoot);
const localSchemaPath = path.join(communityRoot, "schemas/shared-pack-manifest.schema.json");
const upstreamSchemaPath = path.join(localogueRoot, "schemas/shared-pack-manifest.schema.json");
const upstreamValidatorPath = path.join(localogueRoot, "scripts/validate-library.mjs");

const [localSchema, upstreamSchema] = await Promise.all([
  readJson(localSchemaPath),
  readJson(upstreamSchemaPath),
]);

if (stableJson(localSchema) !== stableJson(upstreamSchema)) {
  console.error("Shared Pack Manifest Schema 与指定 Localogue checkout 不一致。");
  console.error(`Community: ${localSchemaPath}`);
  console.error(`Localogue: ${upstreamSchemaPath}`);
  process.exit(1);
}

const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "localogue-community-contract-"));
const settingsPath = path.join(temporaryRoot, "settings.json");

try {
  await writeFile(
    settingsPath,
    `${JSON.stringify({ schemaVersion: 1, libraryPath: "", sharedPackPaths: [communityRoot] }, null, 2)}\n`,
    "utf8",
  );

  const result = spawnSync(process.execPath, [upstreamValidatorPath], {
    cwd: localogueRoot,
    env: { ...process.env, LOCALOGUE_SETTINGS_PATH: settingsPath },
    encoding: "utf8",
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  else console.log("Community Pack 已通过指定 Localogue checkout 的读取与资料校验。\n");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    console.error(`无法读取 JSON: ${filePath} (${error.message})`);
    process.exit(1);
  }
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
