// core/frontend/src/services/dashboardService.ts

import { api } from '../utils/api';
import {
  MetricData,
  Activity,
  Plugin,
  UsageDataPoint
} from '../types/dashboard.types';

class DashboardService {
  async getMetrics(): Promise<MetricData[]> {
    try {
      const response = await api.get('/api/dashboard/metrics');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch metrics');
    }
  }

  async getActivities(): Promise<Activity[]> {
    try {
      const response = await api.get('/api/dashboard/activities');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch activities');
    }
  }

  async getPlugins(): Promise<Plugin[]> {
    try {
      const response = await api.get('/api/dashboard/plugins');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch plugins');
    }
  }

  async getUsage(timeRange: string): Promise<UsageDataPoint[]> {
    try {
      const response = await api.get(`/api/dashboard/usage?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch usage data');
    }
  }

  async refreshAll(timeRange: string = '7d') {
    try {
      const [metrics, activities, plugins, usage] = await Promise.all([
        this.getMetrics(),
        this.getActivities(),
        this.getPlugins(),
        this.getUsage(timeRange)
      ]);

      return {
        metrics,
        activities,
        plugins,
        usage
      };
    } catch (error) {
      throw new Error('Failed to refresh dashboard data');
    }
  }
}

export const dashboardService = new DashboardService();
