// core/frontend/src/components/plugins/PluginCard.tsx

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Switch,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { Plugin } from '../../types/plugin';

interface PluginCardProps {
  plugin: Plugin;
  onInstall: () => void;
  onUninstall: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onConfigure: () => void;
  onViewDetails: () => void;
}

const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  onInstall,
  onUninstall,
  onToggleEnabled,
  onConfigure,
  onViewDetails
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: () => void) => {
    setLoading(true);
    try {
      await action();
    } finally {
      setLoading(false);
      setMenuAnchorEl(null);
    }
  };

  const getStatusColor = () => {
    switch (plugin.status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      {loading && <LinearProgress />}
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" gutterBottom>
            {plugin.name}
          </Typography>
          <Box>
            <Chip
              size="small"
              label={plugin.version}
              sx={{ mr: 1 }}
            />
            <Chip
              size="small"
              label={plugin.status}
              color={getStatusColor()}
            />
          </Box>
        </Box>

        <Typography variant="body2" color="textSecondary" gutterBottom>
          {plugin.description}
        </Typography>

        <Box display="flex" gap={1} mt={1}>
          {plugin.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>

        <Box mt={2}>
          <Typography variant="caption" color="textSecondary">
            By {plugin.author} • {plugin.stats.activeInstalls.toLocaleString()} active installations
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        {plugin.installed ? (
          <>
            <Switch
              checked={plugin.enabled}
              onChange={(e) => handleAction(() => onToggleEnabled(e.target.checked))}
              disabled={loading}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Configure">
              <IconButton onClick={onConfigure} disabled={loading}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Details">
              <IconButton onClick={onViewDetails} disabled={loading}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={(e) => setMenuAnchorEl(e.currentTarget)}
              disabled={loading}
            >
              <MoreVertIcon />
            </IconButton>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={() => handleAction(onInstall)}
            disabled={loading}
            fullWidth
          >
            Install
          </Button>
        )}
      </CardActions>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => handleAction(onUninstall)}>
          Uninstall
        </MenuItem>
        {plugin.metadata.updates?.available && (
          <MenuItem onClick={() => handleAction(() => {/* Update logic */})}>
            <UpdateIcon sx={{ mr: 1 }} />
            Update Available
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default PluginCard;
