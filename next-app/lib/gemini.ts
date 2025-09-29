import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY (or GOOGLE_API_KEY) env var");
  }
  return new GoogleGenerativeAI(apiKey);
}

export const DEFAULT_MODEL = (process.env.GEMINI_MODEL_ID || "gemini-flash-latest").trim();
export const getResolvedModelId = () => DEFAULT_MODEL; 