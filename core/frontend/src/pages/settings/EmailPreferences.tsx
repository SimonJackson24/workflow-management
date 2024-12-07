// core/frontend/src/pages/settings/EmailPreferences.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary
} from '@mui/material';
import { useEmailPreferences } from '../../hooks/useEmailPreferences';

const EmailPreferences: React.FC = () => {
  const { preferences, updatePreferences, loading, error } = useEmailPreferences();

  const [formData, setFormData] = useState({
    notifications: {
      security: preferences?.notifications?.security || true,
      updates: preferences?.notifications?.updates || true,
      marketing: preferences?.notifications?.marketing || false,
      newsletter: preferences?.notifications?.newsletter || false
    },
    frequency: {
      digest: preferences?.frequency?.digest || 'daily',
      updates: preferences?.frequency?.updates || 'weekly',
      newsletter: preferences?.frequency?.newsletter || 'monthly'
    },
    format: {
      html: preferences?.format?.html || true,
      plainText: preferences?.format?.plainText || false
    },
    categories: preferences?.categories || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePreferences(formData);
    } catch (err) {
      console.error('Failed to update email preferences:', err);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Email Preferences
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Notification Types */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Types
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notifications.security}
                        onChange={(e) => setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            security: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Security Alerts"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notifications.updates}
                        onChange={(e) => setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            updates: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Product Updates"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notifications.marketing}
                        onChange={(e) => setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            marketing: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Marketing Communications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notifications.newsletter}
                        onChange={(e) => setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            newsletter: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Newsletter"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Email Frequency */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Email Frequency
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Digest Frequency</InputLabel>
                    <Select
                      value={formData.frequency.digest}
                      onChange={(e) => setFormData({
                        ...formData,
                        frequency: {
                          ...formData.frequency,
                          digest: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Updates Frequency</InputLabel>
                    <Select
                      value={formData.frequency.updates}
                      onChange={(e) => setFormData({
                        ...formData,
                        frequency: {
                          ...formData.frequency,
                          updates: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="immediate">Immediate</MenuItem>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Email Format */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Email Format
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.format.html}
                        onChange={(e) => setFormData({
                          ...formData,
                          format: {
                            ...formData.format,
                            html: e.target.checked
                          }
                        })}
                      />
                    }
                    label="HTML Format"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.format.plainText}
                        onChange={(e) => setFormData({
                          ...formData,
                          format: {
                            ...formData.format,
                            plainText: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Plain Text Format"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Categories */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Email Categories
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {formData.categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    onDelete={() => setFormData({
                      ...formData,
                      categories: formData.categories.filter(c => c !== category)
                    })}
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
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EmailPreferences;
