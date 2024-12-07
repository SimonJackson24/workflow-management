// core/frontend/src/components/dashboard/MetricsCards.tsx

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  Payment as PaymentIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  description,
  color
}) => {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography color="textSecondary" variant="subtitle2">
                {title}
              </Typography>
              {description && (
                <Tooltip title={description}>
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              )}
            </Box>
            <Typography variant="h4" sx={{ my: 1 }}>
              {value}
            </Typography>
            {typeof change !== 'undefined' && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {change >= 0 ? (
                  <TrendingUpIcon fontSize="small" color="success" />
                ) : (
                  <TrendingDownIcon fontSize="small" color="error" />
                )}
                <Typography
                  variant="body2"
                  color={change >= 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(change)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color || theme.palette.primary.main,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.8
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

interface MetricsCardsProps {
  metrics: {
    activeUsers: number;
    storageUsed: number;
    apiCalls: number;
    revenue: number;
  };
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const theme = useTheme();

  const metricCards = [
    {
      title: 'Active Users',
      value: metrics.activeUsers.toLocaleString(),
      change: 12.5,
      icon: <PeopleIcon sx={{ color: 'white' }} />,
      description: 'Users active in the last 24 hours',
      color: theme.palette.primary.main
    },
    {
      title: 'Storage Used',
      value: `${(metrics.storageUsed / 1024).toFixed(2)} GB`,
      change: -2.4,
      icon: <StorageIcon sx={{ color: 'white' }} />,
      description: 'Total storage used by your organization',
      color: theme.palette.secondary.main
    },
    {
      title: 'API Calls',
      value: `${(metrics.apiCalls / 1000).toFixed(1)}k`,
      change: 8.1,
      icon: <CodeIcon sx={{ color: 'white' }} />,
      description: 'API calls in the last 24 hours',
      color: theme.palette.success.main
    },
    {
      title: 'Revenue',
      value: `$${metrics.revenue.toLocaleString()}`,
      change: 15.3,
      icon: <PaymentIcon sx={{ color: 'white' }} />,
      description: 'Revenue this month',
      color: theme.palette.warning.main
    }
  ];

  return (
    <Grid container spacing={3}>
      {metricCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <MetricCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default MetricsCards;
