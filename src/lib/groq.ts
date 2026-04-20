
/**
 * Groq AI Service
 * Low-latency replacement for Gemini during quota exhaustion
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.1-8b-instant";

/**
 * Sends a prompt to Groq API and returns the generated text.
 */
export async function groqGenerate(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key missing. Add VITE_GROQ_API_KEY to .env");
  }

  try {
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
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response");
    }

    return content;
  } catch (error) {
    console.error("Groq Generation failed:", error);
    throw error;
  }
}
