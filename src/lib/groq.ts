
/**
 * Groq AI Service
 * Low-latency replacement for Gemini during quota exhaustion
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.1-8b-instant";
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 500; // Faster retry: 500ms
const MAX_RETRY_DELAY_MS = 10000; // Cap at 10 seconds

// Request queue to prevent concurrent API calls
let requestQueue: Promise<any> = Promise.resolve();

/**
 * Queue a request to prevent concurrent API calls during rate limiting
 */
function queueRequest<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue = requestQueue.then(async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }).catch(reject);
  });
}

/**
 * Sends a prompt to Groq API and returns the generated text with retry logic.
 */
export async function groqGenerate(prompt: string, retryCount = 0): Promise<string> {
  if (!GROQ_API_KEY) {
    console.error("❌ Groq API key missing. Add VITE_GROQ_API_KEY to .env");
    throw new Error("Groq API key missing. Add VITE_GROQ_API_KEY to .env");
  }

  return queueRequest(async () => {
    try {
      console.log(`🚀 Groq Request (attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: "system",
              content: "You are a specialized energy optimization engine. You output ONLY valid JSON. NEVER include introductory text, conversational markers, or explanations outside the JSON block."
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 2048,
        }),
      });

      // Handle rate limiting with exponential backoff
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        // Faster backoff: 500ms, 1s, 2s, 4s, 8s, 10s (capped)
        const waitTime = Math.min(
          INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount),
          MAX_RETRY_DELAY_MS
        );
        console.warn(`⏳ Rate limited (429). Retrying in ${waitTime}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return groqGenerate(prompt, retryCount + 1);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || response.statusText;
        throw new Error(`Groq API error (${response.status}): ${errorMsg}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.warn("⚠️ Groq returned empty content:", data);
        throw new Error("Groq returned an empty response");
      }

      console.log("✅ Groq response received successfully");
      return content;
    } catch (error) {
      console.error("❌ Groq Generation failed:", error);
      throw error;
    }
  });
}
