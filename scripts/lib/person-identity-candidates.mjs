import crypto from "node:crypto";

export const METATUBE_ACTOR_SOURCE = Object.freeze({
  sourceId: "source_metatube_actor_substitution",
  sourceUrl: "https://github.com/metatube-community/jellyfin-plugin-metatube/discussions/491",
  format: "from=to",
});

export function normalizeName(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("und");
}

export function parseSubstitutionText(text) {
  const rawMappings = [];
  const parseErrors = [];
  const lines = String(text ?? "").replace(/^\uFEFF/, "").split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0 || separator === line.length - 1) {
      parseErrors.push({ lineNumber: index + 1, line, reason: "expected-nonempty-from-and-to" });
      continue;
    }
    const from = line.slice(0, separator).trim();
    const to = line.slice(separator + 1).trim();
    if (!from || !to) {
      parseErrors.push({ lineNumber: index + 1, line, reason: "expected-nonempty-from-and-to" });
      continue;
    }
    rawMappings.push({ from, to, lineNumber: index + 1 });
  }

  const uniqueByPair = new Map();
  for (const mapping of rawMappings) {
    const key = `${mapping.from}\0${mapping.to}`;
    const prior = uniqueByPair.get(key);
    if (prior) prior.lineNumbers.push(mapping.lineNumber);
    else uniqueByPair.set(key, { from: mapping.from, to: mapping.to, lineNumbers: [mapping.lineNumber] });
  }

  return {
    rawMappings,
    mappings: [...uniqueByPair.values()],
    parseErrors,
    duplicateMappings: rawMappings.length - uniqueByPair.size,
  };
}

function connectedComponents(mappings) {
  const graph = new Map();
  const addNode = (name) => { if (!graph.has(name)) graph.set(name, new Set()); };
  for (const { from, to } of mappings) {
    addNode(from); addNode(to);
    if (from !== to) {
      graph.get(from).add(to);
      graph.get(to).add(from);
    }
  }

  const components = [];
  const visited = new Set();
  for (const start of [...graph.keys()].sort((a, b) => a.localeCompare(b, "ja"))) {
    if (visited.has(start)) continue;
    const stack = [start];
    const names = [];
    visited.add(start);
    while (stack.length) {
      const name = stack.pop();
      names.push(name);
      for (const next of graph.get(name) ?? []) {
        if (!visited.has(next)) { visited.add(next); stack.push(next); }
      }
    }
    components.push(names.sort((a, b) => a.localeCompare(b, "ja")));
  }
  return components;
}

function findDirectedCycle(mappings) {
  const adjacency = new Map();
  for (const { from, to } of mappings) {
    if (from === to) continue;
    if (!adjacency.has(from)) adjacency.set(from, new Set());
    adjacency.get(from).add(to);
  }
  const state = new Map();
  function visit(node) {
    const current = state.get(node) ?? 0;
    if (current === 1) return true;
    if (current === 2) return false;
    state.set(node, 1);
    for (const next of adjacency.get(node) ?? []) if (visit(next)) return true;
    state.set(node, 2);
    return false;
  }
  return [...adjacency.keys()].some((node) => visit(node));
}

function communityNameIndex(people) {
  const index = new Map();
  for (const person of people ?? []) {
    for (const entry of person.names ?? []) {
      const key = normalizeName(entry?.value);
      if (!key) continue;
      if (!index.has(key)) index.set(key, new Set());
      index.get(key).add(person.id);
    }
  }
  return index;
}

function componentFlags(names, edges, conflictSources, matchedCommunityIds) {
  const flags = new Set();
  if (names.some((name) => conflictSources.has(name))) flags.add("conflicting-source");
  if (edges.some((edge) => edge.from === edge.to)) flags.add("self-mapping");
  if (names.some((name) => [...name].length <= 3)) flags.add("contains-short-name");
  if (names.some((name) => /(さん|ちゃん|くん|君|様|女王様)$/u.test(name))) flags.add("contains-honorific");
  if (matchedCommunityIds.length > 1) flags.add("multiple-community-matches");
  if (edges.some((edge) => edges.some((other) => edge.to === other.from && edge.from !== edge.to && other.from !== other.to))) flags.add("contains-transitive-chain");
  return [...flags].sort();
}

