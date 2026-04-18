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
 * Cleans Gemini response by stripping markdown code blocks.
 */
export function parseGeminiJson<T>(text: string): T {
  try {
    // Remove markdown code blocks if present
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", e, "Original text:", text);
    throw new Error("Invalid AI response format");
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

/** Sends a prompt using automatic key rotation (skips failed keys). */
export async function geminiGenerate(prompt: string): Promise<string> {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error("No Gemini API keys configured in .env");
  }

  const tried = new Set<string>();
  let lastError = "";

  for (let attempt = 0; attempt < Math.min(GEMINI_API_KEYS.length, 5); attempt++) {
    const key = getRotatedApiKey();
    if (tried.has(key)) continue;
    tried.add(key);

    const result = await testGeminiKey(key, prompt);
    
    if (result.ok && result.response) {
      return result.response;
    }

    lastError = result.error || "Unknown error";
    
    // If it's a rate limit error, wait a bit before trying the next key
    if (lastError.includes("429") || lastError.toLowerCase().includes("quota")) {
      console.warn(`Gemini Key ${attempt + 1} rate limited. Waiting 1s before rotation...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error(`All Gemini API keys failed: ${lastError}`);
}
