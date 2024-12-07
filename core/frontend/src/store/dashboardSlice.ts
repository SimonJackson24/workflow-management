// core/frontend/src/store/dashboardSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  MetricData, 
  Activity, 
  Plugin, 
  UsageDataPoint 
} from '../types/dashboard.types';

interface DashboardState {
  metrics: {
    data: MetricData[];
    loading: boolean;
    error: string | null;
    lastUpdated: number | null;
  };
  activities: {
    data: Activity[];
    loading: boolean;
    error: string | null;
    lastUpdated: number | null;
  };
  plugins: {
    data: Plugin[];
    loading: boolean;
    error: string | null;
    lastUpdated: number | null;
  };
  usage: {
    data: UsageDataPoint[];
    loading: boolean;
    error: string | null;
    lastUpdated: number | null;
    timeRange: string;
  };
  refreshInterval: number;
  realTimeEnabled: boolean;
}

const initialState: DashboardState = {
  metrics: {
    data: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  activities: {
    data: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  plugins: {
    data: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  usage: {
    data: [],
    loading: false,
    error: null,
    lastUpdated: null,
    timeRange: '7d'
  },
  refreshInterval: 30000, // 30 seconds
  realTimeEnabled: true
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setMetrics(state, action: PayloadAction<MetricData[]>) {
      state.metrics.data = action.payload;
      state.metrics.lastUpdated = Date.now();
    },
    setActivities(state, action: PayloadAction<Activity[]>) {
      state.activities.data = action.payload;
      state.activities.lastUpdated = Date.now();
    },
    setPlugins(state, action: PayloadAction<Plugin[]>) {
      state.plugins.data = action.payload;
      state.plugins.lastUpdated = Date.now();
    },
    setUsage(state, action: PayloadAction<UsageDataPoint[]>) {
      state.usage.data = action.payload;
      state.usage.lastUpdated = Date.now();
    },
    setLoading(
      state,
      action: PayloadAction<{ section: keyof DashboardState; loading: boolean }>
    ) {
      const { section, loading } = action.payload;
      state[section].loading = loading;
    },
    setError(
      state,
      action: PayloadAction<{ section: keyof DashboardState; error: string | null }>
    ) {
      const { section, error } = action.payload;
      state[section].error = error;
    },
    setTimeRange(state, action: PayloadAction<string>) {
      state.usage.timeRange = action.payload;
    },
    setRefreshInterval(state, action: PayloadAction<number>) {
      state.refreshInterval = action.payload;
    },
    setRealTimeEnabled(state, action: PayloadAction<boolean>) {
      state.realTimeEnabled = action.payload;
    }
  }
});

export const {
  setMetrics,
  setActivities,
  setPlugins,
  setUsage,
  setLoading,
  setError,
  setTimeRange,
  setRefreshInterval,
  setRealTimeEnabled
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
