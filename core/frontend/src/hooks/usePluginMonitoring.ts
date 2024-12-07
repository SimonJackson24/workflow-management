// core/frontend/src/hooks/usePluginMonitoring.ts

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQuery } from 'react-query';
import { api } from '../utils/api';

export const usePluginMonitoring = (pluginId: string) => {
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const socketRef = useRef<Socket | null>(null);

  // Fetch historical data
  const { data, isLoading, error, refetch } = useQuery(
    ['pluginMetrics', pluginId, timeRange],
    async () => {
      const response = await api.get(`/api/plugins/${pluginId}/metrics`, {
        params: { timeRange }
      });
      return response.data;
    },
    {
      enabled: !socketRef.current,
      refetchInterval: 60000 // Refetch every minute when not in real-time mode
    }
  );

  const startRealTimeMonitoring = () => {
    socketRef.current = io(`${process.env.REACT_APP_WS_URL}/monitoring`, {
      query: { pluginId }
    });

    socketRef.current.on('metrics', (newMetrics) => {
      setRealTimeData((prev) => {
        const updated = [...prev, newMetrics];
        if (updated.length > 100) { // Keep last 100 points
          updated.shift();
        }
        return updated;
      });
    });

    socketRef.current.on('alert', (alert) => {
      // Handle real-time alerts
    });

    socketRef.current.on('log', (log) => {
      // Handle real-time logs
    });
  };

  const stopRealTimeMonitoring = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setRealTimeData([]);
    }
  };

  useEffect(() => {
    return () => {
      stopRealTimeMonitoring();
    };
  }, []);

  return {
    metrics: data?.metrics || {},
    logs: data?.logs || [],
    alerts: data?.alerts || [],
    health: data?.health || {},
    realTimeData,
    loading: isLoading,
    error,
    timeRange,
    setTimeRange,
    startRealTimeMonitoring,
    stopRealTimeMonitoring
  };
};
