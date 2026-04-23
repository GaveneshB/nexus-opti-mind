
import { groqGenerate } from './src/lib/groq';

async function checkGroq() {
  console.log("Checking Groq API Key...");
  try {
    const result = await groqGenerate("Reply with exactly: OK");
    console.log("✅ Groq is working!");
    console.log("Response:", result);
  } catch (error) {
    console.log("❌ Groq failed:", error);
  }
}

checkGroq();
