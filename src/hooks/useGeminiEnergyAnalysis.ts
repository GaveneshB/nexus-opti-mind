/**
 * Gemini AI Analysis Hook for Energy Genome Workloads
 * Uses AI to analyze workload patterns, identify optimizations, and predict behavior
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { geminiGenerate } from "@/lib/gemini";
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

export interface EnergyGenomeAIInsights {
  analyses: WorkloadAnalysis[];
  overallRecommendation: string;
  predictedPeakTime: string;
  anomaliesDetected: string[];
  topOptimizationOpportunity: string;
}

/**
 * Analyzes a single workload using Gemini AI
 */
async function analyzeWorkload(workload: GenomeWorkload): Promise<WorkloadAnalysis> {
  const prompt = `You are an expert data center energy optimization analyst. Analyze this workload and provide insights.

Workload Data:
- ID: ${workload.id}
- Type: ${workload.type}
- Status: ${workload.status || "unknown"}
- Average Power: ${workload.avgPower}W
- Efficiency: ${workload.efficiency || "N/A"}%
- Cost/Hour: $${workload.costPerHour?.toFixed(2) || "N/A"}
- Phases: ${workload.phases?.join(", ") || "N/A"}
- Twin Match: ${workload.match || "None"}

Respond in JSON format with these exact fields (no markdown):
{
  "optimization": "Brief specific optimization for this workload",
  "efficiency": "Analysis of current efficiency level",
  "riskFactors": ["risk1", "risk2"],
  "predictedBehavior": "What this workload will likely do next",
  "recommendation": "Actionable recommendation",
  "costSavingsPotential": "Estimated cost savings if optimized"
}`;

  try {
    const response = await geminiGenerate(prompt);
    const parsed = JSON.parse(response);
    return {
      workloadId: workload.id,
      ...parsed,
    };
  } catch (error) {
    console.error(`Failed to analyze workload ${workload.id}:`, error);
    return {
      workloadId: workload.id,
      optimization: "Unable to analyze - API error",
      efficiency: "Unknown",
      riskFactors: [],
      predictedBehavior: "Unable to predict",
      recommendation: "Retry analysis later",
      costSavingsPotential: "Unknown",
    };
  }
}

/**
 * Generates overall insights for all workloads
 */
async function generateOverallInsights(
  workloads: GenomeWorkload[],
  analyses: WorkloadAnalysis[]
): Promise<Omit<EnergyGenomeAIInsights, "analyses">> {
  const workloadSummary = workloads
    .map(
      (w) =>
        `${w.id}: ${w.type} (${w.status}, ${w.avgPower}W, ${w.efficiency || "?"}% eff)`
    )
    .join("\n");

  const prompt = `You are an expert data center energy analyst. Based on these workloads and their analyses, provide strategic insights.

Workloads:
${workloadSummary}

Respond in JSON format with these exact fields (no markdown):
{
  "overallRecommendation": "Top strategic recommendation for the entire workload portfolio",
  "predictedPeakTime": "When peak energy consumption will likely occur",
  "anomaliesDetected": ["anomaly1", "anomaly2"],
  "topOptimizationOpportunity": "Single highest-impact optimization"
}`;

  try {
    const response = await geminiGenerate(prompt);
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error("Failed to generate overall insights:", error);
    return {
      overallRecommendation: "Unable to generate recommendations at this time",
      predictedPeakTime: "Unable to predict",
      anomaliesDetected: [],
      topOptimizationOpportunity: "Unable to determine",
    };
  }
}

/**
 * Hook to get Gemini AI analysis of Energy Genome workloads
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

      // Analyze first 3 workloads to avoid excessive API calls
      const workloadsToAnalyze = workloads.slice(0, 3);
      const analyses = await Promise.all(
        workloadsToAnalyze.map((w) => analyzeWorkload(w))
      );

      const overallInsights = await generateOverallInsights(workloads, analyses);

      return {
        analyses,
        ...overallInsights,
      };
    },
    enabled: !!workloads && workloads.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    queryFn: () => analyzeWorkload(workload!),
    enabled: !!workload,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
