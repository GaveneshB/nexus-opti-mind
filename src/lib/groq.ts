
/**
 * Groq AI Service
 * Low-latency replacement for Gemini during quota exhaustion
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.1-8b-instant";
const MAX_RETRIES = 2; // Reduced from 5 for faster failure
const INITIAL_RETRY_DELAY_MS = 300; // Faster retry: 300ms
const MAX_RETRY_DELAY_MS = 5000; // Cap at 5 seconds

/**
 * Sends a prompt to Groq API and returns the generated text with retry logic.
 */
export async function groqGenerate(prompt: string, retryCount = 0): Promise<string> {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!API_KEY) {
    const keys = Object.keys(import.meta.env).filter(k => k.startsWith("VITE_"));
    console.error("❌ Groq API key missing!");
    console.error("   VITE_ keys available:", keys);
    console.error("   import.meta.env.VITE_GROQ_API_KEY:", API_KEY);
    throw new Error("Groq API key missing. Add VITE_GROQ_API_KEY to .env");
  }

  console.log(`🚀 Groq Request (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
  //console.log(`   Key: ${API_KEY.substring(0, 15)}...${API_KEY.substring(-5)}`);
  console.log(`   Prompt length: ${prompt.length} chars`);

  try {
    console.log("📡 Sending request to api.groq.com...");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "Output ONLY valid JSON. No explanations."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    // Handle rate limiting with exponential backoff
    if (response.status === 429 && retryCount < MAX_RETRIES) {
      // Faster backoff: 300ms, 600ms, 1.2s (capped at 5s)
      const waitTime = Math.min(
        INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount),
        MAX_RETRY_DELAY_MS
      );
      console.warn(`⏳ Rate limited (429). Retrying in ${waitTime}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return groqGenerate(prompt, retryCount + 1);
    }

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { statusText: response.statusText };
      }
      const errorMsg = errorData?.error?.message || errorData?.message || response.statusText;
      console.error("❌ Groq API Response Error:", { 
        status: response.status, 
        statusText: response.statusText,
        errorData,
      });
      throw new Error(`Groq API error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    console.log("✅ Groq API response received:", { status: response.status, contentLength: JSON.stringify(data).length });
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("⚠️ Groq returned empty content. Full response:", data);
      throw new Error("Groq returned an empty response");
    }

    console.log("✅ Groq response extracted successfully, content length:", content.length);
    return content;
  } catch (error) {
    console.error("❌ Groq Generation failed:", error);
    throw error;
  }
}
