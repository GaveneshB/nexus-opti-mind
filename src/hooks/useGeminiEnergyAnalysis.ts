import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { geminiGenerate, parseGeminiJson } from "@/lib/gemini";
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
  if (!workloads) return ["gemini-energy-analysis", "none"];
  
  // Create a fingerprint from IDs + statuses + power levels (power changes after migration)
  const fingerprint = workloads
    .map(w => `${w.id}:${w.status ?? "unknown"}:${Math.round(w.avgPower)}`)
    .sort()
    .join("|");
  
  return ["gemini-energy-analysis", fingerprint];
}

/**
 * Hook to get Gemini AI analysis of Energy Genome workloads
 * CONSOLIDATED: Fetches all insights in a single API call to minimize quota usage.
 */
export const useGeminiEnergyAnalysis = (
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

      const prompt = `[STRICT JSON OUTPUT ONLY] 
You are an expert data center energy analyst and RL optimizer. Analyze these workloads and provide strategic insights and migration recommendations.

CRITICAL RULES:
1. ALREADY MIGRATED (DO NOT recommend these again): ${migratedSummary}
2. Generate migration suggestions ONLY for the active workloads listed below.
3. Each migration "workload" field MUST exactly match an ID from the active workloads list.
4. Each migration must have a unique "id" field (use format "mig-{workloadId}-{timestamp}").
5. The "savingsNum" must be a realistic float between 3.0 and 25.0.

Active Workloads to Analyze:
${workloadSummary}

Respond using the following JSON schema. DO NOT add any text before or after the JSON:
{
  "analyses": [
    {
      "workloadId": "string",
      "optimization": "string",
      "efficiency": "string",
      "riskFactors": ["string"],
      "predictedBehavior": "string",
      "recommendation": "string",
      "costSavingsPotential": "string"
    }
  ],
  "overallRecommendation": "string",
  "predictedPeakTime": "string",
  "anomaliesDetected": ["string"],
  "topOptimizationOpportunity": "string",
  "migrations": [
    {
      "id": "string",
      "workload": "string",
      "from": "string",
      "to": "string",
      "savings": "string",
      "savingsNum": number,
      "eta": "string"
    }
  ]
}`;

      try {
        const response = await geminiGenerate(prompt);
        const parsed = parseGeminiJson<EnergyGenomeAIInsights>(response);
        
        // Post-process: filter out any hallucinated migrations for migrated workloads
        const migratedIds = new Set(migratedWorkloads.map(w => w.id));
        const activeIds = new Set(activeWorkloads.map(w => w.id));
        
        if (parsed.migrations) {
          parsed.migrations = parsed.migrations.filter(m => 
            !migratedIds.has(m.workload) && activeIds.has(m.workload)
          );
        }
        
        return parsed;
      } catch (error) {
        console.error("Gemini Analysis failed:", error);
        throw error;
      }
    },
    enabled: !!workloads && workloads.length > 0,
    staleTime: 0, // Always refetch when query key changes (migration detected)
    gcTime: 30 * 1000, // Discard cache after 30 seconds for fresher results
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
};

/**
 * Hook to analyze a single workload
 */
export const useGeminiWorkloadAnalysis = (
  workload: GenomeWorkload | undefined
): UseQueryResult<WorkloadAnalysis, Error> => {
  return useQuery({
    queryKey: ["gemini-workload-analysis", workload?.id],
    queryFn: async (): Promise<WorkloadAnalysis> => {
      const prompt = `Analyze this workload: ${workload?.id} (${workload?.type}, ${workload?.avgPower}W).
Respond in JSON format:
{
  "optimization": "...",
  "efficiency": "...",
  "riskFactors": [],
  "predictedBehavior": "...",
  "recommendation": "...",
  "costSavingsPotential": "..."
}`;
      const response = await geminiGenerate(prompt);
      const parsed = parseGeminiJson<Omit<WorkloadAnalysis, "workloadId">>(response);
      return { workloadId: workload!.id, ...parsed };
    },
    enabled: !!workload,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
};
