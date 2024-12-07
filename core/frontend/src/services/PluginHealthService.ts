// core/frontend/src/services/PluginHealthService.ts

export class PluginHealthService {
  async getHealthMetrics(pluginId: string): Promise<{
    status: 'healthy' | 'warning' | 'error';
    metrics: {
      memory: number;
      cpu: number;
      errorRate: number;
      responseTime: number;
    };
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      message: string;
      timestamp: Date;
    }>;
  }> {
    const response = await api.get(`/api/plugins/${pluginId}/health`);
    return response.data;
  }

  async monitorPluginHealth(pluginId: string, callback: (health: any) => void): void {
    // WebSocket connection for real-time health monitoring
    const ws = new WebSocket(`${config.wsUrl}/plugins/${pluginId}/health`);
    ws.onmessage = (event) => callback(JSON.parse(event.data));
  }
}

// core/frontend/src/components/plugins/PluginHealthMonitor.tsx

export const PluginHealthMonitor: React.FC<{ pluginId: string }> = ({ pluginId }) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any[]>([]);

  // Implementation...
};
