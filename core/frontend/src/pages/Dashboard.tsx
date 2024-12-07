import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useAuth } from '../contexts/AuthContext';
import { usePlugins } from '../contexts/PluginContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentActivity from '../components/dashboard/RecentActivity';
import TasksSummary from '../components/dashboard/TasksSummary';
import PluginStatus from '../components/dashboard/PluginStatus';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const { user, organization } = useAuth();
  const { plugins } = usePlugins();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard data from your API
        // const data = await dashboardService.getStats();
        // setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <DashboardStats stats={stats} />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Activity Overview
            </Typography>
            <Box height={300}>
              <Line
                data={{
                  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                  datasets: [
                    {
                      label: 'User Activity',
                      data: [65, 59, 80, 81, 56, 55],
                      fill: false,
                      borderColor: 'rgb(75, 192, 192)',
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <RecentActivity />
        </Grid>

        {/* Tasks Summary */}
        <Grid item xs={12} md={6}>
          <TasksSummary />
        </Grid>

        {/* Plugin Status */}
        <Grid item xs={12} md={6}>
          <PluginStatus plugins={plugins} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
