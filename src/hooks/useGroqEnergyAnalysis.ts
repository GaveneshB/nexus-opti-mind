import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { groqGenerate } from "@/lib/groq";
import { GenomeWorkload } from "@/types/energy";

export interface WorkloadAnalysis {
  workloadId: string;
  optimization: string;
  efficiency: string;
  riskFactors: string[];
  predictedBehavior: string;
  recommendation: string;
  costSavingsPotential: string;
}

export interface MigrationRecommendation {
  id: string;
  workload: string;
  from: string;
  to: string;
  savings: string;
  savingsNum: number;
  eta: string;
}

export interface EnergyGenomeAIInsights {
  analyses: WorkloadAnalysis[];
  overallRecommendation: string;
  predictedPeakTime: string;
  anomaliesDetected: string[];
  topOptimizationOpportunity: string;
  migrations: MigrationRecommendation[];
}

/**
 * Build a stable, content-aware query key that changes when workload states change.
 * This ensures React Query detects migrations and triggers a fresh AI call.
 */
function buildQueryKey(workloads: GenomeWorkload[] | undefined): unknown[] {
  if (!workloads) return ["groq-energy-analysis", "none"];
  
  // Create a fingerprint from IDs + statuses + power levels (power changes after migration)
  const fingerprint = workloads
    .map(w => `${w.id}:${w.status ?? "unknown"}:${Math.round(w.avgPower)}`)
    .sort()
    .join("|");
  
  return ["groq-energy-analysis", fingerprint];
}

/**
 * Helper to safely parse JSON from Groq response
 */
function parseGroqJson<T>(response: string): T {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse Groq JSON response:", response);
    throw new Error(`Invalid JSON in Groq response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Hook to get Groq AI analysis of Energy Genome workloads
 * Uses Groq Llama 3.1 for unlimited, reliable migration suggestions
 * Features:
 * - Automatic retry with exponential backoff on rate limits
 * - Direct Groq API calls (no fallback to Gemini)
 * - Optimized for carbon migration recommendations
 */
export const useGroqEnergyAnalysis = (
  workloads: GenomeWorkload[] | undefined
): UseQueryResult<EnergyGenomeAIInsights, Error> => {
  return useQuery({
    queryKey: buildQueryKey(workloads),
    queryFn: async (): Promise<EnergyGenomeAIInsights> => {
      if (!workloads || workloads.length === 0) {
        return {
          analyses: [],
          overallRecommendation: "No workloads to analyze",
          predictedPeakTime: "N/A",
          anomaliesDetected: [],
          topOptimizationOpportunity: "N/A",
          migrations: [],
        };
      }

      // Only analyze active (non-migrated) workloads, sorted by power draw descending
      const activeWorkloads = workloads
        .filter((w) => w.status !== "migrated")
        .sort((a, b) => b.avgPower - a.avgPower)
        .slice(0, 3);

      // If everything is migrated, return early with a success message
      if (activeWorkloads.length === 0) {
        return {
          analyses: [],
          overallRecommendation: "All workloads have been optimized! Outstanding performance.",
          predictedPeakTime: "N/A",
          anomaliesDetected: [],
          topOptimizationOpportunity: "System fully optimized",
          migrations: [],
        };
      }

      const migratedWorkloads = workloads.filter((w) => w.status === "migrated");
      const migratedSummary = migratedWorkloads.length > 0
        ? migratedWorkloads.map(w => `${w.id} (migrated to ${w.match})`).join(", ")
        : "none";

      const workloadSummary = activeWorkloads
        .map(
          (w) =>
            `- ID: ${w.id}, Type: ${w.type}, Status: ${w.status}, Power: ${w.avgPower.toFixed(0)}W, Eff: ${w.efficiency}%`
        )
        .join("\n");

      const prompt = `[STRICT JSON OUTPUT ONLY - NO MARKDOWN, NO EXPLANATION]
You are an expert data center carbon emissions analyst using Reinforcement Learning optimization. Analyze these workloads and provide strategic insights and carbon-reducing migration recommendations.

CRITICAL RULES:
1. ALREADY MIGRATED (DO NOT recommend these again): ${migratedSummary}
2. Generate migration suggestions ONLY for the active workloads listed below.
3. Each migration "workload" field MUST exactly match an ID from the active workloads list.
4. Each migration must have a unique "id" field (use format "mig-{workloadId}-{timestamp}").
5. The "savingsNum" must be a realistic CO2 reduction in kg between 3.0 and 25.0.
6. Focus on renewable energy grid migration opportunities (Sabah Green, Hydro-Node-A, Hydro-Node-B).
7. Output ONLY valid JSON, no markdown code blocks, no explanations.

Active Workloads to Analyze:
${workloadSummary}

Respond using this exact JSON schema:
{
  "analyses": [
    {
      "workloadId": "string",
      "optimization": "string (brief)",
      "efficiency": "string (current %)",
      "riskFactors": ["string"],
      "predictedBehavior": "string",
      "recommendation": "string",
      "costSavingsPotential": "string"
    }
  ],
  "overallRecommendation": "string",
  "predictedPeakTime": "string (HH:MM AM/PM)",
  "anomaliesDetected": ["string"],
  "topOptimizationOpportunity": "string",
  "migrations": [
    {
      "id": "string",
      "workload": "string (must match active workload ID)",
      "from": "string (current grid)",
      "to": "string (renewable target grid)",
      "savings": "string (e.g., '12.4 kg CO2')",
      "savingsNum": number (CO2 kg reduction),
      "eta": "string (HH:MM AM/PM)"
    }
  ]
}`;

      try {
        console.log("🚀 [Groq] Building carbon migration analysis prompt...");
        const response = await groqGenerate(prompt);
        console.log("✅ [Groq] Parsing AI response...");
        const parsed = parseGroqJson<EnergyGenomeAIInsights>(response);
        
        // Post-process: filter out any hallucinated migrations for migrated workloads
        const migratedIds = new Set(migratedWorkloads.map(w => w.id));
        const validMigrations = (parsed.migrations || []).filter(m => !migratedIds.has(m.workload));
        
        return {
          ...parsed,
          migrations: validMigrations,
        };
      } catch (error) {
        console.error("❌ [Groq] Energy analysis failed:", error);
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - reduce refetch frequency to respect rate limits
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
    retry: 3, // Retry up to 3 times on network errors
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 60000), // Start at 2s, cap at 60s
  });
};
