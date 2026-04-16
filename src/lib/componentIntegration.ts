/**
 * Dashboard component integration utilities
 * Bridges Energy Genome Map with other dashboard components
 */

import { GenomeWorkload } from "@/types/energy";

/**
 * Integration data between Energy Genome and Vampire Detector
 */
export const integrateWithVampireDetector = (
  workloads: GenomeWorkload[],
  vampireServers: Record<string, unknown>[]
) => {
  // Filter vampire servers that match high-efficiency workloads
  return {
    workloads,
    relatedVampires: vampireServers.filter((v) => {
      // Vampires consuming more than average workload power
      const avgWorkloadPower =
        workloads.reduce((sum, w) => sum + w.avgPower, 0) / workloads.length;
      return (v.powerDraw as number) > avgWorkloadPower * 1.5;
    }),
    optimization: {
      canMigrateFromVampires: vampireServers.length > 0,
      potentialPowerSavings: vampireServers.reduce((sum, v) => sum + ((v.powerDraw as number) * 0.3), 0),
    },
  };
};

/**
 * Integration data between Energy Genome and Thermal Regret Engine
 */
export const integrateWithThermalEngine = (
  workloads: GenomeWorkload[],
  thermalRegrets: Record<string, unknown>[]
) => {
  // Map workloads to thermal events
  return {
    workloads,
    thermalEvents: thermalRegrets.map((regret) => ({
      ...regret,
      affectedWorkloads: workloads.filter(
        (w) => w.status === "running" && w.avgPower > 2000
      ),
    })),
  };
};

/**
 * Integration data between Energy Genome and Workload Forecast
 */
export const integrateWithForecast = (
  workloads: GenomeWorkload[],
  forecasts: Record<string, unknown>[]
) => {
  return {
    workloads,
    forecasts: forecasts.map((f) => ({
      ...f,
      impactedWorkloads: workloads.filter((w) => {
        // High-power workloads are more impacted by thermal/resource forecasts
        return w.status === "running" || w.status === "scheduled";
      }),
      energyImpact: {
        surge:
          workloads.filter((w) => w.status === "running").reduce((sum, w) => sum + w.avgPower, 0) * 0.1,
      },
    })),
  };
};

/**
 * Integration data between Energy Genome and Carbon Debt Clock
 */
export const integrateWithCarbonClock = (
  workloads: GenomeWorkload[],
  gridMix?: { renewable: number; carbon: number }
) => {
  const totalPower = workloads.reduce((sum, w) => sum + w.avgPower, 0);
  const defaultGridMix = { renewable: 0.35, carbon: 0.65 }; // Default: 35% renewable
  const mix = gridMix || defaultGridMix;

  return {
    workloads,
    energyMetrics: {
      totalPowerUsage: totalPower,
      instantaneousCO2: totalPower * mix.carbon * 0.0005, // kg CO2/W-hour
      instantaneousRenewable: totalPower * mix.renewable,
      hourlyEstimate: {
        totalKWh: totalPower / 1000,
        co2Generated: (totalPower / 1000) * mix.carbon * 0.5, // kg CO2 per hour
        renewablePercentage: mix.renewable * 100,
      },
    },
  };
};

/**
 * Generate comprehensive cross-component metrics
 */
