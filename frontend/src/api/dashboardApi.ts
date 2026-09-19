import { apiClient } from './client';
import { DashboardMetrics } from '../types/dashboard';

export const dashboardApi = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const { data } = await apiClient.get<DashboardMetrics>('/dashboard');
    return data;
  },
};
