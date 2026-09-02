import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

/**
 * Pack Validator 关注正式数据关系；这个脚本补充检查仓库里的 Schema、示例和配置 JSON。
 * 这样文档用 Fixture 即使暂时没有进入正式 library/，也不会因为手工编辑留下语法错误。
 */
const root = process.cwd();
const ignoredDirectories = new Set([".git", "node_modules"]);
const files = await collectJsonFiles(root);
const errors = [];

for (const filePath of files) {
  try {
    JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(root, filePath)}: ${error.message}`);
  }
}

if (errors.length) {
  console.error("\n仓库 JSON 语法校验失败：\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`仓库 JSON 语法校验通过（${files.length} 个文件）。\n`);
}

async function collectJsonFiles(directory) {
  const results = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...await collectJsonFiles(entryPath));
    else if (entry.isFile() && entry.name.endsWith(".json")) results.push(entryPath);
  }
  return results.sort();
}