export const generateCrossComponentMetrics = (
  workloads: GenomeWorkload[],
  vampireServers?: Record<string, unknown>[],
  thermal?: Record<string, unknown>[],
  forecasts?: Record<string, unknown>[]
) => {
  const totalPower = workloads.reduce((sum, w) => sum + w.avgPower, 0);
  const runningWorkloads = workloads.filter((w) => w.status === "running");
  const avgEfficiency =
    workloads.filter((w) => w.efficiency).length > 0
      ? workloads
          .filter((w) => w.efficiency)
          .reduce((sum, w) => sum + (w.efficiency || 0), 0) / workloads.filter((w) => w.efficiency).length
      : 0;

  return {
    summary: {
      totalWorkloads: workloads.length,
      runningWorkloads: runningWorkloads.length,
      totalPowerConsumption: totalPower,
      averageEfficiency: avgEfficiency,
      costPerHour: workloads.reduce((sum, w) => sum + (w.costPerHour || 0), 0),
    },
    workloadBreakdown: {
      byType: [...new Set(workloads.map((w) => w.type))].map((type) => ({
        type,
        count: workloads.filter((w) => w.type === type).length,
        totalPower: workloads
          .filter((w) => w.type === type)
          .reduce((sum, w) => sum + w.avgPower, 0),
      })),
      byStatus: [
        {
          status: "running",
          count: workloads.filter((w) => w.status === "running").length,
        },
        {
          status: "scheduled",
          count: workloads.filter((w) => w.status === "scheduled").length,
        },
        {
          status: "completed",
          count: workloads.filter((w) => w.status === "completed").length,
        },
      ],
    },
    relatedMetrics: {
      vampireImpact: vampireServers
        ? {
            vampireCount: vampireServers.length,
            wastedPower: vampireServers.reduce((sum, v) => sum + ((v.powerDraw as number) || 0), 0),
            potentialSavings: vampireServers.reduce((sum, v) => sum + (((v.powerDraw as number) * 0.7) || 0), 0),
          }
        : null,
      thermalImpact: thermal
        ? {
            thermalEvents: thermal.length,
            averageRegret: thermal.reduce((sum, t) => sum + ((t.regret as number) || 0), 0) / thermal.length,
          }
        : null,
      forecastImpact: forecasts
        ? {
            totalForecasts: forecasts.length,
            criticalForecasts: forecasts.filter((f) => f.severity === "high").length,
          }
        : null,
    },
  };
};

/**
 * Detect optimization opportunities across components
 */
export const detectOptimizationOpportunities = (
  workloads: GenomeWorkload[],
  vampireServers?: Record<string, unknown>[],
  thermal?: Record<string, unknown>[]
) => {
  const opportunities = [];

  // 1. Low efficiency workloads
  const lowEfficiencyWorkloads = workloads.filter((w) => w.efficiency && w.efficiency < 70);
  if (lowEfficiencyWorkloads.length > 0) {
    opportunities.push({
      id: "optimize-efficiency",
      title: "Optimize Low-Efficiency Workloads",
      description: `${lowEfficiencyWorkloads.length} workload(s) running below 70% efficiency`,
      impact: lowEfficiencyWorkloads.reduce((sum, w) => sum + w.avgPower * 0.2, 0),
      priority: "high",
      component: "EnergyGenomeMap",
    });
  }

  // 2. Vampire server correlation
  if (vampireServers && vampireServers.length > 0) {
    const vampireWaste = vampireServers.reduce((sum, v) => sum + (((v.powerDraw as number) * 0.7) || 0), 0);
    opportunities.push({
      id: "migrate-from-vampires",
      title: "Migrate Workloads from Vampire Servers",
      description: `${vampireServers.length} vampire server(s) consuming unnecessary power`,
      impact: vampireWaste,
      priority: "high",
      component: "VampireDetector",
    });
  }

  // 3. Thermal optimization during workload phases
  if (thermal && thermal.length > 0) {
    const thermalOptimization = thermal.reduce((sum, t) => sum + (((t.regret as number) * 0.5) || 0), 0);
    opportunities.push({
      id: "thermal-timing",
      title: "Optimize Thermal Management During Workload Phases",
      description: `Align cooling with workload phases to reduce thermal regrets`,
      impact: thermalOptimization,
      priority: "medium",
      component: "ThermalRegretEngine",
    });
  }

  // 4. Workload consolidation for matched workloads
  const matchedWorkloads = workloads.filter((w) => w.match);
  if (matchedWorkloads.length > 1) {
    opportunities.push({
      id: "consolidate-twins",
      title: "Consolidate Matched Workloads",
      description: `${matchedWorkloads.length} workload(s) with similar energy profiles could be consolidated`,
      impact: matchedWorkloads.reduce((sum, w) => sum + w.avgPower * 0.1, 0),
      priority: "medium",
      component: "EnergyGenomeMap",
    });
  }

  return opportunities;
};
