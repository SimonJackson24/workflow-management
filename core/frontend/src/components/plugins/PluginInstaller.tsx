// core/frontend/src/components/plugins/PluginInstaller.tsx

import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Divider
} from '@mui/material';
import { usePluginInstaller } from '../../hooks/usePluginInstaller';

interface PluginInstallerProps {
  pluginId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const steps = [
  'Verify Requirements',
  'Review Permissions',
  'Configure Settings',
  'Install Plugin'
];

export const PluginInstaller: React.FC<PluginInstallerProps> = ({
  pluginId,
  onComplete,
  onCancel
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const {
    plugin,
    requirements,
    permissions,
    loading,
    error,
    installPlugin,
    verifyRequirements,
    checkPermissions
  } = usePluginInstaller(pluginId);

  const [configData, setConfigData] = useState({});
  const [acceptedPermissions, setAcceptedPermissions] = useState<string[]>([]);

  const handleNext = async () => {
    try {
      switch (activeStep) {
        case 0:
          await verifyRequirements();
          break;
        case 1:
          if (acceptedPermissions.length !== permissions.length) {
            throw new Error('All permissions must be accepted');
          }
          break;
        case 2:
          // Validate configuration
          break;
        case 3:
          await installPlugin(configData);
          onComplete();
          return;
      }
      setActiveStep((prev) => prev + 1);
    } catch (err) {
      console.error('Installation step failed:', err);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              System Requirements
            </Typography>
            <List>
              {requirements.map((req) => (
                <ListItem key={req.name}>
                  <ListItemText
                    primary={req.name}
                    secondary={req.description}
                  />
                  {req.satisfied ? (
                    <Alert severity="success" sx={{ ml: 2 }}>
                      Satisfied
                    </Alert>
                  ) : (
                    <Alert severity="error" sx={{ ml: 2 }}>
                      Not Satisfied
                    </Alert>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Required Permissions
            </Typography>
            <List>
              {permissions.map((permission) => (
                <ListItem key={permission.name}>
                  <Checkbox
                    checked={acceptedPermissions.includes(permission.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAcceptedPermissions([...acceptedPermissions, permission.name]);
                      } else {
                        setAcceptedPermissions(
                          acceptedPermissions.filter((p) => p !== permission.name)
                        );
                      }
                    }}
                  />
                  <ListItemText
                    primary={permission.name}
                    secondary={permission.description}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Plugin Configuration
            </Typography>
            {/* Render dynamic configuration form based on plugin.configSchema */}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Installing Plugin
            </Typography>
            {loading ? (
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={20} />
                <Typography>Installing...</Typography>
              </Box>
            ) : (
              <Alert severity="success">
                Ready to install {plugin.name}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderStepContent(activeStep)}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={loading}
        >
          {activeStep === steps.length - 1 ? 'Install' : 'Next'}
        </Button>
      </Box>
    </Paper>
  );
};
