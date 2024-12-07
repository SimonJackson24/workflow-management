// core/frontend/src/components/analytics/AnalyticsDashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  useTheme
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
import { DateRangePicker } from '@mui/lab';
import { format } from 'date-fns';

interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userRetention: number;
    userActivity: Array<{
      date: string;
      activeUsers: number;
      newUsers: number;
    }>;
    usersByLocation: Array<{
      country: string;
      users: number;
    }>;
  };
  performanceMetrics: {
    averageResponseTime: number;
    errorRate: number;
    apiCalls: number;
    responseTimeHistory: Array<{
      timestamp: string;
      value: number;
    }>;
    errorDistribution: Array<{
      type: string;
      count: number;
    }>;
  };
  resourceMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
    resourceHistory: Array<{
      timestamp: string;
      cpu: number;
      memory: number;
      storage: number;
    }>;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [granularity, setGranularity] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, granularity]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({
          startDate: dateRange[0],
          endDate: dateRange[1],
          granularity
        })
      });
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const UserMetrics = () => (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h4">
              {data?.userMetrics.totalUsers.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Users
            </Typography>
            <Typography variant="h4">
              {data?.userMetrics.activeUsers.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              New Users
            </Typography>
            <Typography variant="h4">
              {data?.userMetrics.newUsers.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Retention
            </Typography>
            <Typography variant="h4">
              {data?.userMetrics.userRetention.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Activity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.userMetrics.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.light}
                  name="Active Users"
                />
                <Area
                  type="monotone"
                  dataKey="newUsers"
                  stroke={theme.palette.secondary.main}
                  fill={theme.palette.secondary.light}
                  name="New Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Users by Location
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.userMetrics.usersByLocation}
                  dataKey="users"
                  nameKey="country"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={theme.palette.primary.main}
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  const PerformanceMetrics = () => (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Average Response Time
            </Typography>
            <Typography variant="h4">
              {data?.performanceMetrics.averageResponseTime.toFixed(2)}ms
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error Rate
            </Typography>
            <Typography variant="h4">
              {data?.performanceMetrics.errorRate.toFixed(2)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              API Calls
            </Typography>
            <Typography variant="h4">
              {data?.performanceMetrics.apiCalls.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Response Time History
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.performanceMetrics.responseTimeHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={theme.palette.primary.main}
                  name="Response Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.performanceMetrics.errorDistribution}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill={theme.palette.error.main}
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  const ResourceMetrics = () => (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              CPU Usage
            </Typography>
            <Typography variant="h4">
              {data?.resourceMetrics.cpuUsage.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Memory Usage
            </Typography>
            <Typography variant="h4">
              {data?.resourceMetrics.memoryUsage.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Storage Usage
            </Typography>
            <Typography variant="h4">
              {data?.resourceMetrics.storageUsage.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resource Usage History
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.resourceMetrics.resourceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke={theme.palette.primary.main}
                  name="CPU"
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke={theme.palette.secondary.main}
                  name="Memory"
                />
                <Line
                  type="monotone"
                  dataKey="storage"
                  stroke={theme.palette.error.main}
                  name="Storage"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Analytics</Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small">
            <InputLabel>Granularity</InputLabel>
            <Select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as any)}
              label="Granularity"
            >
              <MenuItem value="hour">Hourly</MenuItem>
              <MenuItem value="day">Daily</MenuItem>
              <MenuItem value="week">Weekly</MenuItem>
              <MenuItem value="month">Monthly</MenuItem>
            </Select>
          </FormControl>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            renderInput={(startProps, endProps) => (
              <>
                <TextField {...startProps} />
                <Box sx={{ mx: 2 }}> to </Box>
                <TextField {...endProps} />
              </>
            )}
          />
          <Button
            variant="outlined"
            onClick={fetchAnalyticsData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="User Metrics" />
        <Tab label="Performance Metrics" />
        <Tab label="Resource Metrics" />
      </Tabs>

      {activeTab === 0 && <UserMetrics />}
      {activeTab === 1 && <PerformanceMetrics />}
      {activeTab === 2 && <ResourceMetrics />}
    </Box>
  );
};

export default AnalyticsDashboard;
