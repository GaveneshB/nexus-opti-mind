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
 * Hook to get Gemini AI analysis of Energy Genome workloads
 * CONSOLIDATED: Fetches all insights in a single API call to minimize quota usage.
 */
export const useGeminiEnergyAnalysis = (
  workloads: GenomeWorkload[] | undefined
): UseQueryResult<EnergyGenomeAIInsights, Error> => {
  return useQuery({
    queryKey: ["gemini-energy-analysis", workloads?.map((w) => w.id).join(",")],
    queryFn: async (): Promise<EnergyGenomeAIInsights> => {
      if (!workloads || workloads.length === 0) {
        return {
          analyses: [],
          overallRecommendation: "No workloads to analyze",
          predictedPeakTime: "N/A",
          anomaliesDetected: [],
          topOptimizationOpportunity: "N/A",
        };
      }

      // Analyze first 3 workloads to avoid excessive context size
      const workloadsToAnalyze = workloads.slice(0, 3);
      const workloadSummary = workloadsToAnalyze
        .map(
          (w) =>
            `- ID: ${w.id}, Type: ${w.type}, Status: ${w.status}, Power: ${w.avgPower}W, Eff: ${w.efficiency}%`
        )
        .join("\n");

      const prompt = `You are an expert data center energy analyst and RL optimizer. Analyze these workloads and provide strategic insights and migration recommendations.

Workloads:
${workloadSummary}

Respond in JSON format with these exact fields:
{
  "analyses": [
    {
      "workloadId": "id from input",
      "optimization": "Brief specific optimization",
      "efficiency": "Efficiency analysis",
      "riskFactors": ["risk1", "risk2"],
      "predictedBehavior": "Prediction",
      "recommendation": "Actionable recommendation",
      "costSavingsPotential": "Estimated savings"
    }
  ],
  "overallRecommendation": "Top strategic recommendation",
  "predictedPeakTime": "Predicted peak time",
  "anomaliesDetected": ["anomaly1", "anomaly2"],
  "topOptimizationOpportunity": "Highest-impact opportunity",
  "migrations": [
    {
      "id": "unique-id",
      "workload": "Workload ID",
      "from": "Current Grid",
      "to": "Target Renewable Grid (e.g. Sabah Green)",
      "savings": "X.X kg",
      "savingsNum": float,
      "eta": "HH:MM AM/PM"
    }
  ]
}`;

      try {
        const response = await geminiGenerate(prompt);
        return parseGeminiJson<EnergyGenomeAIInsights>(response);
      } catch (error) {
        console.error("Gemini Analysis failed:", error);
        throw error;
      }
    },
    enabled: !!workloads && workloads.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes (increased to save quota)
    retry: 1,
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
