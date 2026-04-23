/**
 * Configuration utilities for Energy Genome API
 * Handles environment setup and validation
 */

interface ConfigOptions {
  apiUrl?: string;
  apiKey?: string;
  datacenterId?: string;
  enableMockData?: boolean;
}

class EnergyGenomeConfig {
  private static instance: EnergyGenomeConfig;
  private config: Required<ConfigOptions>;

  private constructor() {
    this.config = {
      apiUrl: import.meta.env.VITE_ENERGY_GENOME_API_URL || "http://localhost:3000/api",
      apiKey: import.meta.env.VITE_ENERGY_GENOME_API_KEY || "",
      datacenterId: import.meta.env.VITE_DATACENTER_ID || "dc-nexus-1",
      enableMockData: import.meta.env.MODE === "development",
    };
  }

  static getInstance(): EnergyGenomeConfig {
    if (!EnergyGenomeConfig.instance) {
      EnergyGenomeConfig.instance = new EnergyGenomeConfig();
    }
    return EnergyGenomeConfig.instance;
  }

  getConfig(overrides?: Partial<ConfigOptions>) {
    return { ...this.config, ...overrides };
  }

  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.apiUrl);
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.config.apiKey) {
      errors.push("VITE_ENERGY_GENOME_API_KEY not set");
    }

    if (!this.config.apiUrl) {
      errors.push("VITE_ENERGY_GENOME_API_URL not set");
    }

    if (!this.config.datacenterId) {
      errors.push("VITE_DATACENTER_ID not set");
    }

    return errors;
  }

  enableDevMode(enable: boolean) {
    this.config.enableMockData = enable;
  }
}

export const energyGenomeConfig = EnergyGenomeConfig.getInstance();

/**
 * Initialize energy genome system
 * Call once at app startup
 */
export const initializeEnergyGenome = () => {
  const errors = energyGenomeConfig.getValidationErrors();

  if (errors.length > 0 && import.meta.env.MODE === "production") {
    console.error("Energy Genome Configuration Errors:", errors);
  } else if (errors.length > 0) {
    console.warn("Energy Genome Configuration Warnings:", errors);
    console.info("Using mock/fallback data");
  }

  return {
    configured: energyGenomeConfig.isConfigured(),
    errors,
  };
};
