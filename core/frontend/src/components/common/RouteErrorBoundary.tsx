// core/frontend/src/components/common/RouteErrorBoundary.tsx

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button, Typography, Box } from '@mui/material';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="400px"
    >
      <Typography variant="h5" gutterBottom>
        Something went wrong:
      </Typography>
      <Typography color="error" gutterBottom>
        {error.message}
      </Typography>
      <Button onClick={resetErrorBoundary} variant="contained">
        Try again
      </Button>
    </Box>
  );
};

export const RouteErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
