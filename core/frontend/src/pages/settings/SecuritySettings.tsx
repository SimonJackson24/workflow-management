// core/frontend/src/pages/settings/SecuritySettings.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import {
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  PhoneAndroid as PhoneIcon,
  Language as DomainIcon
} from '@mui/icons-material';
import { useOrganization } from '../../contexts/OrganizationContext';

interface SecuritySettings {
  mfa: {
    required: boolean;
    methods: ('app' | 'sms' | 'email')[];
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expiryDays: number;
  };
  ipWhitelist: {
    enabled: boolean;
    addresses: string[];
  };
  sessionPolicy: {
    maxDuration: number;
    inactivityTimeout: number;
  };
}

const SecuritySettings: React.FC = () => {
  const { organization, updateSecuritySettings } = useOrganization();
  const [settings, setSettings] = useState<SecuritySettings>({
    mfa: {
      required: organization?.settings?.security?.mfa?.required || false,
      methods: organization?.settings?.security?.mfa?.methods || ['app']
    },
    passwordPolicy: {
      minLength: organization?.settings?.security?.passwordPolicy?.minLength || 8,
      requireUppercase: organization?.settings?.security?.passwordPolicy?.requireUppercase || true,
      requireNumbers: organization?.settings?.security?.passwordPolicy?.requireNumbers || true,
      requireSymbols: organization?.settings?.security?.passwordPolicy?.requireSymbols || true,
      expiryDays: organization?.settings?.security?.passwordPolicy?.expiryDays || 90
    },
    ipWhitelist: {
      enabled: organization?.settings?.security?.ipWhitelist?.enabled || false,
      addresses: organization?.settings?.security?.ipWhitelist?.addresses || []
    },
    sessionPolicy: {
      maxDuration: organization?.settings?.security?.sessionPolicy?.maxDuration || 24,
      inactivityTimeout: organization?.settings?.security?.sessionPolicy?.inactivityTimeout || 30
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ipDialogOpen, setIpDialogOpen] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateSecuritySettings(settings);
      setSuccess('Security settings updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIpAddress = () => {
    if (newIpAddress) {
      setSettings(prev => ({
        ...prev,
        ipWhitelist: {
          ...prev.ipWhitelist,
          addresses: [...prev.ipWhitelist.addresses, newIpAddress]
        }
      }));
      setNewIpAddress('');
      setIpDialogOpen(false);
    }
  };

  const handleRemoveIpAddress = (address: string) => {
    setSettings(prev => ({
      ...prev,
      ipWhitelist: {
        ...prev.ipWhitelist,
        addresses: prev.ipWhitelist.addresses.filter(ip => ip !== address)
      }
    }));
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* MFA Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <SecurityIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Multi-Factor Authentication</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.mfa.required}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    mfa: { ...prev.mfa, required: e.target.checked }
                  }))}
                />
              }
              label="Require MFA for all users"
            />

            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
              When enabled, all users will be required to set up MFA before accessing the system.
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Allowed MFA Methods
            </Typography>
            <Box display="flex" gap={1}>
              {['app', 'sms', 'email'].map((method) => (
                <Chip
                  key={method}
                  label={method.toUpperCase()}
                  color={settings.mfa.methods.includes(method as any) ? 'primary' : 'default'}
                  onClick={() => {
                    setSettings(prev => ({
                      ...prev,
                      mfa: {
                        ...prev.mfa,
                        methods: prev.mfa.methods.includes(method as any)
                          ? prev.mfa.methods.filter(m => m !== method)
                          : [...prev.mfa.methods, method as any]
                      }
                    }));
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Password Policy */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <VpnKeyIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Password Policy</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Length"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    passwordPolicy: {
                      ...prev.passwordPolicy,
                      minLength: Number(e.target.value)
                    }
                  }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Password Expiry (days)"
                  value={settings.passwordPolicy.expiryDays}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    passwordPolicy: {
                      ...prev.passwordPolicy,
                      expiryDays: Number(e.target.value)
                    }
                  }))}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.passwordPolicy.requireUppercase}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireUppercase: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Require uppercase letters"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.passwordPolicy.requireNumbers}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireNumbers: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Require numbers"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.passwordPolicy.requireSymbols}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireSymbols: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Require special characters"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* IP Whitelist */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <DomainIcon sx={{ mr: 1 }} />
              <Typography variant="h6">IP Whitelist</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.ipWhitelist.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ipWhitelist: {
                      ...prev.ipWhitelist,
                      enabled: e.target.checked
                    }
                  }))}
                />
              }
              label="Enable IP Whitelist"
            />

            <Box sx={{ mt: 2 }}>
              {settings.ipWhitelist.addresses.map((address) => (
                <Chip
                  key={address}
                  label={address}
                  onDelete={() => handleRemoveIpAddress(address)}
                  sx={{ m: 0.5 }}
                />
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={() => setIpDialogOpen(true)}
                sx={{ ml: 1 }}
              >
                Add IP Address
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Session Policy */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <PhoneIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Session Policy</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Session Duration (hours)"
                  value={settings.sessionPolicy.maxDuration}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    sessionPolicy: {
                      ...prev.sessionPolicy,
                      maxDuration: Number(e.target.value)
                    }
                  }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Inactivity Timeout (minutes)"
                  value={settings.sessionPolicy.inactivityTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    sessionPolicy: {
                      ...prev.sessionPolicy,
                      inactivityTimeout: Number(e.target.value)
                    }
                  }))}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* IP Address Dialog */}
      <Dialog open={ipDialogOpen} onClose={() => setIpDialogOpen(false)}>
        <DialogTitle>Add IP Address</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="IP Address"
            value={newIpAddress}
            onChange={(e) => setNewIpAddress(e.target.value)}
            placeholder="e.g., 192.168.1.1"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIpDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddIpAddress} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;
