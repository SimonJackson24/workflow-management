// src/components/common/ErrorFallback.tsx

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';
import { analytics } from '@/utils/analytics';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  message?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  message = 'Something went wrong'
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (error) {
      analytics.trackError(error);
    }
  }, [error]);

  const handleReset = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleReportError = () => {
    if (error) {
      analytics.trackError(error, { 
        userReported: true,
        location: window.location.href
      });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        p: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center'
        }}
      >
        <ErrorIcon
          sx={{
            fontSize: 64,
            color: theme.palette.error.main,
            mb: 2
          }}
        />
        
        <Typography variant="h5" gutterBottom>
          {message}
        </Typography>

        {error && import.meta.env.DEV && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
              mb: 3,
              p: 2,
              bgcolor: theme.palette.grey[100],
              borderRadius: 1,
              fontFamily: 'monospace',
              wordBreak: 'break-word'
            }}
          >
            {error.message}
            {error.stack && (
              <Box component="pre" sx={{ mt: 1, fontSize: '0.8em' }}>
                {error.stack}
              </Box>
            )}
          </Typography>
        )}

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleReset}
          >
            Try Again
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleReportError}
          >
            Report Error
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
