#!/usr/bin/env node

const API_KEY = "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";

async function testGroqAPI() {
  console.log("🧪 Testing Groq API Key...\n");
  console.log(`API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(-5)}\n`);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Output ONLY valid JSON."
          },
          {
            role: "user",
            content: 'Return: {"test": "success"}',
          },
        ],
        temperature: 0.1,
        max_tokens: 100,
      }),
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    
    if (response.ok) {
      console.log("\n✅ API KEY IS VALID!\n");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      console.log("\n❌ API REQUEST FAILED!\n");
      console.log("Error:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log("\n❌ NETWORK ERROR!\n");
    console.log("Error:", error.message);
  }
}

testGroqAPI();
