import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { DashboardData } from '@/types/dashboard';
import { ApiResponse } from '@/types/api';

export const dashboardApi = {
  /**
   * GET /api/v1/dashboard
   * Fetch main dashboard overview, upcoming sessions, and pending fees.
   */
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardData> | DashboardData>(
      ENDPOINTS.dashboard.overview
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as DashboardData;
  },
};