export function buildCandidateSet({ text, people = [], inputFileName = "substitution.Actor.txt", source = METATUBE_ACTOR_SOURCE }) {
  const parsed = parseSubstitutionText(text);
  const sourceTargets = new Map();
  for (const { from, to } of parsed.mappings) {
    if (!sourceTargets.has(from)) sourceTargets.set(from, new Set());
    sourceTargets.get(from).add(to);
  }
  const conflictSources = new Set([...sourceTargets].filter(([, targets]) => targets.size > 1).map(([from]) => from));
  const selfMappings = parsed.mappings.filter((item) => item.from === item.to);
  const allNames = new Set(parsed.mappings.flatMap((item) => [item.from, item.to]));
  const components = connectedComponents(parsed.mappings);
  const nameToComponent = new Map();
  for (let index = 0; index < components.length; index += 1) for (const name of components[index]) nameToComponent.set(name, index);
  const edgesByComponent = components.map(() => []);
  for (const mapping of parsed.mappings) edgesByComponent[nameToComponent.get(mapping.from)].push(mapping);

  const communityIndex = communityNameIndex(people);
  const clusters = components.map((names, index) => {
    const edges = edgesByComponent[index].sort((a, b) => a.from.localeCompare(b.from, "ja") || a.to.localeCompare(b.to, "ja"));
    const matched = new Set();
    for (const name of names) for (const id of communityIndex.get(normalizeName(name)) ?? []) matched.add(id);
    const matchedCommunityIds = [...matched].sort();
    const candidateId = `person_identity_candidate_${crypto.createHash("sha256").update(names.join("\0")).digest("hex").slice(0, 16)}`;
    return {
      candidateId,
      names,
      edges,
      matchedCommunityIds,
      reviewFlags: componentFlags(names, edges, conflictSources, matchedCommunityIds),
      resolution: {
        status: "unreviewed",
        canonicalName: null,
        communityId: null,
        publish: false,
      },
    };
  }).sort((a, b) => a.candidateId.localeCompare(b.candidateId));

  const conflicts = [...conflictSources].sort((a, b) => a.localeCompare(b, "ja")).map((from) => ({
    from,
    targets: [...sourceTargets.get(from)].sort((a, b) => a.localeCompare(b, "ja")),
  }));

  const sourceFileSha256 = crypto.createHash("sha256").update(String(text ?? ""), "utf8").digest("hex");
  const matchedClusters = clusters.filter((cluster) => cluster.matchedCommunityIds.length > 0).length;
  const multiMatchedClusters = clusters.filter((cluster) => cluster.matchedCommunityIds.length > 1).length;
  const transitiveSources = [...sourceTargets.keys()].filter((name) => {
    const targets = sourceTargets.get(name) ?? new Set();
    return [...targets].some((target) => target !== name && [...(sourceTargets.get(target) ?? [])].some((next) => next !== target));
  });

  return {
    schemaVersion: 1,
    kind: "person-identity-candidate-set",
    source: {
      sourceId: source.sourceId,
      sourceUrl: source.sourceUrl,
      inputFileName,
      sourceFileSha256,
      format: source.format,
    },
    policy: {
      substitutionTargetIsCanonical: false,
      exactCommunityNameMatchOnly: true,
      fuzzyAutoMerge: false,
      autoPublish: false,
      thirdPartyCandidateDataRemainsLocal: true,
    },
    stats: {
      rawMappings: parsed.rawMappings.length,
      uniqueMappings: parsed.mappings.length,
      duplicateMappings: parsed.duplicateMappings,
      uniqueSources: sourceTargets.size,
      uniqueNames: allNames.size,
      clusters: clusters.length,
      conflictSources: conflicts.length,
      selfMappings: selfMappings.length,
      transitiveSources: transitiveSources.length,
      parseErrors: parsed.parseErrors.length,
      matchedClusters,
      multiMatchedClusters,
    },
    conflicts,
    parseErrors: parsed.parseErrors,
    clusters,
  };
}

