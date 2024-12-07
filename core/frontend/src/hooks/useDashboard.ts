// core/frontend/src/hooks/useDashboard.ts

import { useEffect } from 'react';
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
  const socket = useRealtimeUpdates();

  const refreshDashboard = async () => {
    try {
      dispatch(setLoading({ section: 'metrics', loading: true }));
      const data = await dashboardService.refreshDashboard();
      
      dispatch(setMetrics(data.metrics));
      dispatch(setActivities(data.activities));
      dispatch(setPlugins(data.plugins));
      dispatch(setUsage(data.usage));
      
      dispatch(setError({ section: 'metrics', error: null }));
    } catch (error) {
      dispatch(setError({ 
        section: 'metrics', 
        error: error.message || 'Failed to refresh dashboard' 
      }));
    } finally {
      dispatch(setLoading({ section: 'metrics', loading: false }));
    }
  };

  useEffect(() => {
    refreshDashboard();

    if (!dashboard.realTimeEnabled) {
      const interval = setInterval(refreshDashboard, dashboard.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [dashboard.refreshInterval, dashboard.realTimeEnabled]);

  return {
    ...dashboard,
    refreshDashboard,
    socket
  };
};
