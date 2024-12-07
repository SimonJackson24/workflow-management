// core/frontend/src/components/monitoring/PluginMonitoringDashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { usePluginMonitoring } from '../../hooks/usePluginMonitoring';
import { MetricsCard } from './MetricsCard';
import { LogViewer } from './LogViewer';
import { AlertsPanel } from './AlertsPanel';
import { HealthStatus } from './HealthStatus';

const PluginMonitoringDashboard: React.FC<{ pluginId: string }> = ({ pluginId }) => {
  const {
    metrics,
    logs,
    alerts,
    health,
    realTimeData,
    loading,
    error,
    timeRange,
    setTimeRange,
    startRealTimeMonitoring,
    stopRealTimeMonitoring
  } = usePluginMonitoring(pluginId);

  const [selectedMetric, setSelectedMetric] = useState('cpu');
  const [isRealTime, setIsRealTime] = useState(false);

  useEffect(() => {
    if (isRealTime) {
      startRealTimeMonitoring();
      return () => stopRealTimeMonitoring();
    }
  }, [isRealTime]);

  return (
    <Box>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Plugin Monitoring</Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              disabled={isRealTime}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant={isRealTime ? "contained" : "outlined"}
            onClick={() => setIsRealTime(!isRealTime)}
          >
            {isRealTime ? 'Disable Real-time' : 'Enable Real-time'}
          </Button>
        </Box>
      </Box>

      {/* Health Status */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HealthStatus health={health} />
        </Grid>

        {/* Key Metrics Cards */}
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="CPU Usage"
            value={`${metrics.cpu.current}%`}
            change={metrics.cpu.change}
            trend={metrics.cpu.trend}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="Memory Usage"
            value={`${metrics.memory.current}MB`}
            change={metrics.memory.change}
            trend={metrics.memory.trend}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="Error Rate"
            value={metrics.errors.current}
            change={metrics.errors.change}
            trend={metrics.errors.trend}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="Response Time"
            value={`${metrics.responseTime.current}ms`}
            change={metrics.responseTime.change}
            trend={metrics.responseTime.trend}
          />
        </Grid>

        {/* Main Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Performance Metrics</Typography>
              <FormControl size="small">
                <Select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                >
                  <MenuItem value="cpu">CPU Usage</MenuItem>
                  <MenuItem value="memory">Memory Usage</MenuItem>
                  <MenuItem value="errors">Error Rate</MenuItem>
                  <MenuItem value="responseTime">Response Time</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={isRealTime ? realTimeData : metrics[selectedMetric].history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  dot={!isRealTime}
                />
                {isRealTime && (
                  <Line
                    type="monotone"
                    dataKey="trend"
                    stroke="#82ca9d"
                    strokeDasharray="5 5"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Resource Usage */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resource Usage
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.resources}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Error Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.errorDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Logs and Alerts */}
        <Grid item xs={12} md={6}>
          <LogViewer logs={logs} isRealTime={isRealTime} />
        </Grid>
        <Grid item xs={12} md={6}>
          <AlertsPanel alerts={alerts} isRealTime={isRealTime} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PluginMonitoringDashboard;
