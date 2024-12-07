// core/frontend/src/services/PluginAnalyticsService.ts

export class PluginAnalyticsService {
  async getDetailedAnalytics(pluginId: string, timeRange: string): Promise<{
    usage: {
      apiCalls: number;
      uniqueUsers: number;
      peakUsage: number;
      averageUsage: number;
    };
    performance: {
      responseTime: number[];
      errorRate: number[];
      resourceUsage: {
        cpu: number[];
        memory: number[];
      };
    };
    users: {
      active: number;
      new: number;
      returning: number;
    };
  }> {
    const response = await api.get(`/api/plugins/${pluginId}/analytics`, {
      params: { timeRange }
    });
    return response.data;
  }
}
