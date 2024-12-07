// core/frontend/src/components/billing/UsageTracking.tsx

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useUsage } from '../../hooks/useUsage';
import { UsageMetric } from '../../types/billing.types';

export const UsageTracking: React.FC = () => {
  const {
    currentUsage,
    usageHistory,
    limits,
    loading,
    error
  } = useUsage();

  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState<UsageMetric>('api_calls');

  const getUsagePercentage = (metric: UsageMetric) => {
    const usage = currentUsage[metric];
    const limit = limits[metric];
    return (usage / limit) * 100;
  };

  const formatUsageValue = (metric: UsageMetric, value: number) => {
    switch (metric) {
      case 'storage':
        return `${(value / 1024 / 1024).toFixed(2)} GB`;
      case 'bandwidth':
        return `${(value / 1024 / 1024).toFixed(2)} GB`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Usage Tracking</Typography>
        <Box>
          <FormControl size="small" sx={{ mr: 2 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined">Export Data</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Usage Metrics Cards */}
        {Object.entries(currentUsage).map(([metric, usage]) => (
          <Grid item xs={12} md={6} lg={3} key={metric}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {metric.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="h6">
                  {formatUsageValue(metric as UsageMetric, usage)}
                  <Typography variant="caption" color="textSecondary">
                    {' '}/ {formatUsageValue(metric as UsageMetric, limits[metric as UsageMetric])}
                  </Typography>
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getUsagePercentage(metric as UsageMetric)}
                  color={getUsagePercentage(metric as UsageMetric) > 90 ? 'error' : 'primary'}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Usage History Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Usage History</Typography>
                <FormControl size="small">
                  <Select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as UsageMetric)}
                  >
                    {Object.keys(currentUsage).map((metric) => (
                      <MenuItem key={metric} value={metric}>
                        {metric.replace('_', ' ').toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={usageHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
