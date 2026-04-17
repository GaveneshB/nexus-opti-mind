// Gemini API keys loaded from environment variables
export const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  import.meta.env.VITE_GEMINI_API_KEY_4,
  import.meta.env.VITE_GEMINI_API_KEY_5,
].filter(Boolean) as string[];

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Round-robin key rotation index (module-level state)
let _keyIndex = 0;

/** Returns the next API key in rotation. */
export function getRotatedApiKey(): string {
  const key = GEMINI_API_KEYS[_keyIndex % GEMINI_API_KEYS.length];
  _keyIndex++;
  return key;
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
        generationConfig: { maxOutputTokens: 32, temperature: 0 },
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
  const tried = new Set<string>();
  for (let attempt = 0; attempt < GEMINI_API_KEYS.length; attempt++) {
    const key = getRotatedApiKey();
    if (tried.has(key)) continue;
    tried.add(key);

    const result = await testGeminiKey(key, prompt);
    if (result.ok && result.response) return result.response;
  }
  throw new Error("All Gemini API keys failed or are exhausted.");
}
