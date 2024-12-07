// core/frontend/src/services/dashboardService.ts

import { api } from '../utils/api';
import { 
  MetricData, 
  Activity, 
  Plugin, 
  UsageDataPoint 
} from '../types/dashboard.types';

export const dashboardService = {
  async getMetrics(): Promise<MetricData[]> {
    const response = await api.get('/api/dashboard/metrics');
    return response.data;
  },

  async getActivities(): Promise<Activity[]> {
    const response = await api.get('/api/dashboard/activities');
    return response.data;
  },

  async getPlugins(): Promise<Plugin[]> {
    const response = await api.get('/api/dashboard/plugins');
    return response.data;
  },

  async getUsage(timeRange: string): Promise<UsageDataPoint[]> {
    const response = await api.get(`/api/dashboard/usage?timeRange=${timeRange}`);
    return response.data;
  },

  async refreshDashboard() {
    const [metrics, activities, plugins, usage] = await Promise.all([
      this.getMetrics(),
      this.getActivities(),
      this.getPlugins(),
      this.getUsage('7d')
    ]);

    return { metrics, activities, plugins, usage };
  }
};
