// core/frontend/src/components/plugins/PluginDependencyManager.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import { usePluginDependencies } from '../../hooks/usePluginDependencies';

interface PluginDependencyManagerProps {
  pluginId: string;
}

export const PluginDependencyManager: React.FC<PluginDependencyManagerProps> = ({
  pluginId
}) => {
  const {
    dependencies,
    loading,
    error,
    installDependency
  } = usePluginDependencies(pluginId);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Dependencies
      </Typography>

      <List>
        {dependencies.map((dep) => (
          <ListItem key={dep.id}>
            <ListItemText
              primary={dep.name}
              secondary={`Required version: ${dep.requiredVersion}`}
            />
            <ListItemSecondary>
              {dep.installed ? (
                <Chip
                  label={`Installed: ${dep.installedVersion}`}
                  color={dep.compatible ? 'success' : 'error'}
                />
              ) : (
                <Button
                  size="small"
                  onClick={() => installDependency(dep.id)}
                  disabled={loading}
                >
                  Install
                </Button>
              )}
            </ListItemSecondary>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

// core/frontend/src/components/plugins/PluginAnalytics.tsx

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from '@mui/material';
import { usePluginAnalytics } from '../../hooks/usePluginAnalytics';

interface PluginAnalyticsProps {
  pluginId: string;
}

export const PluginAnalytics: React.FC<PluginAnalyticsProps> = ({
  pluginId
}) => {
  const {
    metrics,
    loading,
    error,
    timeRange,
    setTimeRange
  } = usePluginAnalytics(pluginId);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Plugin Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Usage Metrics
            </Typography>
            <LineChart width={800} height={400} data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="apiCalls" stroke="#8884d8" />
              <Line type="monotone" dataKey="errors" stroke="#82ca9d" />
            </LineChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
