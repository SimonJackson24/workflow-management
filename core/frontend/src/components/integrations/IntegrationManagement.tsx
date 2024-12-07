// core/frontend/src/components/integrations/IntegrationManagement.tsx

import React, { useState, useEffect } from 'react';
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
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  History as HistoryIcon
} from '@mui/icons-material';

interface Integration {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  enabled: boolean;
  config: Record<string, any>;
  lastSync?: Date;
  error?: string;
  features: string[];
  icon: string;
}

interface IntegrationLog {
  id: string;
  integrationId: string;
  event: string;
  status: 'success' | 'error';
  message: string;
  timestamp: Date;
  details?: Record<string, any>;
}

const IntegrationManagement: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>([]);
  const [configForm, setConfigForm] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations');
      const data = await response.json();
      setIntegrations(data);
    } catch (err) {
      setError('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (integration: Integration) => {
    try {
      const response = await fetch(`/api/integrations/${integration.id}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ enabled: !integration.enabled })
      });
      const updatedIntegration = await response.json();
      setIntegrations(prev =>
        prev.map(i => i.id === integration.id ? updatedIntegration : i)
      );
    } catch (err) {
      setError(`Failed to ${integration.enabled ? 'disable' : 'enable'} integration`);
    }
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigForm(integration.config);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedIntegration) return;

    try {
      const response = await fetch(`/api/integrations/${selectedIntegration.id}/config`, {
        method: 'PUT',
        body: JSON.stringify(configForm)
      });
      const updatedIntegration = await response.json();
      setIntegrations(prev =>
        prev.map(i => i.id === selectedIntegration.id ? updatedIntegration : i)
      );
      setConfigDialogOpen(false);
    } catch (err) {
      setError('Failed to update integration configuration');
    }
  };

  const handleViewLogs = async (integration: Integration) => {
    try {
      const response = await fetch(`/api/integrations/${integration.id}/logs`);
      const logs = await response.json();
      setIntegrationLogs(logs);
      setSelectedIntegration(integration);
      setLogDialogOpen(true);
    } catch (err) {
      setError('Failed to load integration logs');
    }
  };

  const handleSync = async (integration: Integration) => {
    try {
      await fetch(`/api/integrations/${integration.id}/sync`, { method: 'POST' });
      fetchIntegrations();
    } catch (err) {
      setError('Failed to sync integration');
    }
  };

  const renderConfigurationFields = () => {
    if (!selectedIntegration) return null;

    // Different configuration forms based on integration type
    switch (selectedIntegration.type) {
      case 'slack':
        return (
          <>
            <TextField
              fullWidth
              label="Webhook URL"
              value={configForm.webhookUrl || ''}
              onChange={(e) => setConfigForm({ ...configForm, webhookUrl: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Channel"
              value={configForm.channel || ''}
              onChange={(e) => setConfigForm({ ...configForm, channel: e.target.value })}
              margin="normal"
            />
          </>
        );

      case 'github':
        return (
          <>
            <TextField
              fullWidth
              label="Access Token"
              type="password"
              value={configForm.accessToken || ''}
              onChange={(e) => setConfigForm({ ...configForm, accessToken: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Repository"
              value={configForm.repository || ''}
              onChange={(e) => setConfigForm({ ...configForm, repository: e.target.value })}
              margin="normal"
            />
          </>
        );

      // Add more integration types as needed

      default:
        return (
          <Typography color="text.secondary">
            No configuration options available
          </Typography>
        );
    }
  };

  const IntegrationCard: React.FC<{ integration: Integration }> = ({ integration }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <img
            src={integration.icon}
            alt={integration.name}
            style={{ width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="h6">
              {integration.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {integration.description}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={1} mb={2}>
          {integration.features.map((feature, index) => (
            <Chip
              key={index}
              label={feature}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label={integration.status}
            color={
              integration.status === 'connected'
                ? 'success'
                : integration.status === 'error'
                ? 'error'
                : 'default'
            }
            size="small"
            icon={
              integration.status === 'connected'
                ? <CheckIcon />
                : integration.status === 'error'
                ? <ErrorIcon />
                : undefined
            }
          />
          {integration.lastSync && (
            <Typography variant="caption" color="text.secondary">
              Last sync: {new Date(integration.lastSync).toLocaleString()}
            </Typography>
          )}
        </Box>

        {integration.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {integration.error}
          </Alert>
        )}
      </CardContent>

      <CardActions>
        <Switch
          checked={integration.enabled}
          onChange={() => handleToggleIntegration(integration)}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Sync">
          <IconButton
            onClick={() => handleSync(integration)}
            disabled={!integration.enabled}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="View Logs">
          <IconButton onClick={() => handleViewLogs(integration)}>
            <HistoryIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Configure">
          <IconButton onClick={() => handleConfigureIntegration(integration)}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Integrations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* Handle adding new integration */}}
        >
          Add Integration
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {integrations.map((integration) => (
          <Grid item xs={12} md={6} lg={4} key={integration.id}>
            <IntegrationCard integration={integration} />
          </Grid>
        ))}
      </Grid>

      {/* Configuration Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Configure {selectedIntegration?.name}
        </DialogTitle>
        <DialogContent>
          {renderConfigurationFields()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveConfig}
          >
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog
        open={logDialogOpen}
        onClose={() => setLogDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedIntegration?.name} Logs
        </DialogTitle>
        <DialogContent>
          <List>
            {integrationLogs.map((log) => (
              <ListItem key={log.id}>
                <ListItemText
                  primary={log.event}
                  secondary={
                    <>
                      <Typography variant="body2">
                        {log.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
                <Chip
                  label={log.status}
                  color={log.status === 'success' ? 'success' : 'error'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationManagement;
