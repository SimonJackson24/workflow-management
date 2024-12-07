// core/frontend/src/components/dashboard/ErrorBoundary.tsx

import React, { Component, ErrorInfo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            m: 2
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            {this.state.error?.message || 'An error occurred in the dashboard'}
          </Alert>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            We apologize for the inconvenience. Please try refreshing the dashboard.
          </Typography>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={this.handleRetry}
          >
            Retry
          </Button>
        </Paper>
      );
    }

    return this.props.children;
  }
}
