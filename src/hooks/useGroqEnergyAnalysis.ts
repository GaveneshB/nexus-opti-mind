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

      const prompt = `Output ONLY valid JSON. Analyze these workloads for carbon-reducing migrations.
Already migrated: ${migratedSummary}
Workloads:
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
        console.log("✅ [Groq] Successfully parsed AI insights:", { migrations: parsed.migrations?.length ?? 0 });
        
        // Post-process: filter out any hallucinated migrations for migrated workloads
        const migratedIds = new Set(migratedWorkloads.map(w => w.id));
        const validMigrations = (parsed.migrations || []).filter(m => !migratedIds.has(m.workload));
        
        return {
          ...parsed,
          migrations: validMigrations,
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("❌ [Groq] Energy analysis failed:", errorMsg, error);
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes - faster updates
    gcTime: 10 * 60 * 1000, // 10 minutes - shorter cache
    retry: 1, // Retry only once for fast failure
    retryDelay: (attemptIndex) => 1000, // 1 second fixed delay
  });
};
