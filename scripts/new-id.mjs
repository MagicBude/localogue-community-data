import { randomUUID } from "node:crypto";

const aliases = new Map([
  ["person", "person"],
  ["work", "work"],
  ["maker", "maker"],
  ["label", "label"],
  ["organization", "organization"],
  ["series", "series"],
  ["genre", "genre"],
]);

const requested = process.argv[2]?.trim().toLowerCase();
if (!requested || !aliases.has(requested)) {
  console.error("用法: pnpm new:id <person|work|maker|label|organization|series|genre>");
  process.exit(1);
}

console.log(`${aliases.get(requested)}_${randomUUID()}`);
