import { GenomeWorkload } from "@/types/energy";

// Thermal Regret Engine data
export const thermalRegrets = [
  { rack: "C3", time: "9:14 PM", regret: 214, currency: "RM", reason: "Over-cooled by 4°C during low-load period", optimal: "Reduce fan speed to 60%, save 2.1 kWh" },
  { rack: "A7", time: "10:42 PM", regret: 89, currency: "RM", reason: "Cooling maintained during ambient drop", optimal: "Switch to free cooling mode for 47 minutes" },
  { rack: "B2", time: "11:05 PM", regret: 156, currency: "RM", reason: "Redundant cooling loop active on idle servers", optimal: "Disable secondary loop, redirect to hot aisle" },
  { rack: "D1", time: "1:30 AM", regret: 312, currency: "RM", reason: "Peak cooling applied during off-peak pricing", optimal: "Pre-cool during cheaper window at 11 PM" },
  { rack: "E5", time: "2:18 AM", regret: 67, currency: "RM", reason: "Fan speed mismatch with thermal load", optimal: "Dynamic fan curve adjustment per rack sensor" },
];

// Vampire servers
export const vampireServers = [
  { id: "SRV-0847", rack: "B3", slot: 12, powerDraw: 340, compute: 0.2, dailyCost: 28.4, uptime: "47d 12h" },
  { id: "SRV-1203", rack: "D5", slot: 8, powerDraw: 280, compute: 0.0, dailyCost: 23.3, uptime: "112d 3h" },
  { id: "SRV-0391", rack: "A1", slot: 22, powerDraw: 410, compute: 0.5, dailyCost: 34.2, uptime: "8d 19h" },
  { id: "SRV-0654", rack: "C7", slot: 3, powerDraw: 190, compute: 0.1, dailyCost: 15.8, uptime: "203d 7h" },
];

// Workload forecasts
export const forecasts = [
  { type: "surge", severity: "high", message: "Compute surge forming in Rack B7 in 18 minutes", action: "Pre-cool now — increase fan to 85%", eta: 18 },
  { type: "thermal", severity: "medium", message: "Outdoor ambient will rise +3°C by 5:00 AM", action: "Schedule free cooling window before 4:30 AM", eta: 142 },
  { type: "green", severity: "low", message: "Green energy window opening at 6:15 AM (solar grid)", action: "Queue batch jobs for green window", eta: 255 },
  { type: "surge", severity: "high", message: "Memory pressure building across Cluster 2", action: "Migrate 2 workloads to Cluster 4 standby", eta: 31 },
];

// Energy Genome workloads - used as fallback/demo data
export const genomeWorkloads: GenomeWorkload[] = [
  { id: "WL-Alpha", phases: [0.2, 0.8, 1.0, 0.9, 0.6, 0.3, 0.1], type: "ML Training", avgPower: 4200, match: "WL-Gamma", status: "running", efficiency: 87, costPerHour: 12.6 },
  { id: "WL-Beta", phases: [0.1, 0.3, 0.5, 0.5, 0.4, 0.2, 0.1], type: "Data Pipeline", avgPower: 1800, match: "WL-Delta", status: "running", efficiency: 92, costPerHour: 5.4 },
  { id: "WL-Gamma", phases: [0.1, 0.2, 0.3, 0.9, 1.0, 0.7, 0.2], type: "Batch Render", avgPower: 3900, match: "WL-Alpha", status: "scheduled", efficiency: 79, costPerHour: 11.7 },
  { id: "WL-Delta", phases: [0.1, 0.4, 0.6, 0.5, 0.3, 0.2, 0.1], type: "ETL Job", avgPower: 1650, match: "WL-Beta", status: "running", efficiency: 88, costPerHour: 4.95 },
  { id: "WL-Epsilon", phases: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3], type: "API Server", avgPower: 2200, match: null, status: "running", efficiency: 85, costPerHour: 6.6 },
];

/**
 * Get fallback genome workloads data
 * Used when API is unavailable
 */
export const getFallbackGenomeWorkloads = () => genomeWorkloads;

// Rack map layout (5x6 grid)
export const rackLayout = Array.from({ length: 30 }, (_, i) => ({
  id: `${String.fromCharCode(65 + Math.floor(i / 6))}${(i % 6) + 1}`,
  temp: 22 + Math.random() * 18,
  load: Math.random() * 100,
  power: 800 + Math.random() * 3200,
  hasVampire: ["B3", "D5", "A1", "C7"].includes(`${String.fromCharCode(65 + Math.floor(i / 6))}${(i % 6) + 1}`),
}));
