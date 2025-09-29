import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_API_KEY env var");
  }
  return new GoogleGenerativeAI(apiKey);
}

export const DEFAULT_MODEL = process.env.GEMINI_MODEL_ID || "gemini-2.0-flash"; 