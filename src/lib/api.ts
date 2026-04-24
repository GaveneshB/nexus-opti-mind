import { thermalRegrets, forecasts } from './mockData';

// API base URL - change this to your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Types
export interface ThermalRegret {
  rack: string;
  time: string;
  regret: number;
  currency: string;
  reason: string;
  optimal: string;
}

export interface Forecast {
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  action: string;
  eta: number;
}

// API functions
export const api = {
  // Fetch thermal regrets
  async getThermalRegrets(): Promise<ThermalRegret[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/thermal-regrets`);
      if (!response.ok) {
        throw new Error('Failed to fetch thermal regrets');
      }
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data
      return thermalRegrets;
    }
  },

  // Fetch workload forecasts
  async getWorkloadForecasts(): Promise<Forecast[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/workload-forecasts`);
      if (!response.ok) {
        throw new Error('Failed to fetch workload forecasts');
      }
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data
      return forecasts;
    }
  },

  // Combined endpoint for both (if backend supports it)
  async getDashboardData() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data
      return {
        thermalRegrets,
        forecasts,
      };
    }
  },
};