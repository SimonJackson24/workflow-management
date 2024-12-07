// core/frontend/src/hooks/useDashboardData.ts

import { useQuery } from 'react-query';
import { api } from '../utils/api';

export interface DashboardData {
  metrics: {
    activeUsers: number;
    storageUsed: number;
    apiCalls: number;
    revenue: number;
  };
  usage: {
    timestamp: string;
    users: number;
    storage: number;
    apiCalls: number;
  }[];
  activities: Activity[];
  quickActions: QuickAction[];
  recentPlugins: Plugin[];
}

export const useDashboardData = () => {
  return useQuery<DashboardData>('dashboardData', async () => {
    const response = await api.get('/api/dashboard');
    return response.data;
  }, {
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};
