/**
 * Energy Genome API Service
 * Handles all API communication for Energy Genome Map data
 */

import { ApiResponse, EnergyGenomeData, GenomeWorkload } from "@/types/energy";

class EnergyGenomeApi {
  private apiUrl: string;
  private apiKey: string;
  private datacenterId: string;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.apiUrl = import.meta.env.VITE_ENERGY_GENOME_API_URL || "http://localhost:3000/api";
    this.apiKey = import.meta.env.VITE_ENERGY_GENOME_API_KEY || "";
    this.datacenterId = import.meta.env.VITE_DATACENTER_ID || "dc-nexus-1";
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  /**
   * Generic fetch with retry logic
   */
  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 0
  ): Promise<T> {
    try {
      const headers = {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        "X-Datacenter-ID": this.datacenterId,
        ...options.headers,
      };

      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt))
        );
        return this.fetchWithRetry(endpoint, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Fetch all energy genome workloads
   */
  async getWorkloads(): Promise<GenomeWorkload[]> {
    try {
      const response = await this.fetchWithRetry<ApiResponse<EnergyGenomeData>>(
        "/energy-genome/workloads"
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch workloads");
      }

      return response.data.workloads;
    } catch (error) {
      console.error("Error fetching workloads:", error);
      throw error;
    }
  }

  /**
   * Fetch a single workload by ID
   */
  async getWorkload(id: string): Promise<GenomeWorkload> {
    try {
      const response = await this.fetchWithRetry<ApiResponse<GenomeWorkload>>(
        `/energy-genome/workloads/${id}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch workload");
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching workload ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch complete energy genome data with aggregates
   */
  async getEnergyGenome(): Promise<EnergyGenomeData> {
    try {
      const response = await this.fetchWithRetry<ApiResponse<EnergyGenomeData>>(
        "/energy-genome"
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch energy genome");
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching energy genome:", error);
      throw error;
    }
  }

  /**
   * Fetch workloads with filter and sorting options
   */
  async getWorkloadsFiltered(options?: {
    type?: string;
    status?: string;
    sortBy?: "power" | "efficiency" | "cost";
    limit?: number;
  }): Promise<GenomeWorkload[]> {
    try {
      const params = new URLSearchParams();
      if (options?.type) params.append("type", options.type);
      if (options?.status) params.append("status", options.status);
      if (options?.sortBy) params.append("sortBy", options.sortBy);
      if (options?.limit) params.append("limit", options.limit.toString());

      const endpoint = `/energy-genome/workloads?${params.toString()}`;
      const response = await this.fetchWithRetry<ApiResponse<EnergyGenomeData>>(endpoint);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch filtered workloads");
      }

      return response.data.workloads;
    } catch (error) {
      console.error("Error fetching filtered workloads:", error);
      throw error;
    }
  }

  /**
   * Match workloads with similar energy profiles
   */
  async matchWorkloads(workloadId: string): Promise<GenomeWorkload[]> {
    try {
      const response = await this.fetchWithRetry<ApiResponse<{ matches: GenomeWorkload[] }>>(
        `/energy-genome/workloads/${workloadId}/matches`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to find matches");
      }

      return response.data.matches;
    } catch (error) {
      console.error(`Error matching workloads for ${workloadId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const energyGenomeApi = new EnergyGenomeApi();
