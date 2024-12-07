// core/frontend/src/pages/users/UserForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Divider,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Autocomplete
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCustomFields } from '../../hooks/useCustomFields';
import { useTeams } from '../../hooks/useTeams';
import { useAccessLevels } from '../../hooks/useAccessLevels';
import { DepartmentSelector } from '../components/DepartmentSelector';
import { RoleSelector } from '../components/RoleSelector';
import { CustomFieldsSection } from '../components/CustomFieldsSection';
import { ValidationRulesSection } from '../components/ValidationRulesSection';

interface UserFormData {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;

  // Organization Details
  department: string;
  team?: string;
  reportingTo?: string;
  employeeId?: string;
  startDate?: Date;

  // Access & Security
  role: string;
  accessLevel: string;
  permissions: string[];
  restrictedAccess: boolean;
  ipRestrictions?: string[];
  timeRestrictions?: {
    enabled: boolean;
    schedule?: {
      days: string[];
      startTime: string;
      endTime: string;
    };
  };

  // Custom Fields
  customFields: Record<string, any>;

  // Notifications & Preferences
  notificationPreferences: {
    email: boolean;
    slack: boolean;
    inApp: boolean;
  };
  systemPreferences: {
    language: string;
    timezone: string;
    theme: string;
  };
}

const UserForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [customValidationRules, setCustomValidationRules] = useState<any[]>([]);
  const { customFields } = useCustomFields();
  const { teams } = useTeams();
  const { accessLevels } = useAccessLevels();

  // Form validation schema
  const validationSchema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    department: yup.string().required('Department is required'),
    role: yup.string().required('Role is required'),
    // Add more validation rules
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      notificationPreferences: {
        email: true,
        slack: false,
        inApp: true
      },
      systemPreferences: {
        language: 'en',
        timezone: 'UTC',
        theme: 'system'
      }
    }
  });

  const steps = [
    'Basic Information',
    'Organization Details',
    'Access & Security',
    'Custom Fields',
    'Preferences'
  ];

  const onSubmit = async (data: UserFormData) => {
    try {
      // Handle form submission
      console.log('Form data:', data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Last Name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>
            {/* Add more basic information fields */}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <DepartmentSelector
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.department}
                    helperText={errors.department?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="team"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={teams}
                    getOptionLabel={(option) => option.name}
                    value={teams.find(team => team.id === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue?.id)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Team"
                        error={!!errors.team}
                        helperText={errors.team?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            {/* Add more organization fields */}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <RoleSelector
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.role}
                    helperText={errors.role?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="accessLevel"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.accessLevel}>
                    <InputLabel>Access Level</InputLabel>
                    <Select {...field}>
                      {accessLevels.map(level => (
                        <MenuItem key={level.id} value={level.id}>
                          {level.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            {/* Add more security fields */}
          </Grid>
        );

      case 3:
        return (
          <CustomFieldsSection
            fields={customFields}
            control={control}
            errors={errors}
          />
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Preferences
              </Typography>
              <Controller
                name="notificationPreferences.email"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Email Notifications"
                  />
                )}
              />
              {/* Add more preference fields */}
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent(activeStep)}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => prev - 1)}
            >
              Back
            </Button>
            <Box>
              <Button
                variant="contained"
                type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                onClick={() => {
                  if (activeStep < steps.length - 1) {
                    setActiveStep((prev) => prev + 1);
                  }
                }}
              >
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default UserForm;
