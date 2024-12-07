// core/frontend/src/components/export/DataExport.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  FormControl,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  TextField,
  Select,
  MenuItem,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface ExportField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}

interface ExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  fields: string[];
  filters: Record<string, any>;
  scheduling?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    day?: number;
    email?: string;
  };
}

interface DataExportProps {
  fields: ExportField[];
  onExport: (options: ExportOptions) => Promise<void>;
  onSchedule?: (options: ExportOptions) => Promise<void>;
}

const DataExport: React.FC<DataExportProps> = ({
  fields,
  onExport,
  onSchedule
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    fields: fields.filter(f => f.required).map(f => f.name),
    filters: {},
    scheduling: {
      frequency: 'once',
      time: '00:00',
      email: ''
    }
  });

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (activeStep === 3 && options.scheduling?.frequency !== 'once') {
        await onSchedule?.(options);
        setSuccess('Export scheduled successfully');
      } else {
        await onExport(options);
        setSuccess('Export completed successfully');
      }
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const renderFormatSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Export Format
      </Typography>
      <RadioGroup
        value={options.format}
        onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
      >
        <FormControlLabel
          value="csv"
          control={<Radio />}
          label="CSV"
        />
        <FormControlLabel
          value="excel"
          control={<Radio />}
          label="Excel"
        />
        <FormControlLabel
          value="json"
          control={<Radio />}
          label="JSON"
        />
        <FormControlLabel
          value="pdf"
          control={<Radio />}
          label="PDF"
        />
      </RadioGroup>
    </Box>
  );

  const renderFieldSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Fields to Export
      </Typography>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} sm={6} key={field.name}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.fields.includes(field.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setOptions({
                        ...options,
                        fields: [...options.fields, field.name]
                      });
                    } else {
                      setOptions({
                        ...options,
                        fields: options.fields.filter(f => f !== field.name)
                      });
                    }
                  }}
                  disabled={field.required}
                />
              }
              label={field.label}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderScheduling = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Schedule Export
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <RadioGroup
          value={options.scheduling?.frequency}
          onChange={(e) => setOptions({
            ...options,
            scheduling: {
              ...options.scheduling,
              frequency: e.target.value as any
            }
          })}
        >
          <FormControlLabel
            value="once"
            control={<Radio />}
            label="Export Once"
          />
          <FormControlLabel
            value="daily"
            control={<Radio />}
            label="Daily Export"
          />
          <FormControlLabel
            value="weekly"
            control={<Radio />}
            label="Weekly Export"
          />
          <FormControlLabel
            value="monthly"
            control={<Radio />}
            label="Monthly Export"
          />
        </RadioGroup>
      </FormControl>

      {options.scheduling?.frequency !== 'once' && (
        <>
          <TextField
            fullWidth
            type="time"
            label="Export Time"
            value={options.scheduling?.time}
            onChange={(e) => setOptions({
              ...options,
              scheduling: {
                ...options.scheduling,
                time: e.target.value
              }
            })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="email"
            label="Email Address"
            value={options.scheduling?.email}
            onChange={(e) => setOptions({
              ...options,
              scheduling: {
                ...options.scheduling,
                email: e.target.value
              }
            })}
          />
        </>
      )}
    </Box>
  );

  const renderConfirmation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Confirm Export
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Format</Typography>
          <Typography>{options.format.toUpperCase()}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Fields</Typography>
          <Typography>{options.fields.length} fields selected</Typography>
        </Grid>
        {options.scheduling?.frequency !== 'once' && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Frequency</Typography>
              <Typography>{options.scheduling?.frequency}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Email</Typography>
              <Typography>{options.scheduling?.email}</Typography>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );

  const steps = [
    {
      label: 'Format',
      content: renderFormatSelection
    },
    {
      label: 'Fields',
      content: renderFieldSelection
    },
    {
      label: 'Schedule',
      content: renderScheduling
    },
    {
      label: 'Confirm',
      content: renderConfirmation
    }
  ];

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          {steps[activeStep].content()}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
            >
              {loading ? 'Processing...' : 'Export'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default DataExport;
