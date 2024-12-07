// core/frontend/src/components/users/UserActivityLog.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useUserActivity } from '../../hooks/useUserActivity';
import { ActivityType, UserActivity } from '../../types/activity.types';

interface UserActivityLogProps {
  userId: string;
}

const activityIcons: Record<ActivityType, React.ReactElement> = {
  login: <LoginIcon />,
  logout: <LogoutIcon />,
  profile_update: <EditIcon />,
  security_change: <SecurityIcon />,
  settings_change: <SettingsIcon />
};

export const UserActivityLog: React.FC<UserActivityLogProps> = ({ userId }) => {
  const {
    activities,
    loading,
    error,
    fetchActivities,
    filters,
    setFilters
  } = useUserActivity(userId);

  const [showFilters, setShowFilters] = useState(false);

  const getActivityDescription = (activity: UserActivity): string => {
    switch (activity.type) {
      case 'login':
        return `Logged in from ${activity.metadata?.ipAddress || 'unknown location'}`;
      case 'logout':
        return 'Logged out';
      case 'profile_update':
        return `Updated ${activity.metadata?.fields?.join(', ')}`;
      case 'security_change':
        return `Changed ${activity.metadata?.securitySetting}`;
      case 'settings_change':
        return `Updated ${activity.metadata?.setting}`;
      default:
        return activity.description;
    }
  };

  const handleRefresh = () => {
    fetchActivities();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Activity Log</Typography>
        <Box>
          <Tooltip title="Filter">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {showFilters && (
        <Box mb={2} p={2} bgcolor="background.default" borderRadius={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Activity Type</InputLabel>
                <Select
                  value={filters.type || 'all'}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="all">All Activities</MenuItem>
                  <MenuItem value="login">Logins</MenuItem>
                  <MenuItem value="security_change">Security Changes</MenuItem>
                  <MenuItem value="profile_update">Profile Updates</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={filters.timeRange || '7d'}
                  onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
                >
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <List>
          {activities.map((activity) => (
            <ListItem
              key={activity.id}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <ListItemIcon>
                {activityIcons[activity.type]}
              </ListItemIcon>
              <ListItemText
                primary={getActivityDescription(activity)}
                secondary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">
                      {format(new Date(activity.timestamp), 'PPpp')}
                    </Typography>
                    {activity.metadata?.browser && (
                      <Chip
                        size="small"
                        label={activity.metadata.browser}
                        variant="outlined"
                      />
                    )}
                    {activity.metadata?.location && (
                      <Chip
                        size="small"
                        label={activity.metadata.location}
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {activities.length === 0 && !loading && (
        <Box textAlign="center" py={3}>
          <Typography color="textSecondary">
            No activity found for the selected filters
          </Typography>
        </Box>
      )}
    </Box>
  );
};
