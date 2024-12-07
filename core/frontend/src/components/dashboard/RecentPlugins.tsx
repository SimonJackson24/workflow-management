// core/frontend/src/components/dashboard/RecentPlugins.tsx

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondary,
  Avatar,
  Chip,
  IconButton,
  Button,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Extension as ExtensionIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface Plugin {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  version: string;
  lastUpdated: Date;
  icon?: string;
}

interface RecentPluginsProps {
  plugins: Plugin[];
  onPluginAction?: (action: string, pluginId: string) => void;
  maxItems?: number;
}

const RecentPlugins: React.FC<RecentPluginsProps> = ({
  plugins,
  onPluginAction,
  maxItems = 5
}) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'inactive':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ActiveIcon fontSize="small" />;
      case 'error':
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Recent Plugins</Typography>
        <Button
          size="small"
          startIcon={<ExtensionIcon />}
          onClick={() => onPluginAction?.('viewAll', '')}
        >
          View All
        </Button>
      </Box>

      <List>
        {plugins.slice(0, maxItems).map((plugin) => (
          <ListItem
            key={plugin.id}
            secondaryAction={
              <Box>
                <Tooltip title="Configure">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onPluginAction?.('configure', plugin.id)}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onPluginAction?.('remove', plugin.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          >
            <ListItemAvatar>
              {plugin.icon ? (
                <Avatar src={plugin.icon} alt={plugin.name} />
              ) : (
                <Avatar>
                  <ExtensionIcon />
                </Avatar>
              )}
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle2">
                    {plugin.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={plugin.status}
                    color={plugin.status === 'active' ? 'success' : 'default'}
                    icon={getStatusIcon(plugin.status)}
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" color="textSecondary">
                    {plugin.description}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Updated {formatDistanceToNow(new Date(plugin.lastUpdated), { addSuffix: true })}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      {plugins.length === 0 && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={4}
        >
          <ExtensionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="textSecondary">
            No plugins installed yet
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ExtensionIcon />}
            onClick={() => onPluginAction?.('
