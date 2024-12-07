// core/frontend/src/components/plugins/installation/PluginInstallationWizard.tsx

import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Plugin } from '../../../types/plugin';

interface InstallationStep {
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  error?: string;
}

interface PluginInstallationWizardProps {
  plugin: Plugin;
  onComplete: () => void;
  onCancel: () => void;
}

const PluginInstallationWizard: React.FC<PluginInstallationWizardProps> = ({
  plugin,
  onComplete,
  onCancel
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const steps: InstallationStep[] = [
    { label: 'System Requirements Check', status: 'pending' },
    { label: 'License Agreement', status: 'pending' },
    { label: 'Dependencies Installation', status: 'pending' },
    { label: 'Configuration', status: 'pending' },
    { label: 'Final Installation', status: 'pending' }
  ];

  const handleNext = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeStep) {
        case 0:
          await checkSystemRequirements();
          break;
        case 1:
          if (!termsAccepted) {
            throw new Error('You must accept the terms and conditions');
          }
          break;
        case 2:
          await installDependencies();
          break;
        case 3:
          await validateConfiguration();
          break;
        case 4:
          await finalizeInstallation();
          break;
      }

      setActiveStep((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkSystemRequirements = async () => {
    const response = await fetch(`/api/plugins/${plugin.id}/requirements`);
    const { compatible, issues } = await response.json();
    
    if (!compatible) {
      throw new Error(`System requirements not met: ${issues.join(', ')}`);
    }
  };

  const installDependencies = async () => {
    const response = await fetch(`/api/plugins/${plugin.id}/dependencies`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to install dependencies');
    }
  };

  const validateConfiguration = async () => {
    const response = await fetch(`/api/plugins/${plugin.id}/validate-config`, {
      method: 'POST',
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      throw new Error('Invalid configuration');
    }
  };

  const finalizeInstallation = async () => {
    const response = await fetch(`/api/plugins/${plugin.id}/install`, {
      method: 'POST',
      body: JSON.stringify({ config })
    });
    
    if (!response.ok) {
      throw new Error('Installation failed');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <SystemRequirementsCheck plugin={plugin} />
        );
      case 1:
        return (
          <LicenseAgreement
            plugin={plugin}
            accepted={termsAccepted}
            onAccept={setTermsAccepted}
          />
        );
      case 2:
        return (
          <DependencyInstallation plugin={plugin} />
        );
      case 3:
        return (
          <PluginConfiguration
            plugin={plugin}
            config={config}
            onChange={setConfig}
          />
        );
      case 4:
        return (
          <InstallationSummary plugin={plugin} config={config} />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Installing {plugin.name}
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              error={step.status === 'error'}
              optional={step.error && (
                <Typography variant="caption" color="error">
                  {step.error}
                </Typography>
              )}
            >
              {step.label}
            </StepLabel>
            <StepContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {renderStepContent(index)}
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={loading || (index === 1 && !termsAccepted)}
                >
                  {loading ? <CircularProgress size={24} /> : 
                    index === steps.length - 1 ? 'Finish' : 'Continue'}
                </Button>
                <Button
                  onClick={onCancel}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>Installation completed successfully!</Typography>
          <Button onClick={onComplete} sx={{ mt: 1, mr: 1 }}>
            Go to Plugin Settings
          </Button>
        </Paper>
      )}
    </Box>
  );
};

// Sub-components
const SystemRequirementsCheck: React.FC<{ plugin: Plugin }> = ({ plugin }) => (
  <List>
    {plugin.metadata.requirements.map((req, index) => (
      <ListItem key={index}>
        <ListItemIcon>
          {req.met ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
        </ListItemIcon>
        <ListItemText
          primary={req.name}
          secondary={req.description}
        />
      </ListItem>
    ))}
  </List>
);

const LicenseAgreement: React.FC<{
  plugin: Plugin;
  accepted: boolean;
  onAccept: (accepted: boolean) => void;
}> = ({ plugin, accepted, onAccept }) => (
  <Box>
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        maxHeight: 300,
        overflow: 'auto',
        mb: 2
      }}
    >
      <Typography variant="body2">
        {plugin.metadata.license.text}
      </Typography>
    </Paper>
    <FormControlLabel
      control={
        <Checkbox
          checked={accepted}
          onChange={(e) => onAccept(e.target.checked)}
        />
      }
      label="I accept the terms and conditions"
    />
  </Box>
);

const DependencyInstallation: React.FC<{ plugin: Plugin }> = ({ plugin }) => (
  <List>
    {plugin.dependencies.map((dep, index) => (
      <ListItem key={index}>
        <ListItemIcon>
          <CheckIcon color="success" />
        </ListItemIcon>
        <ListItemText
          primary={dep.name}
          secondary={`v${dep.version}`}
        />
      </ListItem>
    ))}
  </List>
);

const PluginConfiguration: React.FC<{
  plugin: Plugin;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}> = ({ plugin, config, onChange }) => (
  <Box>
    {Object.entries(plugin.configuration?.schema || {}).map(([key, schema]) => (
      <TextField
        key={key}
        fullWidth
        label={schema.label}
        helperText={schema.description}
        value={config[key] || ''}
        onChange={(e) => onChange({ ...config, [key]: e.target.value })}
        margin="normal"
      />
    ))}
  </Box>
);

const InstallationSummary: React.FC<{
  plugin: Plugin;
  config: Record<string, any>;
}> = ({ plugin, config }) => (
  <Box>
    <Typography variant="subtitle1" gutterBottom>
      Configuration Summary
    </Typography>
    <List>
      {Object.entries(config).map(([key, value]) => (
        <ListItem key={key}>
          <ListItemText
            primary={key}
            secondary={value.toString()}
          />
        </ListItem>
      ))}
    </List>
  </Box>
);

export default PluginInstallationWizard;
