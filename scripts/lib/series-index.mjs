export function decodeHtmlEntities(value) {
  return String(value ?? "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(value) {
  return decodeHtmlEntities(String(value ?? "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function attributeText(innerHtml) {
  const match = String(innerHtml ?? "").match(/\b(?:alt|title)\s*=\s*(["'])(.*?)\1/i);
  return match ? decodeHtmlEntities(match[2]).replace(/\s+/g, " ").trim() : "";
}

export function parseSeriesIndexHtml(html, config) {
  if (!config?.detailPathPattern) throw new Error("detailPathPattern is required");
  if (!config?.detailUrlTemplate?.includes("<id>")) throw new Error("detailUrlTemplate must contain <id>");

  const pathPattern = new RegExp(config.detailPathPattern);
  const anchorPattern = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  const entries = [];
  const seen = new Map();
  let match;
  while ((match = anchorPattern.exec(String(html ?? ""))) !== null) {
    const rawHref = decodeHtmlEntities(match[2]).trim();
    let url;
    try { url = new URL(rawHref, config.indexUrl); }
    catch { continue; }
    const pathMatch = url.pathname.match(pathPattern);
    if (!pathMatch) continue;
    const externalId = pathMatch[1] ?? pathMatch[0];
    let nameJa = stripTags(match[3]);
    if (!nameJa) nameJa = attributeText(match[3]);
    if (!nameJa) continue;
    const sourceUrl = config.detailUrlTemplate.replace("<id>", externalId);
    const prior = seen.get(externalId);
    if (prior) {
      if (prior.nameJa !== nameJa) {
        throw new Error(`同一 Series 外部 ID ${externalId} 在索引中出现不同名称：${prior.nameJa} / ${nameJa}`);
      }
      continue;
    }
    const entry = { position: entries.length + 1, externalId, nameJa, sourceUrl };
    entries.push(entry);
    seen.set(externalId, entry);
  }
  return entries;
}

export function latestSnapshotsByProvider(snapshots) {
  const latest = new Map();
  for (const snapshot of snapshots) {
    const prior = latest.get(snapshot.provider);
    if (!prior || `${snapshot.capturedAt}\0${snapshot.snapshotId}` > `${prior.capturedAt}\0${prior.snapshotId}`) {
      latest.set(snapshot.provider, snapshot);
    }
  }
  return latest;
}
