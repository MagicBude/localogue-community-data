import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const collections = ["people", "works", "organizations", "series", "genres"];

async function jsonFiles(dir) {
  try { return (await fs.readdir(dir)).filter((name) => name.endsWith(".json")).sort(); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}
async function readEntities(collection) {
  const dir = path.join(root, "data", collection);
  const result = [];
  for (const file of await jsonFiles(dir)) result.push(JSON.parse(await fs.readFile(path.join(dir, file), "utf8")));
  return result.sort((a, b) => a.id.localeCompare(b.id));
}
function csvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
function csv(rows) { return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`; }
function name(person, language, type) { return person.names.find((n) => n.language === language && (!type || n.type === type))?.value ?? ""; }
function career(person, type) { return person.careerEvents?.find((event) => event.type === type)?.date?.value ?? ""; }

const data = Object.fromEntries(await Promise.all(collections.map(async (c) => [c, await readEntities(c)])));
const output = new Map();
for (const collection of collections) for (const entity of data[collection]) output.set(`library/${collection}/${entity.id}.json`, `${JSON.stringify(entity, null, 2)}\n`);
for (const file of await jsonFiles(path.join(root, "data", "sources"))) output.set(`sources/${file}`, await fs.readFile(path.join(root, "data", "sources", file), "utf8"));
const typeFor = (collection, entity) => collection === "organizations" ? entity.kind : collection === "people" ? "person" : collection.slice(0, -1);
const entries = collections.flatMap((collection) => data[collection].map((entity) => ({id:entity.id,entityType:typeFor(collection,entity),collection,status:"active",firstPublishedIn:"0.3.0"}))).sort((a,b)=>a.id.localeCompare(b.id));
output.set("registry/community-ids.json", `${JSON.stringify({schemaVersion:1,entries}, null, 2)}\n`);

const peopleHeader=["id","name_ja","name_zh","name_en","occupation","status","aliases","debut_date","retirement_date","comeback_date","birth_date","height_cm","cup","bust_cm","waist_cm","hip_cm","birthplace_ja","blood_type","agency","biography_zh"];
const peopleRows=data.people.map(p=>[p.id,name(p,"ja","primary"),name(p,"zh-CN"),name(p,"en"),(p.occupations??[]).join(";"),p.activityStatus,(p.names??[]).filter(n=>n.type==="alias").map(n=>n.value).join(";"),career(p,"debut"),career(p,"retirement"),career(p,"comeback"),p.birthDate?.value,p.heightCm,p.measurements?.cup,p.measurements?.bustCm,p.measurements?.waistCm,p.measurements?.hipCm,p.birthPlace?.ja,p.bloodType,p.agency?.name,p.biographies?.["zh-CN"]]);
output.set("exports/csv/actress-overview.csv", csv([peopleHeader,...peopleRows]));
output.set("exports/csv/people.csv", csv([peopleHeader,...peopleRows]));
const workHeader=["id","code","title_ja","release_date","duration_minutes","performers","maker_id"];
const peopleById=new Map(data.people.map(p=>[p.id,name(p,"ja","primary")]));
const workRows=data.works.map(w=>[w.id,w.code,w.titles?.ja,w.releaseDate?.value,w.durationMinutes,(w.personRelations??[]).map(r=>peopleById.get(r.personId)??r.personId).join(";"),w.makerId]);
output.set("exports/csv/work-overview.csv",csv([workHeader,...workRows]));

let stale=[];
if (!checkOnly) {
  for (const collection of collections) {
    const dir = path.join(root, "library", collection);
    await fs.mkdir(dir, { recursive: true });
    for (const file of await jsonFiles(dir)) await fs.unlink(path.join(dir, file));
  }
  await fs.mkdir(path.join(root, "sources"), { recursive: true });
  for (const file of await jsonFiles(path.join(root, "sources"))) await fs.unlink(path.join(root, "sources", file));
}
for(const [relative,content] of output){const target=path.join(root,relative); if(checkOnly){let actual="";try{actual=await fs.readFile(target,"utf8")}catch{} if(actual!==content)stale.push(relative);}else{await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,content,"utf8");}}
if(checkOnly&&stale.length){console.error(`生成物不是最新状态：\n- ${stale.join("\n- ")}\n请运行 pnpm data:build`);process.exit(1)}
if(!checkOnly) console.log(`已从 data/ 生成 ${output.size} 个 JSON/CSV 文件。`);
