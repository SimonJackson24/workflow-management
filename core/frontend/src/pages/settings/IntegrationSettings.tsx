// core/frontend/src/pages/settings/IntegrationSettings.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useOrganization } from '../../contexts/OrganizationContext';

interface Integration {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  status: 'connected' | 'error' | 'disconnected';
  config: Record<string, any>;
  lastSync?: Date;
  error?: string;
}

const IntegrationSettings: React.FC = () => {
  const { organization, updateIntegration } = useOrganization();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const integrations: Integration[] = [
    {
      id: 'google',
      name: 'Google Workspace',
      type: 'google',
      enabled: organization?.integrations?.google?.enabled || false,
      status: organization?.integrations?.google?.config ? 'connected' : 'disconnected',
      config: organization?.integrations?.google?.config || {}
    },
    {
      id: 'slack',
      name: 'Slack',
      type: 'slack',
      enabled: organization?.integrations?.slack?.enabled || false,
      status: organization?.integrations?.slack?.config ? 'connected' : 'disconnected',
      config: organization?.integrations?.slack?.config || {}
    },
    // Add more integrations as needed
  ];

  const handleToggleIntegration = async (integration: Integration) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateIntegration(integration.id, {
        enabled: !integration.enabled
      });
      setSuccess(`${integration.name} ${integration.enabled ? 'disabled' : 'enabled'} successfully`);
    } catch (err: any) {
      setError(err.message || `Failed to ${integration.enabled ? 'disable' : 'enable'} ${integration.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = async (config: Record<string, any>) => {
    if (!selectedIntegration) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateIntegration(selectedIntegration.id, {
        config
      });
      setSuccess(`${selectedIntegration.name} configuration updated successfully`);
      setConfigDialogOpen(false);
    } catch (err: any) {
      setError(err.message || `Failed to update ${selectedIntegration.name} configuration`);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (integration: Integration) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateIntegration(integration.id, {
        sync: true
      });
      setSuccess(`${integration.name} sync initiated successfully`);
    } catch (err: any) {
      setError(err.message || `Failed to sync ${integration.name}`);
    } finally {
      setLoading(false);
    }
  };

  const renderIntegrationCard = (integration: Integration) => (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center">
            <img
              src={`/images/integrations/${integration.type}.png`}
              alt={integration.name}
              style={{ width: 32, height: 32, marginRight: 16 }}
            />
            <Box>
              <Typography variant="h6">{integration.name}</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {integration.status === 'connected' && (
                  <Chip
                    icon={<ConnectedIcon />}
                    label="Connected"
                    color="success"
                    size="small"
                  />
                )}
                {integration.status === 'error' && (
                  <Chip
                    icon={<ErrorIcon />}
                    label="Error"
                    color="error"
                    size="small"
                  />
                )}
                {integration.lastSync && (
                  <Typography variant="caption" color="textSecondary">
                    Last sync: {new Date(integration.lastSync).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={integration.enabled}
                  onChange={() => handleToggleIntegration(integration)}
                  disabled={loading}
                />
              }
              label="Enabled"
            />
            <Tooltip title="Configure">
              <IconButton
                onClick={() => handleConfigureIntegration(integration)}
                disabled={loading}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sync Now">
              <IconButton
                onClick={() => handleSync(integration)}
                disabled={loading || !integration.enabled}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>

        {integration.error && (
          <Grid item xs={12}>
            <Alert severity="error">{integration.error}</Alert>
          </Grid>
        )}
      </Grid>
    </Paper>
  );

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Integrations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* Handle adding custom integration */}}
        >
          Add Integration
        </Button>
      </Box>

      {integrations.map(integration => renderIntegrationCard(integration))}

      {/* Configuration Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Configure {selectedIntegration?.name}
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => {/* Show help documentation */}}
          >
            <HelpIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedIntegration?.type === 'google' && (
            <GoogleIntegrationConfig
              config={selectedIntegration.config}
              onSave={handleSaveConfig}
            />
          )}
          {selectedIntegration?.type === 'slack' && (
            <SlackIntegrationConfig
              config={selectedIntegration.config}
              onSave={handleSaveConfig}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {/* Handle save */}}
            disabled={loading}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Integration-specific configuration components
const GoogleIntegrationConfig: React.FC<{
  config: Record<string, any>;
  onSave: (config: Record<string, any>) => void;
}> = ({ config, onSave }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Client ID"
          value={config.clientId || ''}
          onChange={(e) => {/* Handle change */}}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Client Secret"
          type="password"
          value={config.clientSecret || ''}
          onChange={(e) => {/* Handle change */}}
        />
      </Grid>
      {/* Add more configuration fields */}
    </Grid>
  );
};

const SlackIntegrationConfig: React.FC<{
  config: Record<string, any>;
  onSave: (config: Record<string, any>) => void;
}> = ({ config, onSave }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Webhook URL"
          value={config.webhookUrl || ''}
          onChange={(e) => {/* Handle change */}}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Bot Token"
          type="password"
          value={config.botToken || ''}
          onChange={(e) => {/* Handle change */}}
        />
      </Grid>
      {/* Add more configuration fields */}
    </Grid>
  );
};

export default IntegrationSettings;
