import { NextRequest, NextResponse } from "next/server";
import { getGenAiClient, DEFAULT_MODEL } from "@/lib/gemini";
import { loadCatalog, suggestAlternatives, rankToNumeric } from "@/lib/catalog";

export const runtime = "nodejs";

function extractFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      const slug = decodeURIComponent(parts[0]);
      if (!slug.toLowerCase().startsWith("dp")) {
        return slug.replace(/[-_]+/g, " ");
      }
    }
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function fetchAmazonTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    const m1 = html.match(/id=\"productTitle\"[^>]*>([^<]+)/i);
    if (m1 && m1[1]) return m1[1].trim();
    const m2 = html.match(/<title>([^<]+)<\/title>/i);
    if (m2 && m2[1]) return m2[1].replace(/\s*:\s*Amazon\..+$/i, "").trim();
    return null;
  } catch {
    return null;
  }
}

function labelFromScore(score: number): string {
  const labels = ["Very Low", "Low", "Medium-Low", "Medium", "Medium-High", "High", "Very High"];
  const idx = Math.max(0, Math.min(6, Math.round(score)));
  return labels[idx];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = String(body.url || "");
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

    const fallbackName = extractFromUrl(url) || "Amazon product";
    const title = (await fetchAmazonTitle(url)) || fallbackName;

    const topGreen = loadCatalog()
      .filter((x) => rankToNumeric(x["Overall environmental ranking"]) >= 5)
      .slice(0, 20)
      .map((x) => ({ name: x.Item, ranking: x["Overall environmental ranking"], materials: x.Materials }));

    const ai = getGenAiClient();

    const system = `You are an environmental impact rater. Respond ONLY as strict JSON with fields: materials[], recyclability, biodegradability, energy_consumption, electricity_usage, gasoline_usage, water_usage, emission_levels, recycled_materials_percentage, toxicity, eco_score (0-6).`;
    const user = `Product name: ${title}. Consider catalog items (for grounding): ${JSON.stringify(topGreen).slice(0, 4000)}`;

    const result = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        { role: "user", parts: [{ text: system }] },
        { role: "user", parts: [{ text: user }] },
      ],
      config: {
        responseMimeType: "application/json",
        // If thinking is available on this model, budget small or omit entirely
        // thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = result.text;
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Model returned invalid JSON" }, { status: 502 });
    }

    const ecoScore = typeof parsed.eco_score === "number" ? parsed.eco_score : 3;
    const alternatives = suggestAlternatives(title, 6);

    return NextResponse.json({
      productName: title,
      eco: {
        score: Math.max(0, Math.min(6, Math.round(ecoScore))),
        label: labelFromScore(ecoScore),
        breakdown: parsed,
      },
      alternatives,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 });
  }
} 