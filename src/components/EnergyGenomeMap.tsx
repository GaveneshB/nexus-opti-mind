import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Dna, Link2, AlertCircle, Loader, Sparkles, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import { useEnergyGenomeWorkloads } from "@/hooks/useEnergyGenome";
import { useGeminiEnergyAnalysis, type WorkloadAnalysis } from "@/hooks/useGeminiEnergyAnalysis";
import { getFallbackGenomeWorkloads } from "@/lib/mockData";
import { carbonStore } from "@/lib/carbonStore";
import { SystemIntegration } from "@/lib/systemIntegration";
import { GenomeWorkload } from "@/types/energy";

const phaseLabels = ["Spin-up", "Ramp", "Peak", "Sustain", "Cool", "Idle", "Teardown"];

const WorkloadCard = ({ workload, index, analysis }: { workload: GenomeWorkload; index: number; analysis?: WorkloadAnalysis }) => {
  return (
    <motion.div
      key={workload.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-xl p-3 hover:glass-bright transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-primary">{workload.id}</span>
          <span className="text-xs text-muted-foreground">{workload.type}</span>
          {workload.status && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
                workload.status === "running"
                  ? "bg-green-500/20 text-green-400"
                  : workload.status === "scheduled"
                    ? "bg-blue-500/20 text-blue-400"
                    : workload.status === "migrated"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {workload.status}
            </span>
          )}
          {analysis && analysis.optimization && workload.status !== "migrated" && (
            <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-md animate-pulse">
              <Sparkles className="h-3 w-3" strokeWidth={1.5} /> AI Insight
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="font-mono text-xs text-muted-foreground">{workload.avgPower.toFixed(0)}W</span>
            {workload.efficiency && (
              <span className="block font-mono text-[10px] text-accent">
                {workload.efficiency}% eff
              </span>
            )}
          </div>
          {workload.match && (
            <span className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-md">
              <Link2 className="h-3 w-3" strokeWidth={1.5} /> {workload.match}
            </span>
          )}
        </div>
      </div>

      {/* DNA bar visualization */}
      <div className="flex gap-1">
        {workload.phases.map((intensity, j) => (
          <div key={j} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-md transition-all hover:brightness-125"
              style={{
                height: `${intensity * 32}px`,
                background: `linear-gradient(180deg, hsl(${190 - intensity * 150} ${60 + intensity * 40}% ${50 + intensity * 15}% / 0.8), hsl(${190 - intensity * 150} ${60 + intensity * 40}% ${30 + intensity * 10}% / 0.6))`,
                boxShadow: `0 2px 8px hsl(${190 - intensity * 150} ${60 + intensity * 40}% ${40 + intensity * 20}% / 0.3)`,
              }}
              title={`${phaseLabels[j]}: ${(intensity * 100).toFixed(0)}%`}
            />
            <span className="text-[8px] text-muted-foreground">{phaseLabels[j]}</span>
          </div>
        ))}
      </div>

      {workload.costPerHour && (
        <div className="mt-2 text-[10px] text-muted-foreground">
          Cost: ${workload.costPerHour.toFixed(2)}/hr
        </div>
      )}

      {/* AI Analysis Section */}
      {analysis && workload.status !== "migrated" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 pt-3 border-t border-border/30 space-y-2 text-xs"
        >
          {analysis.optimization && (
            <div className="flex gap-2">
              <TrendingUp className="h-3 w-3 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{analysis.optimization}</span>
            </div>
          )}
          {analysis.predictedBehavior && (
            <div className="flex gap-2">
              <Zap className="h-3 w-3 text-blue-400 flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{analysis.predictedBehavior}</span>
            </div>
          )}
          {analysis.costSavingsPotential && (
            <div className="flex gap-2">
              <Sparkles className="h-3 w-3 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-green-300">{analysis.costSavingsPotential}</span>
            </div>
          )}
          {analysis.riskFactors && analysis.riskFactors.length > 0 && (
            <div className="flex gap-2">
              <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-300">{analysis.riskFactors.join(", ")}</span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

const EnergyGenomeMap = () => {
  const storeState = useSyncExternalStore(carbonStore.subscribe, carbonStore.getSnapshot);
  const workloads = storeState.workloads;
  
  const { isLoading, error, isRefetching } = useEnergyGenomeWorkloads();
  const { data: aiInsights, isLoading: aiLoading } = useGeminiEnergyAnalysis(workloads);
  const [showAIInsights, setShowAIInsights] = useState(true);

  useEffect(() => {
    // Emit integration events for system glue
    if (error) {
      SystemIntegration.emitError("EnergyGenomeMap", `Failed to fetch workloads: ${error.message}`);
    } else if (workloads) {
      SystemIntegration.emitUpdate("EnergyGenomeMap", "Workloads loaded successfully", {
        count: workloads.length,
        totalPower: workloads.reduce((sum, w) => sum + w.avgPower, 0),
        aiEnhanced: !!aiInsights,
      });
    }
  }, [workloads, error, aiInsights]);

  // Source displayData directly from stateful store
  const displayData = workloads;
  const isFallback = !import.meta.env.VITE_ENERGY_GENOME_API_URL;

  // Create analysis map for quick lookup
  const analysisMap = new Map(aiInsights?.analyses.map((a) => [a.workloadId, a]) || []);

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-3d-primary">
            <Dna className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground">Energy Genome Map</h2>
            <div className="flex items-center gap-2 mt-1">
              {isRefetching && <span className="text-[10px] text-muted-foreground">Updating...</span>}
              {aiLoading && (
                <span className="text-[10px] text-yellow-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-spin" /> AI analyzing...
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
              <Loader className="h-4 w-4 text-primary" />
            </motion.div>
          )}
          {aiInsights && (
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="text-xs px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" /> {showAIInsights ? "Hide" : "Show"} AI Insights
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && !isFallback && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-gap-2">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">
            <p className="font-medium">Failed to load live data</p>
            <p className="text-xs opacity-80">Using cached fallback data</p>
          </div>
        </div>
      )}

      {/* Fallback indicator */}
      {isFallback && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-gap-2">
          <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm text-warning">
            <p className="text-xs">Showing demo data - API connection unavailable</p>
          </div>
        </div>
      )}

      {/* AI Strategic Insights Section */}
      {showAIInsights && aiInsights && !aiLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <h3 className="font-semibold text-yellow-200">AI Strategic Insights</h3>
          </div>

          {aiInsights.topOptimizationOpportunity && (
            <div className="flex gap-3 bg-black/20 rounded p-2">
              <TrendingUp className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-green-300">Top Opportunity</p>
                <p className="text-xs text-muted-foreground">{aiInsights.topOptimizationOpportunity}</p>
              </div>
            </div>
          )}

          {aiInsights.predictedPeakTime && (
            <div className="flex gap-3 bg-black/20 rounded p-2">
              <Zap className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-300">Predicted Peak Time</p>
                <p className="text-xs text-muted-foreground">{aiInsights.predictedPeakTime}</p>
              </div>
            </div>
          )}

          {aiInsights.overallRecommendation && (
            <div className="flex gap-3 bg-black/20 rounded p-2">
              <Sparkles className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-yellow-300">Recommendation</p>
                <p className="text-xs text-muted-foreground">{aiInsights.overallRecommendation}</p>
              </div>
            </div>
          )}

          {aiInsights.anomaliesDetected && aiInsights.anomaliesDetected.length > 0 && (
            <div className="flex gap-3 bg-red-500/10 rounded p-2 border border-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-300">Anomalies Detected</p>
                <p className="text-xs text-red-200">{aiInsights.anomaliesDetected.join("; ")}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Workloads grid */}
      <div className="space-y-3">
        {displayData && displayData.length > 0 ? (
          displayData.map((wl, i) => (
            <WorkloadCard 
              key={wl.id} 
              workload={wl} 
              index={i}
              analysis={analysisMap.get(wl.id)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No workloads available</p>
          </div>
        )}
      </div>

      {/* Summary stats */}
      {displayData && displayData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <span className="text-muted-foreground">Total Power</span>
            <p className="font-mono text-primary">
              {(displayData.reduce((sum, w) => sum + w.avgPower, 0) / 1000).toFixed(1)} kW
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Active Workloads</span>
            <p className="font-mono text-primary">{displayData.filter((w) => w.status === "running").length}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Efficiency</span>
            <p className="font-mono text-primary">
              {displayData.filter((w) => w.efficiency).length > 0
                ? (
                    displayData
                      .filter((w) => w.efficiency)
                      .reduce((sum, w) => sum + (w.efficiency || 0), 0) /
                    displayData.filter((w) => w.efficiency).length
                  ).toFixed(0)
                : "N/A"}
              %
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">AI Enhanced</span>
            <p className="font-mono text-yellow-400">{aiInsights ? "✓ Active" : "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyGenomeMap;
