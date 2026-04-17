import { Timestamp } from "firebase/firestore";

/**
 * Rack infrastructure and real-time metrics
 */
export interface Rack {
  id: string;
  location: string;
  temperature: number;
  loadPercentage: number;
  powerConsumption: number;
  hasVampireServer: boolean;
  lastUpdated: Timestamp;
  avgPowerLast1h: number;
}

/**
 * Server metrics recorded at a point in time
 */
export interface RackMetric {
  id: string;
  rackId: string;
  timestamp: Timestamp;
  recordedAt: Date;
  temperature: number;
  powerDraw: number;
  cpuLoad: number;
  memoryUtilization: number;
}

/**
 * Detected vampire servers (idle but power-hungry)
 */
export interface VampireServer {
  id: string;
  serverId: string;
  rack: string;
  slot: number;
  powerDraw: number;
  computeUtilization: number;
  dailyCost: number;
  uptime: string;
  flagged: boolean;
  detectedAt: Timestamp;
  resolvedAt: Timestamp | null;
  powerPerComputeUnit: number;
  idleScore: number;
  isDuplicate: boolean;
  severity: "low" | "medium" | "high" | "critical";
  recommendation: string;
}

/**
 * Thermal regret (wasted cooling energy cost)
 */
export interface ThermalRegret {
  id: string;
  rack: string;
  timestamp: Timestamp;
  regretAmount: number;
  currency: string;
  reason: string;
  optimalAction: string;
  estimatedSavings: number;
}

/**
 * Workload forecast (predicted energy events)
 */
export interface WorkloadForecast {
  id: string;
  forecastId: string;
  timestamp: Timestamp;
  forecastType: "surge" | "thermal" | "green" | "maintenance";
  severity: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
  eta: number; // minutes
  affectedRacks: string[];
}

/**
 * Energy workload genome (pattern data)
 */
export interface EnergyWorkload {
  id: string;
  workloadId: string;
  workloadType: string;
  powerPhases: number[];
  averagePower: number;
  relatedWorkloadId: string | null;
  createdAt: Timestamp;
  metadata: Record<string, any>;
}

/**
 * Overall energy metrics and KPIs
 */
export interface EnergyMetric {
  id: string;
  timestamp: Timestamp;
  totalPowerConsumption: number;
  averageCoolingCost: number;
  carbonEmissions: number;
  efficiencyScore: number;
  topAlert: string;
  period: "hourly" | "daily" | "weekly";
}

/**
 * Organization settings
 */
export interface Organization {
  id: string;
  orgName: string;
  timezone: string;
  currency: string;
  datacenters: string[];
  apiKeys: string[];
  alertThresholds: {
    temperatureMax: number;
    powerDrawMax: number;
    idleScoreThreshold: number;
    costThreshold: number;
  };
}
