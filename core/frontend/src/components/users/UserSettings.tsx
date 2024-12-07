// core/frontend/src/components/users/UserSettings.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { UserSettings as UserSettingsType } from '../../types';

interface UserSettingsProps {
  userId: string;
  settings: UserSettingsType;
  onUpdate: (settings: Partial<UserSettingsType>) => Promise<void>;
}

const UserSettings: React.FC<UserSettingsProps> = ({
  userId,
  settings,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSettingChange = async (key: keyof UserSettingsType, value: any) => {
    try {
      setLoading(true);
      setError(null);
      await onUpdate({ [key]: value });
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notification Preferences
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Email Notifications"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Push Notifications"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Email Digest Frequency</InputLabel>
              <Select
                value={settings.digestFrequency}
                onChange={(e) => handleSettingChange('digestFrequency', e.target.value)}
                disabled={loading}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="never">Never</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Security Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.twoFactorEnabled}
                  onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Two-Factor Authentication"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.loginAlerts}
                  onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Login Alerts"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Display Preferences
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                disabled={loading}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                disabled={loading}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default UserSettings;
