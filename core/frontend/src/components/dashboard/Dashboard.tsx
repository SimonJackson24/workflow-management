// core/frontend/src/components/dashboard/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
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
import { useOrganization } from '../../contexts/OrganizationContext';

interface DashboardMetrics {
  activeUsers: number;
  activeUsersChange: number;
  storage: {
    used: number;
    total: number;
  };
  apiCalls: {
    count: number;
    change: number;
  };
  revenue: {
    current: number;
    previous: number;
  };
  userActivity: Array<{
    date: string;
    users: number;
    sessions: number;
  }>;
  resourceUsage: Array<{
    resource: string;
    usage: number;
  }>;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { organization } = useOrganization();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [timeRange]);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/metrics?timeRange=${timeRange}`);
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: number | string;
    change?: number;
    icon: React.ReactNode;
  }> = ({ title, value, change, icon }) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {change >= 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={change >= 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {Math.abs(change)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: 'primary.light',
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
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

  if (!metrics) return null;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
          >
            {timeRange}
          </Button>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
          >
            <MenuItem onClick={() => setTimeRange('24h')}>Last 24 Hours</MenuItem>
            <MenuItem onClick={() => setTimeRange('7d')}>Last 7 Days</MenuItem>
            <MenuItem onClick={() => setTimeRange('30d')}>Last 30 Days</MenuItem>
            <MenuItem onClick={() => setTimeRange('90d')}>Last 90 Days</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Metric Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            change={metrics.activeUsersChange}
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Storage Used"
            value={`${(metrics.storage.used / 1024).toFixed(2)} GB`}
            icon={<StorageIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="API Calls"
            value={metrics.apiCalls.count.toLocaleString()}
            change={metrics.apiCalls.change}
            icon={<CodeIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Revenue"
            value={`$${metrics.revenue.current.toLocaleString()}`}
            change={((metrics.revenue.current - metrics.revenue.previous) / metrics.revenue.previous) * 100}
            icon={<PaymentIcon />}
          />
        </Grid>

        {/* Activity Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Activity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={theme.palette.primary.main}
                  name="Active Users"
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke={theme.palette.secondary.main}
                  name="Sessions"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Resource Usage */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resource Usage
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.resourceUsage}
                  dataKey="usage"
                  nameKey="resource"
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
    </Box>
  );
};

export default Dashboard;
