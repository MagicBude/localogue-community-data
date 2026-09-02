import { spawnSync } from "node:child_process";
import path from "node:path";

/**
 * examples/ 是一套完全虚构但引用完整的 Pack Fixture。
 * 使用正式 Validator 再跑一次，可以防止文档示例与真实协议逐渐分叉。
 */
const repoRoot = process.cwd();
const validatorPath = path.join(repoRoot, "scripts", "validate-pack.mjs");
const examplesRoot = path.join(repoRoot, "examples");
const result = spawnSync(process.execPath, [validatorPath], {
  cwd: examplesRoot,
  encoding: "utf8",
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
if (result.status !== 0) process.exitCode = result.status ?? 1;
else console.log("完全虚构 examples/ Fixture 校验通过。\n");
