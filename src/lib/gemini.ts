// Gemini API keys loaded from environment variables
export const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  import.meta.env.VITE_GEMINI_API_KEY_4,
  import.meta.env.VITE_GEMINI_API_KEY_5,
].filter(Boolean) as string[];

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

// Round-robin key rotation index (module-level state)
let _keyIndex = 0;

/** Returns the next API key in rotation. */
export function getRotatedApiKey(): string {
  if (GEMINI_API_KEYS.length === 0) return "";
  const key = GEMINI_API_KEYS[_keyIndex % GEMINI_API_KEYS.length];
  _keyIndex++;
  return key;
}

/** 
 * Cleans Gemini response by extracting JSON block.
 * Handles cases where the model adds introductory or concluding text.
 */
export function parseGeminiJson<T>(text: string): T {
  try {
    // 1. Try to extract JSON from markdown code blocks first
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/i) || 
                          text.match(/```\s*([\s\S]*?)\s*```/i);
    
    let jsonContent = codeBlockMatch ? codeBlockMatch[1] : text;

    // 2. If no code blocks, or nested, try to find the outermost braces
    if (!codeBlockMatch) {
      const firstBrace = jsonContent.indexOf('{');
      const lastBrace = jsonContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
      }
    }

    // 3. Clean up any remaining artifacts and parse
    const cleaned = jsonContent.trim();
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error("Failed to parse AI JSON:", e, "Original text snippet:", text.substring(0, 100) + "...");
    throw new Error("Invalid AI response format - could not extract valid JSON");
  }
}

export interface GeminiKeyStatus {
  index: number;
  key: string;
  maskedKey: string;
  status: "idle" | "testing" | "ok" | "error";
  latencyMs?: number;
  error?: string;
  response?: string;
}

/** Tests a single Gemini API key and returns its status. */
export async function testGeminiKey(
  key: string,
  prompt = "Reply with exactly: OK"
): Promise<{ ok: boolean; latencyMs: number; response?: string; error?: string }> {
  const start = performance.now();
  try {
    const res = await fetch(`${GEMINI_BASE_URL}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.1 },
      }),
    });

    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        ok: false,
        latencyMs,
        error: errJson?.error?.message ?? `HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty response)";

    return { ok: true, latencyMs, response: text.trim() };
  } catch (err: unknown) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

import { groqGenerate } from "./groq";

/** Sends a prompt using Groq AI (replacement for Gemini). */
export async function geminiGenerate(prompt: string): Promise<string> {
  try {
    console.log("🔄 Attempting Groq AI call...");
    const response = await groqGenerate(prompt);
    console.log("✅ Groq AI responded successfully");
    return response;
  } catch (error) {
    console.error("❌ Groq failed:", error);
    throw new Error(`AI Generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
