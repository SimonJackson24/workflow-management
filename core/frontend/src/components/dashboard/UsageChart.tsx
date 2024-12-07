// core/frontend/src/components/dashboard/UsageChart.tsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  ButtonGroup,
  Button,
  useTheme,
  MenuItem,
  Select,
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
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';

interface UsageData {
  timestamp: string;
  users: number;
  storage: number;
  apiCalls: number;
}

interface UsageChartProps {
  data: UsageData[];
  onTimeRangeChange?: (range: string) => void;
  onMetricChange?: (metric: string) => void;
}

const UsageChart: React.FC<UsageChartProps> = ({
  data,
  onTimeRangeChange,
  onMetricChange
}) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    onTimeRangeChange?.(range);
  };

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
    onMetricChange?.(metric);
  };

  const getTimeRangeData = () => {
    const now = new Date();
    const startDate = timeRange === '30d' 
      ? subMonths(now, 1)
      : timeRange === '7d'
        ? subDays(now, 7)
        : subDays(now, 1);

    return data.filter(item => new Date(item.timestamp) >= startDate);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">Usage Metrics</Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small">
            <InputLabel>Metric</InputLabel>
            <Select
              value={selectedMetric}
              label="Metric"
              onChange={(e) => handleMetricChange(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Metrics</MenuItem>
              <MenuItem value="users">Users</MenuItem>
              <MenuItem value="storage">Storage</MenuItem>
              <MenuItem value="apiCalls">API Calls</MenuItem>
            </Select>
          </FormControl>

          <ButtonGroup size="small">
            <Button
              variant={timeRange === '24h' ? 'contained' : 'outlined'}
              onClick={() => handleTimeRangeChange('24h')}
            >
              24h
            </Button>
            <Button
              variant={timeRange === '7d' ? 'contained' : 'outlined'}
              onClick={() => handleTimeRangeChange('7d')}
            >
              7d
            </Button>
            <Button
              variant={timeRange === '30d' ? 'contained' : 'outlined'}
              onClick={() => handleTimeRangeChange('30d')}
            >
              30d
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={getTimeRangeData()}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd')}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(timestamp) => format(new Date(timestamp), 'MMM dd, yyyy HH:mm')}
            />
            <Legend />
            {(selectedMetric === 'all' || selectedMetric === 'users') && (
              <Line
                type="monotone"
                dataKey="users"
                stroke={theme.palette.primary.main}
                name="Active Users"
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'storage') && (
              <Line
                type="monotone"
                dataKey="storage"
                stroke={theme.palette.secondary.main}
                name="Storage (GB)"
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'apiCalls') && (
              <Line
                type="monotone"
                dataKey="apiCalls"
                stroke={theme.palette.success.main}
                name="API Calls"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default UsageChart;
