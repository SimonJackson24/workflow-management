// core/frontend/src/components/auth/ForgotPasswordForm.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Email } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required')
});

export const ForgotPasswordForm: React.FC = () => {
  const { sendPasswordResetEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      await sendPasswordResetEmail(data.email);
      setSuccess('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 4,
          maxWidth: 400,
          mx: 'auto'
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Forgot Password
        </Typography>

        <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
          Enter your email address and we'll send you instructions to reset your password.
        </Typography>

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

        <TextField
          label="Email"
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            )
          }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link to="/login">
            <Typography variant="body2" color="primary">
              Back to Login
            </Typography>
          </Link>
        </Box>
      </Box>
    </Paper>
  );
};
