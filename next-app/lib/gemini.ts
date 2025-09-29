import { GoogleGenerativeAI } from "@google/generative-ai";

function resolveModelId(raw?: string): string {
  const id = (raw || "").trim();
  if (!id) return "gemini-1.5-flash";
  const aliasMap: Record<string, string> = {
    "gemini-flash-latest": "gemini-1.5-flash",
    "gemini-pro-latest": "gemini-1.5-pro",
    "gemini-1.5-flash-latest": "gemini-1.5-flash",
    "gemini-1.5-pro-latest": "gemini-1.5-pro",
  };
  return aliasMap[id] || id;
}

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY (or GOOGLE_API_KEY) env var");
  }
  return new GoogleGenerativeAI(apiKey);
}

export const DEFAULT_MODEL = resolveModelId(process.env.GEMINI_MODEL_ID) || "gemini-1.5-flash";
export const getResolvedModelId = () => DEFAULT_MODEL; 