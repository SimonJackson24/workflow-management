// core/frontend/src/pages/Dashboard.tsx

import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Button,
  useTheme
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import MetricsCards from '../components/dashboard/MetricsCards';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import QuickActions from '../components/dashboard/QuickActions';
import UsageChart from '../components/dashboard/UsageChart';
import RecentPlugins from '../components/dashboard/RecentPlugins';
import { DashboardErrorBoundary } from '../components/dashboard/ErrorBoundary';
import { useDashboard } from '../hooks/useDashboard';
import { dashboardStyles } from '../styles/dashboard.styles';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const styles = dashboardStyles(theme);
  const {
    metrics,
    activities,
    plugins,
    usage,
    refreshDashboard,
    loading,
    error,
    lastUpdated
  } = useDashboard();

  useEffect(() => {
    document.title = 'Dashboard - Workflow System';
  }, []);

  if (loading && !metrics.data.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardErrorBoundary>
      <Box sx={styles.root}>
        {/* Header Section */}
        <Box sx={styles.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Dashboard
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {lastUpdated
                  ? `Last updated ${new Date(lastUpdated).toLocaleString()}`
                  : 'Updating...'}
              </Typography>
            </Box>
            <Button
              startIcon={<RefreshIcon />}
              onClick={refreshDashboard}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Metrics Section */}
          <Grid item xs={12}>
            <MetricsCards
              metrics={metrics.data}
              loading={metrics.loading}
              error={metrics.error}
            />
          </Grid>

          {/* Usage Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={styles.paper}>
              <UsageChart
                data={usage.data}
                loading={usage.loading}
                error={usage.error}
              />
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} lg={4}>
            <Paper sx={styles.paper}>
              <QuickActions />
            </Paper>
          </Grid>

          {/* Activity Feed */}
          <Grid item xs={12} md={6}>
            <Paper sx={styles.paper}>
              <ActivityFeed
                activities={activities.data}
                loading={activities.loading}
                error={activities.error}
              />
            </Paper>
          </Grid>

          {/* Recent Plugins */}
          <Grid item xs={12} md={6}>
            <Paper sx={styles.paper}>
              <RecentPlugins
                plugins={plugins.data}
                loading={plugins.loading}
                error={plugins.error}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
