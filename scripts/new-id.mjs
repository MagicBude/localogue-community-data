import { randomUUID } from "node:crypto";

const aliases = new Map([
  ["person", "person"],
  ["work", "work"],
  ["maker", "maker"],
  ["label", "label"],
  ["series", "series"],
  ["genre", "genre"],
  ["merge", "merge"],
]);

const requested = process.argv[2]?.trim().toLowerCase();
if (!requested || !aliases.has(requested)) {
  console.error("用法: pnpm new <person|work|maker|label|series|genre|merge>");
  console.error("Organization 请按实际 kind 选择 maker 或 label，避免生成无法判定语义的 ID。");
  process.exit(1);
}

console.log(`${aliases.get(requested)}_${randomUUID()}`);
