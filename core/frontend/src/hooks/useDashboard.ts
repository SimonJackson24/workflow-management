// core/frontend/src/hooks/useDashboard.ts

import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dashboardService } from '../services/dashboardService';
import { useRealtimeUpdates } from './useRealtimeUpdates';
import {
  setMetrics,
  setActivities,
  setPlugins,
  setUsage,
  setLoading,
  setError
} from '../store/dashboardSlice';
import { RootState } from '../store';

export const useDashboard = () => {
  const dispatch = useDispatch();
  const dashboard = useSelector((state: RootState) => state.dashboard);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const socket = useRealtimeUpdates();

  const refreshDashboard = useCallback(async () => {
    try {
      dispatch(setLoading({ section: 'dashboard', loading: true }));
      
      const [metricsData, activitiesData, pluginsData, usageData] = await Promise.all([
        dashboardService.getMetrics(),
        dashboardService.getActivities(),
        dashboardService.getPlugins(),
        dashboardService.getUsage(dashboard.usage.timeRange)
      ]);

      dispatch(setMetrics(metricsData));
      dispatch(setActivities(activitiesData));
      dispatch(setPlugins(pluginsData));
      dispatch(setUsage(usageData));
      
      setLastUpdated(Date.now());
      dispatch(setError({ section: 'dashboard', error: null }));
    } catch (error) {
      dispatch(setError({
        section: 'dashboard',
        error: error.message || 'Failed to refresh dashboard'
      }));
    } finally {
      dispatch(setLoading({ section: 'dashboard', loading: false }));
    }
  }, [dispatch, dashboard.usage.timeRange]);

  // Initial load
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Auto refresh
  useEffect(() => {
    if (!dashboard.realTimeEnabled && dashboard.refreshInterval > 0) {
      const interval = setInterval(refreshDashboard, dashboard.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [dashboard.refreshInterval, dashboard.realTimeEnabled, refreshDashboard]);

  return {
    ...dashboard,
    lastUpdated,
    refreshDashboard,
    socket
  };
};
