import { GoogleGenAI } from "@google/genai";
import { env } from "@/config/env";

let geminiClient: GoogleGenAI | null = null;

export const DEFAULT_GEMINI_MODEL = "gemini-flash-lite-latest";

/**
 * Returns a configured GoogleGenAI client.
 * Lazy-initialized to avoid failures during build or when key is not yet set.
 */
export function getGeminiClient(): GoogleGenAI {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please configure GEMINI_API_KEY in .env.local to use AI services."
    );
  }

  geminiClient = new GoogleGenAI({ apiKey });
  return geminiClient;
}

/**
 * Checks if the Gemini API key has been supplied in the environment.
 */
export function isGeminiConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  return Boolean(
    apiKey &&
      apiKey.trim().length > 0 &&
      apiKey !== "your_gemini_api_key_here"
  );
}
