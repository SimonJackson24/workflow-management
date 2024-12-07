// core/frontend/src/components/plugins/PluginConfiguration.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip
} from '@mui/material';
import { usePluginConfig } from '../../hooks/usePluginConfig';

interface PluginConfigurationProps {
  pluginId: string;
  onSave: (config: any) => void;
  onCancel: () => void;
}

export const PluginConfiguration: React.FC<PluginConfigurationProps> = ({
  pluginId,
  onSave,
  onCancel
}) => {
  const {
    config,
    schema,
    loading,
    error,
    validateConfig,
    loadConfig
  } = usePluginConfig(pluginId);

  const [formData, setFormData] = useState(config);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConfig();
  }, [pluginId]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedConfig = await validateConfig(formData);
      onSave(validatedConfig);
    } catch (err: any) {
      setValidationErrors(err.errors || {});
    }
  };

  const renderConfigField = (field: any) => {
    switch (field.type) {
      case 'string':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            error={!!validationErrors[field.name]}
            helperText={validationErrors[field.name]}
            required={field.required}
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={formData[field.name] || false}
                onChange={(e) => handleChange(field.name, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              error={!!validationErrors[field.name]}
            >
              {field.options.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'array':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {field.label}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {(formData[field.name] || []).map((item: string, index: number) => (
                <Chip
                  key={index}
                  label={item}
                  onDelete={() => {
                    const newArray = [...formData[field.name]];
                    newArray.splice(index, 1);
                    handleChange(field.name, newArray);
                  }}
                />
              ))}
            </Box>
            <TextField
              fullWidth
              placeholder={`Add ${field.label}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const newArray = [...(formData[field.name] || []), input.value];
                  handleChange(field.name, newArray);
                  input.value = '';
                }
              }}
              sx={{ mt: 1 }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <Box>Loading configuration...</Box>;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Plugin Configuration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {schema.fields.map((field: any) => (
            <Grid item xs={12} key={field.name}>
              {renderConfigField(field)}
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            Save Configuration
          </Button>
        </Box>
      </form>
    </Paper>
  );
};
