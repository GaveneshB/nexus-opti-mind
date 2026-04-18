import { genomeWorkloads } from "./mockData";
import { integrateWithCarbonClock } from "./componentIntegration";

// Global immutable state to prevent resets during React unmounts
let currentDebt = 847.32;
let currentGridMix = { renewable: 0.35, carbon: 0.65 };

// Active listeners for React components
const listeners = new Set<() => void>();

const emitChange = () => {
  for (const listener of listeners) {
    listener();
  }
};

// Physics engine setup
const calculateTickRate = () => {
    // Uses integration utils to extract true kgCO2/min based on active genome workloads.
    const integration = integrateWithCarbonClock(genomeWorkloads, currentGridMix);
    const hourlyCO2 = integration.energyMetrics.hourlyEstimate.co2Generated;
    return hourlyCO2 / 60; // kg per minute
};

// Start the global tick
let tickRateParams = { kgPerMin: calculateTickRate() };

// Global Store Hook export
let cachedSnapshot = {
  debt: currentDebt,
  ratePerMin: tickRateParams.kgPerMin,
  gridMix: currentGridMix
};

const updateSnapshot = () => {
  cachedSnapshot = {
    debt: currentDebt,
    ratePerMin: tickRateParams.kgPerMin,
    gridMix: currentGridMix
  };
};

// The global interval that ticks the engine every second even when the page is closed
setInterval(() => {
    // Instead of random math, exactly apply the fraction of a minute that passed (1 second = 1/60th of the per minute rate)
    const tickAmount = tickRateParams.kgPerMin / 60;
    currentDebt += tickAmount;
    updateSnapshot();
    emitChange();
}, 1000);

export const carbonStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return cachedSnapshot;
  },
  // Apply a credit (optimization payment) to the debt
  applySavings(kgSavings: number) {
      currentDebt = Math.max(0, currentDebt - kgSavings); // Prevent dropping below zero abruptly
      updateSnapshot();
      emitChange();
  },
  // Upgrade the active grid, slowing down future debt mathematically
  improveGridMix(newRenewablePercent: number) {
      currentGridMix = { renewable: newRenewablePercent, carbon: 1 - newRenewablePercent };
      tickRateParams.kgPerMin = calculateTickRate();
      updateSnapshot();
      emitChange();
  }
};
