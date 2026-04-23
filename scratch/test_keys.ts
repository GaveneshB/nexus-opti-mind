
import { testGeminiKey, GEMINI_API_KEYS } from './src/lib/gemini';
import dotenv from 'dotenv';

dotenv.config();

async function checkKeys() {
  console.log("Checking Gemini API Keys...");
  if (GEMINI_API_KEYS.length === 0) {
    console.log("No Gemini API keys found in environment.");
    return;
  }

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const key = GEMINI_API_KEYS[i];
    console.log(`Testing Key ${i + 1}: ${key.substring(0, 8)}...`);
    const result = await testGeminiKey(key);
    if (result.ok) {
      console.log(`✅ Key ${i + 1} is working! Latency: ${result.latencyMs}ms`);
      console.log(`Response: ${result.response}`);
    } else {
      console.log(`❌ Key ${i + 1} failed: ${result.error}`);
    }
  }
}

checkKeys();
