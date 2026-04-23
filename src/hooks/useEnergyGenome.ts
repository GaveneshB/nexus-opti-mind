/**
 * Custom Hooks for Energy Genome Data
 * React Query integration for data fetching and caching
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { energyGenomeApi } from "@/lib/api/energyGenome";
import { EnergyGenomeData, GenomeWorkload } from "@/types/energy";
import { carbonStore } from "@/lib/carbonStore";

/**
 * Hook to fetch all workloads
 */
export const useEnergyGenomeWorkloads = (): UseQueryResult<GenomeWorkload[], Error> => {
  // Use mock data directly if API not configured
  const apiUrl = import.meta.env.VITE_ENERGY_GENOME_API_URL;
  
  return useQuery({
    queryKey: ["energy-genome", "workloads"],
    queryFn: async (): Promise<GenomeWorkload[]> => {
      // If API URL is empty, return store-managed mock data
      if (!apiUrl) {
        return carbonStore.getWorkloads();
      }
      return energyGenomeApi.getWorkloads();
    },
    staleTime: 5000, // Reduced for local interactivity
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Hook to fetch complete energy genome data
 */
export const useEnergyGenome = (): UseQueryResult<EnergyGenomeData, Error> => {
  const apiUrl = import.meta.env.VITE_ENERGY_GENOME_API_URL;

  return useQuery({
    queryKey: ["energy-genome"],
    queryFn: async (): Promise<EnergyGenomeData> => {
      // If API URL is empty, return store-managed mock data
      if (!apiUrl) {
        const workloads = carbonStore.getWorkloads();
        return {
          workloads,
          timestamp: new Date().toISOString(),
          datacenterId: import.meta.env.VITE_DATACENTER_ID || "dc-nexus-1",
          totalPower: workloads.reduce((sum, w) => sum + w.avgPower, 0),
          averageEfficiency: 87,
        };
      }
      return energyGenomeApi.getEnergyGenome();
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch a single workload
 */
export const useEnergyGenomeWorkload = (
  id: string
): UseQueryResult<GenomeWorkload, Error> => {
  return useQuery({
    queryKey: ["energy-genome", "workload", id],
    queryFn: () => energyGenomeApi.getWorkload(id),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!id,
  });
};

/**
 * Hook to fetch filtered workloads
 */
export const useEnergyGenomeWorkloadsFiltered = (options?: {
  type?: string;
  status?: string;
  sortBy?: "power" | "efficiency" | "cost";
  limit?: number;
}): UseQueryResult<GenomeWorkload[], Error> => {
  return useQuery({
    queryKey: ["energy-genome", "workloads", "filtered", options],
    queryFn: () => energyGenomeApi.getWorkloadsFiltered(options),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!options,
  });
};

/**
 * Hook to find matching workloads
 */
export const useEnergyGenomeMatches = (
  workloadId: string
): UseQueryResult<GenomeWorkload[], Error> => {
  return useQuery({
    queryKey: ["energy-genome", "matches", workloadId],
    queryFn: () => energyGenomeApi.matchWorkloads(workloadId),
    staleTime: 60000, // 1 minute
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!workloadId,
  });
};
