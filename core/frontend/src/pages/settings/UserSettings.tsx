// core/frontend/src/pages/settings/UserSettings.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import { TimezoneSelect } from '../../components/common/TimezoneSelect';
import { LanguageSelect } from '../../components/common/LanguageSelect';
import { ThemeSelector } from '../../components/common/ThemeSelector';
import { useUserSettings } from '../../hooks/useUserSettings';

const UserSettings: React.FC = () => {
  const { settings, updateSettings, loading, error } = useUserSettings();
  const [formData, setFormData] = useState({
    appearance: {
      theme: settings?.appearance?.theme || 'system',
      density: settings?.appearance?.density || 'comfortable',
      fontSize: settings?.appearance?.fontSize || 'medium',
      colorBlindMode: settings?.appearance?.colorBlindMode || false
    },
    locale: {
      language: settings?.locale?.language || 'en',
      timezone: settings?.locale?.timezone || 'UTC',
      dateFormat: settings?.locale?.dateFormat || 'YYYY-MM-DD',
      timeFormat: settings?.locale?.timeFormat || '24h'
    },
    accessibility: {
      screenReader: settings?.accessibility?.screenReader || false,
      highContrast: settings?.accessibility?.highContrast || false,
      reducedMotion: settings?.accessibility?.reducedMotion || false
    },
    dashboard: {
      defaultView: settings?.dashboard?.defaultView || 'overview',
      widgets: settings?.dashboard?.widgets || []
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Appearance Settings */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Appearance
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <ThemeSelector
                value={formData.appearance.theme}
                onChange={(theme) => setFormData({
                  ...formData,
                  appearance: { ...formData.appearance, theme }
                })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Density</InputLabel>
                <Select
                  value={formData.appearance.density}
                  onChange={(e) => setFormData({
                    ...formData,
                    appearance: { ...formData.appearance, density: e.target.value }
                  })}
                >
                  <MenuItem value="comfortable">Comfortable</MenuItem>
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Font Size</InputLabel>
                <Select
                  value={formData.appearance.fontSize}
                  onChange={(e) => setFormData({
                    ...formData,
                    appearance: { ...formData.appearance, fontSize: e.target.value }
                  })}
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Locale Settings */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Locale & Time
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <LanguageSelect
                value={formData.locale.language}
                onChange={(language) => setFormData({
                  ...formData,
                  locale: { ...formData.locale, language }
                })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TimezoneSelect
                value={formData.locale.timezone}
                onChange={(timezone) => setFormData({
                  ...formData,
                  locale: { ...formData.locale, timezone }
                })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={formData.locale.dateFormat}
                  onChange={(e) => setFormData({
                    ...formData,
                    locale: { ...formData.locale, dateFormat: e.target.value }
                  })}
                >
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Time Format</InputLabel>
                <Select
                  value={formData.locale.timeFormat}
                  onChange={(e) => setFormData({
                    ...formData,
                    locale: { ...formData.locale, timeFormat: e.target.value }
                  })}
                >
                  <MenuItem value="12h">12 Hour</MenuItem>
                  <MenuItem value="24h">24 Hour</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Accessibility Settings */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Accessibility
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.accessibility.screenReader}
                    onChange={(e) => setFormData({
                      ...formData,
                      accessibility: {
                        ...formData.accessibility,
                        screenReader: e.target.checked
                      }
                    })}
                  />
                }
                label="Screen Reader Support"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.accessibility.highContrast}
                    onChange={(e) => setFormData({
                      ...formData,
                      accessibility: {
                        ...formData.accessibility,
                        highContrast: e.target.checked
                      }
                    })}
                  />
                }
                label="High Contrast Mode"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.accessibility.reducedMotion}
                    onChange={(e) => setFormData({
                      ...formData,
                      accessibility: {
                        ...formData.accessibility,
                        reducedMotion: e.target.checked
                      }
                    })}
                  />
                }
                label="Reduced Motion"
              />
            </Grid>

            {/* Dashboard Preferences */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Dashboard Preferences
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default View</InputLabel>
                <Select
                  value={formData.dashboard.defaultView}
                  onChange={(e) => setFormData({
                    ...formData,
                    dashboard: { ...formData.dashboard, defaultView: e.target.value }
                  })}
                >
                  <MenuItem value="overview">Overview</MenuItem>
                  <MenuItem value="analytics">Analytics</MenuItem>
                  <MenuItem value="activity">Activity</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Visible Widgets
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {formData.dashboard.widgets.map((widget) => (
                  <Chip
                    key={widget}
                    label={widget}
                    onDelete={() => {
                      setFormData({
                        ...formData,
                        dashboard: {
                          ...formData.dashboard,
                          widgets: formData.dashboard.widgets.filter(w => w !== widget)
                        }
                      });
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default UserSettings;
