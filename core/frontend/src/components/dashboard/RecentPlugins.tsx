// core/frontend/src/components/dashboard/RecentPlugins.tsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  useTheme,
  Divider
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'error';
  icon?: string;
  lastUpdated: Date;
  author: string;
  category: string;
  error?: string;
  isUpdating?: boolean;
}

interface PluginCardProps {
  plugin: Plugin;
  onAction: (action: string, plugin: Plugin) => void;
}

const PluginCard: React.FC<PluginCardProps> = ({ plugin, onAction }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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
        return <CheckCircleIcon fontSize="small" />;
      case 'error':
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            src={plugin.icon}
            alt={plugin.name}
            variant="rounded"
            sx={{ width: 40, height: 40 }}
          >
            {plugin.name[0]}
          </Avatar>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle1">
                {plugin.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                v{plugin.version}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" noWrap>
              {plugin.description}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mt={2}>
          <Chip
            size="small"
            label={plugin.status}
            color={plugin.status === 'active' ? 'success' : 'default'}
            icon={getStatusIcon(plugin.status)}
          />
          <Chip
            size="small"
            label={plugin.category}
            variant="outlined"
          />
          {plugin.isUpdating && (
            <CircularProgress size={16} />
          )}
        </Box>

        {plugin.error && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: 'block', mt: 1 }}
          >
            {plugin.error}
          </Typography>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Typography variant="caption" color="textSecondary">
          By {plugin.author}
        </Typography>
        <Box>
          <Tooltip title="Configure">
            <IconButton
              size="small"
              onClick={() => onAction('configure', plugin)}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open">
            <IconButton
              size="small"
              onClick={() => onAction('open', plugin)}
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          onAction('update', plugin);
          setAnchorEl(null);
        }}>
          <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
          Update
        </MenuItem>
        <MenuItem onClick={() => {
          onAction(plugin.status === 'active' ? 'deactivate' : 'activate', plugin);
          setAnchorEl(null);
        }}>
          {plugin.status === 'active' ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            onAction('uninstall', plugin);
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Uninstall
        </MenuItem>
      </Menu>
    </Card>
  );
};

interface RecentPluginsProps {
  plugins: Plugin[];
  onAction?: (action: string, plugin: Plugin) => void;
  maxItems?: number;
}

const RecentPlugins: React.FC<RecentPluginsProps> = ({
  plugins,
  onAction = () => {},
  maxItems = 4
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedPlugins = showAll ? plugins : plugins.slice(0, maxItems);

  const handleAction = (action: string, plugin: Plugin) => {
    onAction(action, plugin);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Recent Plugins</Typography>
        <Button
          size="small"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : 'View All'}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {displayedPlugins.map((plugin) => (
          <Grid item xs={12} key={plugin.id}>
            <PluginCard
              plugin={plugin}
              onAction={handleAction}
            />
          </Grid>
        ))}
      </Grid>

      {plugins.length === 0 && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={4}
        >
          <Typography color="textSecondary">
            No plugins installed yet
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => handleAction('browse', {} as Plugin)}
          >
            Browse Plugins
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RecentPlugins;
