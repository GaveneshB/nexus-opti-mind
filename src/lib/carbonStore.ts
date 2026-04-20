import { genomeWorkloads as initialWorkloads } from "./mockData";
import { integrateWithCarbonClock } from "./componentIntegration";
import { GenomeWorkload } from "@/types/energy";

const STORAGE_KEY = "nexus_optimind_state";

interface StoreState {
  debt: number;
  gridMix: { renewable: number; carbon: number };
  workloads: GenomeWorkload[];
  totalSaved: number; // Track cumulative CO2 savings
}

const saveState = (state: StoreState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state to localStorage:", e);
  }
};

const loadState = (): StoreState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
    return null;
  }
};

// Global state initialization with persistence
const savedState = loadState();

let currentDebt = savedState?.debt ?? 847.32;
let currentGridMix = savedState?.gridMix ?? { renewable: 0.35, carbon: 0.65 };
let managedWorkloads: GenomeWorkload[] = savedState?.workloads ?? [...initialWorkloads];
let totalSaved = savedState?.totalSaved ?? 0;

// Active listeners for React components
const listeners = new Set<() => void>();

const emitChange = () => {
  for (const listener of listeners) {
    listener();
  }
};

// Physics engine constants
const BASE_LOAD_WATT = 1000000; // Simulated Global Hub (1MW)
const SPAWN_INTERVAL_MS = 30 * 1000; // 30 seconds

// Physics engine setup
const calculateTickRate = () => {
    // Filter out migrated workloads — they no longer contribute to carbon debt
    const activeWorkloads = managedWorkloads.filter(w => w.status !== "migrated");
    const integration = integrateWithCarbonClock(activeWorkloads, currentGridMix);
    
    // Add significant base load impact
    const baseLoadCO2 = (BASE_LOAD_WATT / 1000) * currentGridMix.carbon * 0.5;
    const workloadsCO2 = integration.energyMetrics.hourlyEstimate.co2Generated;
    
    const totalHourlyCO2 = workloadsCO2 + baseLoadCO2;
    return totalHourlyCO2 / 60; // kg per minute
};

// Start the global tick
const tickRateParams = { kgPerMin: calculateTickRate() };

// Global Store Hook export
let cachedSnapshot = {
  debt: currentDebt,
  ratePerMin: tickRateParams.kgPerMin,
  gridMix: currentGridMix,
  workloads: managedWorkloads,
  totalSaved: totalSaved
};

const updateSnapshot = () => {
  cachedSnapshot = {
    debt: currentDebt,
    ratePerMin: tickRateParams.kgPerMin,
    gridMix: currentGridMix,
    workloads: managedWorkloads,
    totalSaved: totalSaved
  };
  
  // Persist to storage whenever snapshot updates
  saveState({
    debt: currentDebt,
    gridMix: currentGridMix,
    workloads: managedWorkloads,
    totalSaved: totalSaved
  });
};

/**
 * Generates a new random workload to keep the optimization cycle alive
 */
const spawnRandomWorkload = () => {
    const types = ["ML Inference", "Log Analysis", "Crypto-Hash", "Web Crawler", "Batch Sync"];
    const id = `WL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newWorkload: GenomeWorkload = {
        id,
        phases: Array.from({ length: 7 }, () => Math.random()),
        type: types[Math.floor(Math.random() * types.length)],
        avgPower: 800 + Math.random() * 3000,
        match: null,
        status: "running",
        efficiency: 60 + Math.random() * 25,
        costPerHour: 2 + Math.random() * 8
    };

    managedWorkloads = [...managedWorkloads, newWorkload];
    tickRateParams.kgPerMin = calculateTickRate();
    updateSnapshot();
    emitChange();
    console.log(`📡 New Workload Influx: ${id} detected. Optimization required.`);
};

// The global interval that ticks the engine at high frequency (100ms) to simulate a live sensor
setInterval(() => {
    // 100ms is 1/600 of a minute. 
    // We add a tiny bit of random "jitter" (±2%) to make it look like a real fluctuating sensor
    const baseTick = (tickRateParams.kgPerMin / 600);
    const jitter = baseTick * (Math.random() * 0.04 - 0.02); // ±2% jitter
    
    currentDebt += (baseTick + jitter);
    updateSnapshot();
    emitChange();
}, 100);

// Interval for spawning new workloads every 5 minutes
setInterval(() => {
    spawnRandomWorkload();
}, SPAWN_INTERVAL_MS);

export const carbonStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return cachedSnapshot;
  },
  // Get live workloads from the store
  getWorkloads() {
    return managedWorkloads;
  },
  // Apply a credit (optimization payment) to the debt
  applySavings(kgSavings: number) {
      currentDebt = Math.max(0, currentDebt - kgSavings);
      totalSaved += kgSavings;
      updateSnapshot();
      emitChange();
  },
  // Migrate a workload to a greener grid
  migrateWorkload(id: string, targetGrid: string, savings: number) {
      const workloadIndex = managedWorkloads.findIndex(w => w.id === id);
      if (workloadIndex !== -1 && managedWorkloads[workloadIndex].status !== "migrated") {
          // IMMUTABLE UPDATE: Create a new array and a new object for the updated workload
          const updatedWorkload: GenomeWorkload = { 
              ...managedWorkloads[workloadIndex],
              status: "migrated",
              match: targetGrid,
              avgPower: managedWorkloads[workloadIndex].avgPower * 0.4
          };
          
          managedWorkloads = [
              ...managedWorkloads.slice(0, workloadIndex),
              updatedWorkload,
              ...managedWorkloads.slice(workloadIndex + 1)
          ];
          
          // Apply the debt savings — this directly subtracts from currentDebt
          this.applySavings(savings);
          
          // Re-calculate the global tick rate with the migrated workload excluded
          tickRateParams.kgPerMin = calculateTickRate();
          
          updateSnapshot();
          emitChange();
          console.log(`✓ Workload ${id} migrated to ${targetGrid} | Debt reduced by ${savings} kg | New rate: ${tickRateParams.kgPerMin.toFixed(4)} kg/min`);
      } else {
          console.warn(`⚠ Workload ${id} already migrated or not found`);
      }
  },
  // Upgrade the active grid, slowing down future debt mathematically
  improveGridMix(newRenewablePercent: number) {
      currentGridMix = { renewable: Math.min(1, newRenewablePercent), carbon: Math.max(0, 1 - newRenewablePercent) };
      tickRateParams.kgPerMin = calculateTickRate();
      updateSnapshot();
      emitChange();
  },
  // Reset the store for testing/demo
  reset() {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
  }
};
