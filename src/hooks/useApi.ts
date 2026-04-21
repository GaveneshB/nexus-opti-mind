import { useQuery } from '@tanstack/react-query';
import { api, type ThermalRegret, type Forecast } from '@/lib/api';

// Query keys
export const queryKeys = {
  thermalRegrets: ['thermal-regrets'] as const,
  workloadForecasts: ['workload-forecasts'] as const,
  dashboard: ['dashboard'] as const,
};

// Hooks
export const useThermalRegrets = () => {
  return useQuery({
    queryKey: queryKeys.thermalRegrets,
    queryFn: api.getThermalRegrets,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useWorkloadForecasts = () => {
  return useQuery({
    queryKey: queryKeys.workloadForecasts,
    queryFn: api.getWorkloadForecasts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: api.getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};
