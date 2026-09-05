import test from "node:test";
import assert from "node:assert/strict";
import { buildCandidateSet, parseSubstitutionText, validateCandidateSet } from "../lib/person-identity-candidates.mjs";

test("Person Identity parser 去重并保留冲突 source", () => {
  const value = buildCandidateSet({ text: "あや=宮崎あや\nあや=神谷充希\nあや=宮崎あや\n" });
  assert.equal(value.stats.rawMappings, 3);
  assert.equal(value.stats.uniqueMappings, 2);
  assert.equal(value.stats.duplicateMappings, 1);
  assert.equal(value.stats.conflictSources, 1);
  assert.deepEqual(value.conflicts, [{ from: "あや", targets: ["宮崎あや", "神谷充希"] }]);
});

test("Person Identity 候选按连通组件解析传递关系，但不推断 canonical", () => {
  const value = buildCandidateSet({ text: "美谷あかり=美谷朱里\n美谷朱里=美谷朱音\n谷坂かな=美谷朱里\n" });
  assert.equal(value.stats.clusters, 1);
  assert.deepEqual(new Set(value.clusters[0].names), new Set(["美谷あかり", "美谷朱里", "美谷朱音", "谷坂かな"]));
  assert.ok(value.clusters[0].reviewFlags.includes("contains-transitive-chain"));
  assert.equal(value.clusters[0].resolution.canonicalName, null);
  assert.equal(value.policy.substitutionTargetIsCanonical, false);
});

test("Person Identity 只对现有 Person 做规范化完全姓名匹配，不自动发布", () => {
  const people = [{ id: "person_000001", names: [{ language: "ja", type: "primary", value: "桃乃木かな" }, { language: "zh-CN", type: "localized", value: "桃乃木香奈" }] }];
  const value = buildCandidateSet({ text: "桃乃木香奈=桃乃木かな\n松嶋真麻=桃乃木かな\n", people });
  assert.deepEqual(value.clusters[0].matchedCommunityIds, ["person_000001"]);
  assert.equal(value.clusters[0].resolution.communityId, null);
  assert.equal(value.clusters[0].resolution.publish, false);
  assert.equal(value.policy.fuzzyAutoMerge, false);
});

test("Person Identity Candidate Validator 拒绝自动发布或 canonical 决策", () => {
  const value = buildCandidateSet({ text: "音琴るい=妃月るい\n" });
  assert.deepEqual(validateCandidateSet(value), []);
  value.clusters[0].resolution.publish = true;
  assert.match(validateCandidateSet(value).join("\n"), /不得自动决定/);
});

test("Substitution parser 对缺少等号的脏行只记录 parseErrors", () => {
  const parsed = parseSubstitutionText("正常=目标\nbroken line\n");
  assert.equal(parsed.mappings.length, 1);
  assert.equal(parsed.parseErrors.length, 1);
});
