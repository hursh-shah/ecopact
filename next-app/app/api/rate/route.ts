import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, DEFAULT_MODEL } from "@/lib/gemini";
import { loadCatalog, rankToNumeric } from "@/lib/catalog";
import { extractAmazonInfo } from "@/lib/amazon";
import { findSustainableAlternatives } from "@/lib/agent";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60 seconds for agent operations

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

const responseSchema = {
  type: "object",
  properties: {
    materials: { type: "array", items: { type: "string" } },
    recyclability: { type: "string", enum: ["No", "Yes", "Partial"] },
    biodegradability: { type: "string", enum: ["No", "Yes", "Partial"] },
    energy_consumption: { type: "string", enum: ["Very Low", "Low", "Medium-Low", "Medium", "Medium-High", "High", "Very High"] },
    electricity_usage: { type: "string", enum: ["Very Low", "Low", "Medium-Low", "Medium", "Medium-High", "High", "Very High"] },
    gasoline_usage: { type: "string", enum: ["Very Low", "Low", "Medium-Low", "Medium", "Medium-High", "High", "Very High"] },
    water_usage: { type: "string", enum: ["Very Low", "Low", "Medium-Low", "Medium", "Medium-High", "High", "Very High"] },
    emission_levels: { type: "string", enum: ["Very Low", "Low", "Medium-Low", "Medium", "Medium-High", "High", "Very High"] },
    recycled_materials_percentage: { type: "string" },
    toxicity: { type: "string", enum: ["Very Low", "Low", "Medium-Low", "Medium", "Medium-High", "High", "Very High"] },
    eco_score: { type: "number" }
  },
  required: [
    "materials",
    "recyclability",
    "biodegradability",
    "energy_consumption",
    "electricity_usage",
    "gasoline_usage",
    "water_usage",
    "emission_levels",
    "recycled_materials_percentage",
    "toxicity",
    "eco_score",
  ]
} as const;

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

    const extracted = await extractAmazonInfo(url);
    const fallbackName = extracted.title || extractFromUrl(url) || "Amazon product";

    const topGreen = loadCatalog()
      .filter((x) => rankToNumeric(x["Overall environmental ranking"]) >= 5)
      .slice(0, 20)
      .map((x) => ({ name: x.Item, ranking: x["Overall environmental ranking"], materials: x.Materials }));

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const system = `You are an environmental impact rater. Respond ONLY as strict JSON following responseSchema. Estimate values conservatively when unknown.`;
    const user = `Rate the environmental friendliness of this product and return eco_score on a 0-6 scale (0 Very Low ... 6 Very High). Product name: ${fallbackName}. Hints: isRenewed=${extracted.isRenewed}; productType=${extracted.productType}; materialsHint=${extracted.materialsHint}. Consider catalog summary for similar items: ${JSON.stringify(topGreen).slice(0, 4000)}`;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: system }] },
        { role: "user", parts: [{ text: user }] },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
        temperature: 0.2,
      },
    });

    const text = result.response.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Model returned invalid JSON" }, { status: 500 });
    }

    const ecoScore = typeof parsed.eco_score === "number" ? parsed.eco_score : 3;

    // Use AI agent to find sustainable alternatives
    console.log(`\n🤖 Starting agent to find sustainable alternatives for: ${fallbackName}`);
    console.log(`📊 Current product score: ${ecoScore} (${labelFromScore(ecoScore)})`);
    
    const alternatives = await findSustainableAlternatives(
      fallbackName,
      extracted.productType,
      ecoScore,
      4 // Find top 4 alternatives
    );

    const altCollected = alternatives.map(alt => ({
      name: alt.name,
      scoreLabel: alt.scoreLabel,
      score: alt.score,
      materials: alt.materials.join(", "),
      link: alt.url,
      recyclability: alt.recyclability,
      recycledPercentage: alt.recycledPercentage,
      biodegradability: alt.biodegradability,
      isRenewed: alt.isRenewed,
    }));

    return NextResponse.json({
      productName: fallbackName,
      isRenewed: extracted.isRenewed,
      productType: extracted.productType,
      eco: {
        score: Math.max(0, Math.min(6, Math.round(ecoScore))),
        label: labelFromScore(ecoScore),
        breakdown: parsed,
      },
      alternatives: altCollected,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 });
  }
} 