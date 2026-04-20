#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";

// Load .env file
const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  if (line.includes("=")) {
    const [key, value] = line.split("=");
    env[key.trim()] = value.trim();
  }
});

const GROQ_API_KEY = env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("❌ VITE_GROQ_API_KEY not found in .env");
  process.exit(1);
}

console.log("✅ VITE_GROQ_API_KEY found (", GROQ_API_KEY.substring(0, 10) + "..." + ")");

// Test Groq API
async function testGroq() {
  try {
    console.log("\n🚀 Testing Groq API...\n");
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a JSON generator. Output ONLY valid JSON."
          },
          {
            role: "user",
            content: 'Generate a test response in this JSON format: {"status": "working", "model": "llama-3.1-8b-instant"}',
          },
        ],
        temperature: 0.1,
        max_tokens: 256,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Groq API Error:", response.status);
      console.error("Details:", JSON.stringify(error, null, 2));
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("❌ No content in response");
      console.error("Response:", JSON.stringify(data, null, 2));
      return;
    }

    console.log("✅ Groq API Response:");
    console.log(content);
    console.log("\n✅ Groq is working correctly!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testGroq();
