import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const aliases = new Map([
  ["person", "person"],
  ["work", "work"],
  ["group", "group"],
  ["company", "company"],
  ["maker", "maker"],
  ["label", "label"],
  ["series", "series"],
  ["genre", "genre"],
  ["merge", "merge"],
]);
const requested = process.argv[2]?.trim().toLowerCase();
if (!requested || !aliases.has(requested)) {
  console.error("用法: pnpm new <person|work|group|company|maker|label|series|genre|merge>");
  console.error("注意：group/company 目前主要用于模型与候选治理；正式发布前仍需确认 Localogue 消费契约已支持对应 kind。");
  process.exit(1);
}
const prefix = aliases.get(requested);
if (prefix === "merge") {
  console.log(`merge_${randomUUID()}`);
} else {
  const collection = prefix === "person"
    ? "people"
    : prefix === "work"
      ? "works"
      : ["group", "company", "maker", "label"].includes(prefix)
        ? "organizations"
        : `${prefix}s`;
  const dir = path.join(process.cwd(), "data", collection);
  let maximum = 0;
  try {
    for (const file of await readdir(dir)) {
      if (!file.endsWith(".json")) continue;
      const value = JSON.parse(await readFile(path.join(dir, file), "utf8"));
      const match = new RegExp(`^${prefix}_(\\d{6})$`).exec(value.id ?? "");
      if (match) maximum = Math.max(maximum, Number(match[1]));
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  console.log(`${prefix}_${String(maximum + 1).padStart(6, "0")}`);
}
