import fs from "node:fs";
import path from "node:path";

export type CatalogItem = {
  Item: string;
  Materials: string;
  "Overall environmental ranking": string;
};

const RANK_ORDER = [
  "Very Low",
  "Low",
  "Medium-Low",
  "Medium",
  "Medium-High",
  "High",
  "Very High",
] as const;

export function rankToNumeric(label: string): number {
  const idx = RANK_ORDER.indexOf(label as any);
  return idx >= 0 ? idx : -1;
}

function safeSplitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map((c) => c.trim().replace(/^"|"$/g, ""));
}

let cachedCatalog: CatalogItem[] | null = null;

export function loadCatalog(): CatalogItem[] {
  if (cachedCatalog) return cachedCatalog;
  const filePath = path.join(process.cwd(), "data", "dataset.csv");
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = safeSplitCsvLine(lines[0]);
  const items: CatalogItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = safeSplitCsvLine(lines[i]);
    const rec: any = {};
    for (let c = 0; c < header.length; c++) {
      rec[header[c]] = row[c];
    }
    items.push({
      Item: rec["Item"],
      Materials: rec["Materials"],
      "Overall environmental ranking": rec["Overall environmental ranking"],
    });
  }
  cachedCatalog = items;
  return items;
}

export function suggestAlternatives(
  productName: string,
  count = 4
): { name: string; scoreLabel: string; materials?: string }[] {
  const catalog = loadCatalog();
  const targetTokens = new Set(
    productName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );

  const scored = catalog
    .map((it) => {
      const name = it.Item || "";
      const tokens = new Set(
        name.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean)
      );
      const intersection = [...tokens].filter((t) => targetTokens.has(t));
      const jaccard = intersection.length / new Set([...tokens, ...targetTokens]).size || 0;
      const rankNum = rankToNumeric(it["Overall environmental ranking"] || "");
      return { it, jaccard, rankNum };
    })
    .filter((x) => x.rankNum >= 5) // prefer High or Very High
    .sort((a, b) => b.jaccard - a.jaccard || b.rankNum - a.rankNum)
    .slice(0, count)
    .map((x) => ({
      name: x.it.Item,
      scoreLabel: x.it["Overall environmental ranking"],
      materials: x.it.Materials,
    }));

  return scored;
} 