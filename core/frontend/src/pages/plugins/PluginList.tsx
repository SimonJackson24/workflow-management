// core/frontend/src/pages/plugins/PluginList.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { usePlugins } from '../../hooks/usePlugins';
import { PluginConfigDialog } from './components/PluginConfigDialog';
import { PluginStatus } from './components/PluginStatus';

const PluginList: React.FC = () => {
  const {
    plugins,
    loading,
    error,
    refreshPlugins,
    uninstallPlugin,
    togglePlugin,
    updatePluginConfig
  } = usePlugins();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleConfigSave = async (config: any) => {
    if (selectedPlugin) {
      await updatePluginConfig(selectedPlugin.id, config);
      setConfigDialogOpen(false);
    }
  };

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Installed Plugins</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<StoreIcon />}
            href="/plugins/marketplace"
            sx={{ mr: 2 }}
          >
            Plugin Marketplace
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            onClick={refreshPlugins}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
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
            )
          }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Plugin Grid */}
      <Grid container spacing={3}>
        {filteredPlugins.map((plugin) => (
          <Grid item xs={12} md={6} lg={4} key={plugin.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">{plugin.name}</Typography>
                  <IconButton
                    onClick={(e) => {
                      setSelectedPlugin(plugin);
                      setMenuAnchorEl(e.currentTarget);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography color="textSecondary" gutterBottom>
                  {plugin.description}
                </Typography>

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={`v${plugin.version}`}
                    size="small"
                  />
                  <PluginStatus status={plugin.status} />
                </Box>

                <Typography variant="caption" display="block">
                  Author: {plugin.author}
                </Typography>
                <Typography variant="caption" display="block">
                  Last Updated: {new Date(plugin.lastUpdated).toLocaleDateString()}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<SettingsIcon />}
                  onClick={() => {
                    setSelectedPlugin(plugin);
                    setConfigDialogOpen(true);
                  }}
                >
                  Configure
                </Button>
                <Button
                  size="small"
                  color={plugin.enabled ? 'error' : 'primary'}
                  onClick={() => togglePlugin(plugin.id)}
                >
                  {plugin.enabled ? 'Disable' : 'Enable'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Plugin Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setConfigDialogOpen(true);
          setMenuAnchorEl(null);
        }}>
          <SettingsIcon sx={{ mr: 1 }} /> Configure
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedPlugin) {
            uninstallPlugin(selectedPlugin.id);
          }
          setMenuAnchorEl(null);
        }}>
          <DeleteIcon sx={{ mr: 1 }} /> Uninstall
        </MenuItem>
      </Menu>

      {/* Configuration Dialog */}
      <PluginConfigDialog
        open={configDialogOpen}
        plugin={selectedPlugin}
        onClose={() => setConfigDialogOpen(false)}
        onSave={handleConfigSave}
      />
    </Box>
  );
};

export default PluginList;
