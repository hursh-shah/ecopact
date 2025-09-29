import { GoogleGenAI } from "@google/genai";

export function getGenAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY env var");
  return new GoogleGenAI({ apiKey });
}

export const DEFAULT_MODEL = process.env.GEMINI_MODEL_ID || "gemini-flash-latest"; 