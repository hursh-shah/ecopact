import { generateText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { searchAmazon, extractAmazonInfo } from "./amazon";

// Helper to rate a product's environmental impact
async function rateProductEnvironmentally(
  productName: string,
  isRenewed: boolean,
  materialsHint: string | null,
  productType: string | null
): Promise<{
  score: number;
  label: string;
  materials: string[];
  recyclability: string;
  recycledPercentage: string;
  biodegradability: string;
}> {
  // The google() function uses GOOGLE_GENERATIVE_AI_API_KEY from env by default
  // We need to ensure it's set correctly
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY");
  }

  // Set the expected env var if using GEMINI_API_KEY
  if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
  }

  const model = google("gemini-2.0-flash-exp");

  const prompt = `Rate the environmental impact of this product on a 0-6 scale (0=Very Low impact/bad, 6=Very High impact/good for environment).

Product: ${productName}
Is Renewed/Refurbished: ${isRenewed ? "Yes" : "No"}
Materials hint: ${materialsHint || "unknown"}
Product type: ${productType || "unknown"}

Consider:
- % of recycled materials (higher is better)
- New vs renewed/refurbished (renewed is better)
- Sustainability of materials (e.g., organic cotton > polyester, bamboo > plastic)
- Energy consumption in production
- Recyclability and biodegradability

Return JSON with: score (0-6), materials (array), recyclability (No/Yes/Partial), recycled_percentage (string like "0%", "50%", "100%"), biodegradability (No/Yes/Partial)`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.3,
  });

  // Parse the response
  let parsed: any = {};
  try {
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fallback
    parsed = {
      score: isRenewed ? 4 : 2,
      materials: materialsHint ? [materialsHint] : ["unknown"],
      recyclability: "Partial",
      recycled_percentage: "0%",
      biodegradability: "No",
    };
  }

  const labels = [
    "Very Low",
    "Low",
    "Medium-Low",
    "Medium",
    "Medium-High",
    "High",
    "Very High",
  ];
  const score = Math.max(0, Math.min(6, Math.round(parsed.score || 0)));

  return {
    score,
    label: labels[score],
    materials: Array.isArray(parsed.materials) ? parsed.materials : [materialsHint || "unknown"],
    recyclability: parsed.recyclability || "Unknown",
    recycledPercentage: parsed.recycled_percentage || "0%",
    biodegradability: parsed.biodegradability || "Unknown",
  };
}

export type Alternative = {
  name: string;
  url: string;
  score: number;
  scoreLabel: string;
  materials: string[];
  recyclability: string;
  recycledPercentage: string;
  biodegradability: string;
  price?: string;
  isRenewed: boolean;
};

export async function findSustainableAlternatives(
  productName: string,
  productType: string | null,
  currentScore: number,
  maxResults: number = 4
): Promise<Alternative[]> {
  console.log(`\n🤖 Finding sustainable alternatives for: ${productName}`);
  console.log(`📊 Current product score: ${currentScore}`);
  console.log(`🎯 Target score: ${Math.max(4, currentScore + 1)} or higher`);

  const alternatives: Alternative[] = [];
  const seen = new Set<string>();

  // Search with eco-focused queries
  const fallbackQueries = [
    `${productType || productName} recycled sustainable`,
    `${productType || productName} eco friendly organic`,
    `${productType || productName} renewed refurbished`,
    `${productType || productName} biodegradable recyclable`,
  ];

  for (const query of fallbackQueries) {
    if (alternatives.length >= maxResults) break;

    console.log(`🔍 Searching: ${query}`);
    const searchResults = await searchAmazon(query, 4);
    
    for (const result of searchResults) {
      if (alternatives.length >= maxResults) break;
      if (seen.has(result.url)) continue;

      console.log(`📦 Extracting details: ${result.title.substring(0, 50)}...`);
      const details = await extractAmazonInfo(result.url);
      
      console.log(`⚖️ Rating product...`);
      const rating = await rateProductEnvironmentally(
        result.title,
        result.isRenewed,
        details.materialsHint,
        details.productType
      );

      console.log(`  → Score: ${rating.score}/6 (${rating.label}), Recycled: ${rating.recycledPercentage}`);

      if (rating.score >= Math.max(4, currentScore + 1)) {
        console.log(`  ✅ Meets criteria! Adding to alternatives.`);
        alternatives.push({
          name: result.title,
          url: result.url,
          score: rating.score,
          scoreLabel: rating.label,
          materials: rating.materials,
          recyclability: rating.recyclability,
          recycledPercentage: rating.recycledPercentage,
          biodegradability: rating.biodegradability,
          isRenewed: result.isRenewed,
        });
        seen.add(result.url);
      } else {
        console.log(`  ❌ Score too low, skipping.`);
      }
    }
  }

  console.log(`\n🎯 Found ${alternatives.length} sustainable alternatives\n`);
  return alternatives.slice(0, maxResults);
}
