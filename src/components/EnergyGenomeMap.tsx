import { useEffect } from "react";
import { motion } from "framer-motion";
import { Dna, Link2, AlertCircle, Loader } from "lucide-react";
import { useEnergyGenomeWorkloads } from "@/hooks/useEnergyGenome";
import { getFallbackGenomeWorkloads } from "@/lib/mockData";
import { SystemIntegration } from "@/lib/systemIntegration";
import { GenomeWorkload } from "@/types/energy";

const phaseLabels = ["Spin-up", "Ramp", "Peak", "Sustain", "Cool", "Idle", "Teardown"];

const WorkloadCard = ({ workload, index }: { workload: GenomeWorkload; index: number }) => {
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
                    : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {workload.status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="font-mono text-xs text-muted-foreground">{workload.avgPower}W</span>
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
    </motion.div>
  );
};

const EnergyGenomeMap = () => {
  const { data: workloads, isLoading, error, isRefetching } = useEnergyGenomeWorkloads();

  useEffect(() => {
    // Emit integration events for system glue
    if (error) {
      SystemIntegration.emitError("EnergyGenomeMap", `Failed to fetch workloads: ${error.message}`);
    } else if (workloads) {
      SystemIntegration.emitUpdate("EnergyGenomeMap", "Workloads loaded successfully", {
        count: workloads.length,
        totalPower: workloads.reduce((sum, w) => sum + w.avgPower, 0),
      });
    }
  }, [workloads, error]);

  // Use fallback data if API fails
  const displayData = workloads || getFallbackGenomeWorkloads();
  const isFallback = !workloads && !isLoading;

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-3d-primary">
            <Dna className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground">Energy Genome Map</h2>
            {isRefetching && <span className="text-[10px] text-muted-foreground">Updating...</span>}
          </div>
        </div>
        {isLoading && (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
            <Loader className="h-4 w-4 text-primary" />
          </motion.div>
        )}
      </div>

      {/* Error state */}
      {error && !isFallback && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-gap-2">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">
            <p className="font-medium">Failed to load live data</p>
            <p className="text-xs opacity-80">Using cached fallback data</p>
          </div>
        </div>
      )}

      {/* Fallback indicator */}
      {isFallback && (
        <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-gap-2">
          <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm text-warning">
            <p className="text-xs">Showing demo data - API connection unavailable</p>
          </div>
        </div>
      )}

      {/* Workloads grid */}
      <div className="space-y-3">
        {displayData && displayData.length > 0 ? (
          displayData.map((wl, i) => <WorkloadCard key={wl.id} workload={wl} index={i} />)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No workloads available</p>
          </div>
        )}
      </div>

      {/* Summary stats */}
      {displayData && displayData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-2 text-center text-xs">
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
        </div>
      )}
    </div>
  );
};

export default EnergyGenomeMap;