export function validateCandidateSet(value) {
  const errors = [];
  if (!value || typeof value !== "object") return ["根对象无效"];
  if (value.schemaVersion !== 1) errors.push("schemaVersion 必须为 1");
  if (value.kind !== "person-identity-candidate-set") errors.push("kind 必须为 person-identity-candidate-set");
  if (!value.source?.sourceId?.startsWith("source_")) errors.push("source.sourceId 无效");
  if (!/^https?:\/\//.test(value.source?.sourceUrl ?? "")) errors.push("source.sourceUrl 无效");
  if (!/^[0-9a-f]{64}$/.test(value.source?.sourceFileSha256 ?? "")) errors.push("source.sourceFileSha256 必须为 SHA-256");
  if (value.policy?.substitutionTargetIsCanonical !== false) errors.push("policy.substitutionTargetIsCanonical 必须为 false");
  if (value.policy?.exactCommunityNameMatchOnly !== true) errors.push("policy.exactCommunityNameMatchOnly 必须为 true");
  if (value.policy?.fuzzyAutoMerge !== false) errors.push("policy.fuzzyAutoMerge 必须为 false");
  if (value.policy?.autoPublish !== false) errors.push("policy.autoPublish 必须为 false");
  if (value.policy?.thirdPartyCandidateDataRemainsLocal !== true) errors.push("policy.thirdPartyCandidateDataRemainsLocal 必须为 true");
  if (!Array.isArray(value.clusters)) errors.push("clusters 必须为数组");
  if (!Array.isArray(value.conflicts)) errors.push("conflicts 必须为数组");
  if (!Array.isArray(value.parseErrors)) errors.push("parseErrors 必须为数组");

  const candidateIds = new Set();
  for (const cluster of value.clusters ?? []) {
    if (!/^person_identity_candidate_[0-9a-f]{16}$/.test(cluster.candidateId ?? "")) errors.push(`candidateId 无效 (${cluster.candidateId ?? "<empty>"})`);
    if (candidateIds.has(cluster.candidateId)) errors.push(`candidateId 重复 (${cluster.candidateId})`);
    candidateIds.add(cluster.candidateId);
    if (!Array.isArray(cluster.names) || cluster.names.length === 0 || cluster.names.some((name) => typeof name !== "string" || !name.trim())) errors.push(`${cluster.candidateId}: names 无效`);
    if (new Set(cluster.names).size !== (cluster.names?.length ?? 0)) errors.push(`${cluster.candidateId}: names 包含重复值`);
    if (!Array.isArray(cluster.edges) || cluster.edges.length === 0) errors.push(`${cluster.candidateId}: edges 不能为空`);
    for (const edge of cluster.edges ?? []) {
      if (!cluster.names?.includes(edge.from) || !cluster.names?.includes(edge.to)) errors.push(`${cluster.candidateId}: edge 引用了 cluster 外姓名`);
      if (!Array.isArray(edge.lineNumbers) || edge.lineNumbers.some((n) => !Number.isInteger(n) || n <= 0)) errors.push(`${cluster.candidateId}: edge.lineNumbers 无效`);
    }
    if (!Array.isArray(cluster.matchedCommunityIds) || cluster.matchedCommunityIds.some((id) => !/^person_\d{6}$/.test(id))) errors.push(`${cluster.candidateId}: matchedCommunityIds 无效`);
    if (!Array.isArray(cluster.reviewFlags)) errors.push(`${cluster.candidateId}: reviewFlags 必须为数组`);
    if (cluster.resolution?.status !== "unreviewed") errors.push(`${cluster.candidateId}: 本地导入初始 resolution.status 必须为 unreviewed`);
    if (cluster.resolution?.canonicalName !== null || cluster.resolution?.communityId !== null || cluster.resolution?.publish !== false) errors.push(`${cluster.candidateId}: 导入器不得自动决定 canonical/communityId/publish`);
  }

  const stats = value.stats ?? {};
  const integerKeys = ["rawMappings","uniqueMappings","duplicateMappings","uniqueSources","uniqueNames","clusters","conflictSources","selfMappings","transitiveSources","parseErrors","matchedClusters","multiMatchedClusters"];
  for (const key of integerKeys) if (!Number.isInteger(stats[key]) || stats[key] < 0) errors.push(`stats.${key} 必须为非负整数`);
  if (stats.clusters !== (value.clusters?.length ?? -1)) errors.push("stats.clusters 与 clusters.length 不一致");
  if (stats.conflictSources !== (value.conflicts?.length ?? -1)) errors.push("stats.conflictSources 与 conflicts.length 不一致");
  if (stats.parseErrors !== (value.parseErrors?.length ?? -1)) errors.push("stats.parseErrors 与 parseErrors.length 不一致");
  if (stats.uniqueMappings > stats.rawMappings) errors.push("stats.uniqueMappings 不得大于 rawMappings");
  if (stats.duplicateMappings !== stats.rawMappings - stats.uniqueMappings) errors.push("stats.duplicateMappings 与 raw/unique 不一致");
  if (findDirectedCycle((value.clusters ?? []).flatMap((cluster) => cluster.edges ?? []))) errors.push("候选关系存在有向循环，需要人工审核后再使用");
  return errors;
}

export function candidateSetCsv(value) {
  const escape = (field) => {
    const text = String(field ?? "");
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const rows = [["candidate_id","names","matched_community_ids","review_flags","edge_count","resolution_status"]];
  for (const cluster of value.clusters ?? []) rows.push([
    cluster.candidateId,
    cluster.names.join(";"),
    cluster.matchedCommunityIds.join(";"),
    cluster.reviewFlags.join(";"),
    cluster.edges.length,
    cluster.resolution.status,
  ]);
  return `${rows.map((row) => row.map(escape).join(",")).join("\n")}\n`;
}
