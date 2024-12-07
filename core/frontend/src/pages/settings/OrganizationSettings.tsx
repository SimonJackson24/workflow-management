// core/frontend/src/pages/settings/OrganizationSettings.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { CountrySelect } from '../../components/common/CountrySelect';
import { TimezoneSelect } from '../../components/common/TimezoneSelect';

const OrganizationSettings: React.FC = () => {
  const { organization } = useAuth();
  const { updateOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    email: organization?.email || '',
    phone: organization?.phone || '',
    website: organization?.website || '',
    timezone: organization?.timezone || '',
    country: organization?.address?.country || '',
    address: {
      street: organization?.address?.street || '',
      city: organization?.address?.city || '',
      state: organization?.address?.state || '',
      postalCode: organization?.address?.postalCode || ''
    },
    settings: {
      language: organization?.settings?.language || 'en',
      dateFormat: organization?.settings?.dateFormat || 'YYYY-MM-DD',
      notifications: {
        email: organization?.settings?.notifications?.email || true,
        slack: organization?.settings?.notifications?.slack || false
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateOrganization(formData);
      setSuccess('Organization settings updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update organization settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Organization Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Organization Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TimezoneSelect
                value={formData.timezone}
                onChange={(timezone) => setFormData({ ...formData, timezone })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CountrySelect
                value={formData.country}
                onChange={(country) => setFormData({ ...formData, country })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Address
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value }
                })}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.address.state}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value }
                })}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.address.postalCode}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, postalCode: e.target.value }
                })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Preferences
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={formData.settings.language}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, language: e.target.value }
                  })}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  {/* Add more languages */}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={formData.settings.dateFormat}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, dateFormat: e.target.value }
                  })}
                >
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Notifications
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.notifications.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        notifications: {
                          ...formData.settings.notifications,
                          email: e.target.checked
                        }
                      }
                    })}
                  />
                }
                label="Email Notifications"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.notifications.slack}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        notifications: {
                          ...formData.settings.notifications,
                          slack: e.target.checked
                        }
                      }
                    })}
                  />
                }
                label="Slack Notifications"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
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

export default OrganizationSettings;
