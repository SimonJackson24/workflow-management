// core/frontend/src/components/plugins/PluginConfigDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Plugin, PluginConfig } from '../../types/plugin';

interface PluginConfigDialogProps {
  open: boolean;
  onClose: () => void;
  plugin: Plugin | null;
  onSave: (config: Record<string, any>) => Promise<void>;
}

const PluginConfigDialog: React.FC<PluginConfigDialogProps> = ({
  open,
  onClose,
  plugin,
  onSave
}) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plugin) {
      setConfig(plugin.configuration?.settings || {});
    }
  }, [plugin]);

  const handleChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSave(config);
      onClose();
    } catch (err) {
      setError('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const renderConfigField = (key: string, schema: any) => {
    switch (schema.type) {
      case 'string':
        return schema.enum ? (
          <FormControl fullWidth margin="normal">
            <InputLabel>{key}</InputLabel>
            <Select
              value={config[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              label={key}
            >
              {schema.enum.map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            fullWidth
            label={key}
            value={config[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            helperText={schema.description}
            margin="normal"
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={key}
            value={config[key] || ''}
            onChange={(e) => handleChange(key, parseFloat(e.target.value))}
            helperText={schema.description}
            inputProps={{
              min: schema.minimum,
              max: schema.maximum
            }}
            margin="normal"
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={config[key] || false}
                onChange={(e) => handleChange(key, e.target.checked)}
              />
            }
            label={key}
          />
        );

      case 'array':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {key}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {(config[key] || []).map((item: string, index: number) => (
                <Chip
                  key={index}
                  label={item}
                  onDelete={() => {
                    const newArray = [...config[key]];
                    newArray.splice(index, 1);
                    handleChange(key, newArray);
                  }}
                />
              ))}
              <TextField
                size="small"
                placeholder="Add item..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    handleChange(key, [...(config[key] || []), input.value]);
                    input.value = '';
                  }
                }}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!plugin) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Configure {plugin.name}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {Object.entries(plugin.configuration?.schema || {}).map(([category, fields]) => (
          <Accordion key={category} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{category}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {Object.entries(fields).map(([key, schema]) => (
                <Box key={key}>
                  {renderConfigField(key, schema)}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PluginConfigDialog;
