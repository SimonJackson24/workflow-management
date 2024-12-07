// core/frontend/src/pages/settings/OrganizationSettings.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useOrganization } from '../../hooks/useOrganization';
import { CountrySelect } from '../../components/common/CountrySelect';
import { TimezoneSelect } from '../../components/common/TimezoneSelect';
import { BrandingUpload } from '../../components/settings/BrandingUpload';

const OrganizationSettings: React.FC = () => {
  const { organization, updateOrganization, loading, error } = useOrganization();
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    email: organization?.email || '',
    phone: organization?.phone || '',
    website: organization?.website || '',
    address: {
      street: organization?.address?.street || '',
      city: organization?.address?.city || '',
      state: organization?.address?.state || '',
      postalCode: organization?.address?.postalCode || '',
      country: organization?.address?.country || ''
    },
    branding: {
      logo: organization?.branding?.logo || '',
      colors: {
        primary: organization?.branding?.colors?.primary || '#1976d2',
        secondary: organization?.branding?.colors?.secondary || '#dc004e'
      },
      favicon: organization?.branding?.favicon || ''
    },
    settings: {
      timezone: organization?.settings?.timezone || 'UTC',
      dateFormat: organization?.settings?.dateFormat || 'YYYY-MM-DD',
      language: organization?.settings?.language || 'en',
      currency: organization?.settings?.currency || 'USD'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOrganization(formData);
    } catch (err) {
      console.error('Failed to update organization:', err);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Organization Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

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

            {/* Address */}
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
              <CountrySelect
                value={formData.address.country}
                onChange={(value) => setFormData({
                  ...formData,
                  address: { ...formData.address, country: value }
                })}
              />
            </Grid>

            {/* Branding */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Branding
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <BrandingUpload
                logo={formData.branding.logo}
                favicon={formData.branding.favicon}
                onLogoChange={(url) => setFormData({
                  ...formData,
                  branding: { ...formData.branding, logo: url }
                })}
                onFaviconChange={(url) => setFormData({
                  ...formData,
                  branding: { ...formData.branding, favicon: url }
                })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Primary Color"
                type="color"
                value={formData.branding.colors.primary}
                onChange={(e) => setFormData({
                  ...formData,
                  branding: {
                    ...formData.branding,
                    colors: { ...formData.branding.colors, primary: e.target.value }
                  }
                })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Secondary Color"
                type="color"
                value={formData.branding.colors.secondary}
                onChange={(e) => setFormData({
                  ...formData,
                  branding: {
                    ...formData.branding,
                    colors: { ...formData.branding.colors, secondary: e.target.value }
                  }
                })}
              />
            </Grid>

            {/* Preferences */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Preferences
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TimezoneSelect
                value={formData.settings.timezone}
                onChange={(value) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, timezone: value }
                })}
              />
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
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={formData.settings.currency}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, currency: e.target.value }
                  })}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                </Select>
              </FormControl>
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

export default OrganizationSettings;
