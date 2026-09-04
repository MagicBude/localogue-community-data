import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

async function copyRepoFixture(dir) {
  const root = process.cwd();
  for (const rel of ["staging/series-candidate-reviews.json","staging/series-index-snapshots","data/series","registry/external-id-mappings.json"]) {
    const src = path.join(root, rel), dst = path.join(dir, rel); await fs.mkdir(path.dirname(dst), {recursive:true}); await fs.cp(src,dst,{recursive:true});
  }
  await fs.mkdir(path.join(dir,"scripts"),{recursive:true});
  await fs.copyFile(path.join(root,"scripts/validate-series-candidate-reviews.mjs"),path.join(dir,"scripts/validate-series-candidate-reviews.mjs"));
}
function run(dir) { return spawnSync(process.execPath,["scripts/validate-series-candidate-reviews.mjs"],{cwd:dir,encoding:"utf8"}); }

test("Series publish Review 必须与 Snapshot、正式实体和 approved Mapping 三方一致", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(),"localogue-series-review-ok-")); await copyRepoFixture(dir); const result=run(dir); assert.equal(result.status,0,result.stderr);
});

test("hold/reject 不允许提前占用 Community ID", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(),"localogue-series-review-hold-")); await copyRepoFixture(dir);
  const p=path.join(dir,"staging/series-candidate-reviews.json"); const value=JSON.parse(await fs.readFile(p,"utf8")); value.reviews[0].decision="hold"; await fs.writeFile(p,JSON.stringify(value,null,2)+"\n");
  const result=run(dir); assert.notEqual(result.status,0); assert.match(result.stderr,/不应分配 communityId/);
});

test("Review 引用的日文名若与 Snapshot 漂移必须失败", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(),"localogue-series-review-drift-")); await copyRepoFixture(dir);
  const p=path.join(dir,"staging/series-candidate-reviews.json"); const value=JSON.parse(await fs.readFile(p,"utf8")); value.reviews[0].nameJa += "X"; await fs.writeFile(p,JSON.stringify(value,null,2)+"\n");
  const result=run(dir); assert.notEqual(result.status,0); assert.match(result.stderr,/名称或来源 URL 与 Snapshot 不一致/);
});
