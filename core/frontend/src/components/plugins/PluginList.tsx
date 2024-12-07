// core/frontend/src/components/plugins/PluginList.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { Plugin } from '../../types/plugin';
import PluginCard from './PluginCard';
import PluginDetailsDialog from './PluginDetailsDialog';
import PluginConfigDialog from './PluginConfigDialog';

const PluginList: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plugins');
      const data = await response.json();
      setPlugins(data);
    } catch (err) {
      setError('Failed to load plugins');
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (pluginId: string) => {
    try {
      await fetch(`/api/plugins/${pluginId}/install`, { method: 'POST' });
      fetchPlugins();
    } catch (err) {
      setError('Failed to install plugin');
    }
  };

  const handleUninstall = async (pluginId: string) => {
    try {
      await fetch(`/api/plugins/${pluginId}/uninstall`, { method: 'DELETE' });
      fetchPlugins();
    } catch (err) {
      setError('Failed to uninstall plugin');
    }
  };

  const handleToggleEnabled = async (pluginId: string, enabled: boolean) => {
    try {
      await fetch(`/api/plugins/${pluginId}/${enabled ? 'enable' : 'disable'}`, {
        method: 'POST'
      });
      fetchPlugins();
    } catch (err) {
      setError(`Failed to ${enabled ? 'enable' : 'disable'} plugin`);
    }
  };

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Plugins</Typography>
        <Button
          variant="contained"
          onClick={() => {/* Navigate to plugin marketplace */}}
        >
          Browse Marketplace
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
            <FilterIcon />
          </IconButton>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPlugins.map((plugin) => (
            <Grid item xs={12} sm={6} md={4} key={plugin.id}>
              <PluginCard
                plugin={plugin}
                onInstall={() => handleInstall(plugin.id)}
                onUninstall={() => handleUninstall(plugin.id)}
                onToggleEnabled={(enabled) => handleToggleEnabled(plugin.id, enabled)}
                onConfigure={() => {
                  setSelectedPlugin(plugin);
                  setConfigDialogOpen(true);
                }}
                onViewDetails={() => {
                  setSelectedPlugin(plugin);
                  setDetailsDialogOpen(true);
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem>All Plugins</MenuItem>
        <MenuItem>Installed</MenuItem>
        <MenuItem>Not Installed</MenuItem>
        <MenuItem>Enabled</MenuItem>
        <MenuItem>Disabled</MenuItem>
      </Menu>

      <PluginDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        plugin={selectedPlugin}
      />

      <PluginConfigDialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        plugin={selectedPlugin}
        onSave={async (config) => {
          try {
            await fetch(`/api/plugins/${selectedPlugin?.id}/config`, {
              method: 'PUT',
              body: JSON.stringify(config)
            });
            setConfigDialogOpen(false);
            fetchPlugins();
          } catch (err) {
            setError('Failed to update plugin configuration');
          }
        }}
      />
    </Box>
  );
};

export default PluginList;
