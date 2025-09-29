// Convert data/dataset.csv into tuning/train.jsonl
// Each record becomes {input_text, output_text} with JSON output matching the API's schema
import fs from "node:fs";
import path from "node:path";

function safeSplitCsvLine(line) {
  const cells = [];
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

const RANK_TO_SCORE = {
  "Very Low": 0,
  "Low": 1,
  "Medium-Low": 2,
  "Medium": 3,
  "Medium-High": 4,
  "High": 5,
  "Very High": 6,
};

function main() {
  const dataPath = path.join(process.cwd(), "data", "dataset.csv");
  const outDir = path.join(process.cwd(), "tuning");
  const outPath = path.join(outDir, "train.jsonl");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const raw = fs.readFileSync(dataPath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = safeSplitCsvLine(lines[0]);

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const row = safeSplitCsvLine(lines[i]);
    const rec = {};
    for (let c = 0; c < header.length; c++) rec[header[c]] = row[c];

    const name = rec["Item"];
    const materials = (rec["Materials"] || "").split(/\s*,\s*/).filter(Boolean);
    const output = {
      materials,
      recyclability: rec["Recyclability"],
      biodegradability: rec["Biodegradability"],
      energy_consumption: rec["Energy Consumption"],
      electricity_usage: rec["Electricity Usage"],
      gasoline_usage: rec["Gasoline Usage"],
      water_usage: rec["Water Usage"],
      emission_levels: rec["Emission Levels"],
      recycled_materials_percentage: rec["% of Recycled Materials Used"],
      toxicity: rec["Toxicity"],
      eco_score: RANK_TO_SCORE[rec["Overall environmental ranking"]] ?? 3,
    };

    const input = `Rate the environmental friendliness of this product and return strict JSON with fields materials[], recyclability, biodegradability, energy_consumption, electricity_usage, gasoline_usage, water_usage, emission_levels, recycled_materials_percentage, toxicity, eco_score (0-6). Product name: ${name}`;

    records.push({ input_text: input, output_text: JSON.stringify(output) });
  }

  const stream = fs.createWriteStream(outPath, { encoding: "utf8" });
  for (const r of records) stream.write(JSON.stringify(r) + "\n");
  stream.end();
  console.log(`Wrote ${records.length} records to ${outPath}`);
}

main(); 