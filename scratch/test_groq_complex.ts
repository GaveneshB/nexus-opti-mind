
import { groqGenerate } from './src/lib/groq';
import { parseGeminiJson } from './src/lib/gemini';

async function testComplexPrompt() {
  const prompt = `Analyze these workloads and provide strategic insights and migration recommendations.
  Active Workloads to Analyze:
  - ID: WL-Alpha, Type: ML Training, Status: running, Power: 4200W, Eff: 87%
  
  Respond in JSON format with these exact fields:
  {
    "analyses": [
      {
        "workloadId": "WL-Alpha",
        "optimization": "Brief specific optimization",
        "efficiency": "Efficiency analysis",
        "riskFactors": ["risk1"],
        "predictedBehavior": "Prediction",
        "recommendation": "Actionable recommendation",
        "costSavingsPotential": "Estimated savings"
      }
    ],
    "overallRecommendation": "Top strategic recommendation",
    "predictedPeakTime": "Predicted peak time",
    "anomaliesDetected": ["anomaly1"],
    "topOptimizationOpportunity": "Highest-impact opportunity",
    "migrations": [
      {
        "id": "mig-WL-Alpha-12345",
        "workload": "WL-Alpha",
        "from": "Current Grid",
        "to": "Target Renewable Grid",
        "savings": "10.0 kg",
        "savingsNum": 10.0,
        "eta": "10:00 AM"
      }
    ]
  }`;

  console.log("Testing Complex Prompt with Groq...");
  try {
    const response = await groqGenerate(prompt);
    console.log("Raw Response received.");
    const parsed = parseGeminiJson(response);
    console.log("✅ JSON Parsed successfully!");
    console.log(JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.log("❌ Complex test failed:", error);
  }
}

testComplexPrompt();
