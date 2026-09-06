import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard.api';
import { DashboardData } from '@/types/dashboard';

export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  overview: ['dashboard', 'overview'] as const,
};

export function useDashboard(enabled = true) {
  return useQuery<DashboardData, Error>({
    queryKey: DASHBOARD_QUERY_KEYS.overview,
    queryFn: async () => {
      return await dashboardApi.getDashboard();
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

export default useDashboard;
