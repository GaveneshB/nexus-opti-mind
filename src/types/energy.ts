/**
 * Energy Genome Map Types
 * Core data structures for workload energy profiles and phases
 */

export interface EnergyPhase {
  intensity: number; // 0-1 normalized intensity
  duration?: number; // in seconds
  label?: string;
}

export interface GenomeWorkload {
  id: string;
  type: string;
  phases: number[]; // Array of phase intensities
  avgPower: number; // Average power in watts
  peakPower?: number;
  match?: string | null; // Twin workload ID
  startTime?: string;
  endTime?: string;
  status?: "running" | "scheduled" | "completed" | "idle" | "migrated";
  efficiency?: number; // 0-100 representing efficiency percentage
  costPerHour?: number;
}

export interface EnergyGenomeData {
  workloads: GenomeWorkload[];
  timestamp: string;
  datacenterId: string;
  totalPower: number;
  averageEfficiency: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

/**
 * System Integration Types
 */

export interface SystemConfig {
  apiUrl: string;
  apiKey: string;
  datacenterId: string;
  retryAttempts: number;
  retryDelay: number;
  cacheEnabled: boolean;
  cacheDuration: number;
}

export interface DataIntegrationEvent {
  component: string;
  type: "update" | "error" | "warning" | "info";
  message: string;
  timestamp: string;
  data?: Record<string, any>;
}
