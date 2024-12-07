// components/common/Input.tsx

import React from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface InputProps extends Omit<TextFieldProps, 'variant'> {
  label: string;
  error?: boolean;
  helperText?: string;
  type?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  type = 'text',
  icon,
  showPasswordToggle,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const inputType = showPasswordToggle
    ? showPassword ? 'text' : 'password'
    : type;

  return (
    <TextField
      variant="outlined"
      fullWidth
      label={label}
      error={error}
      helperText={helperText}
      type={inputType}
      InputProps={{
        startAdornment: icon && (
          <InputAdornment position="start">{icon}</InputAdornment>
        ),
        endAdornment: showPasswordToggle && (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleTogglePassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        )
      }}
      {...props}
    />
  );
};

// components/common/Card.tsx

import React from 'react';
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  IconButton,
  Skeleton
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  actions?: React.ReactNode;
  menu?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  loading = false,
  actions,
  menu,
  headerAction,
  children,
  ...props
}) => {
  if (loading) {
    return (
      <MuiCard {...props}>
        <CardHeader
          title={<Skeleton animation="wave" height={10} width="80%" />}
          subheader={<Skeleton animation="wave" height={10} width="40%" />}
        />
        <CardContent>
          <Skeleton animation="wave" height={100} />
        </CardContent>
      </MuiCard>
    );
  }

  return (
    <MuiCard {...props}>
      {(title || subtitle) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={
            headerAction || (menu && (
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            ))
          }
        />
      )}
      <CardContent>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  );
};

// components/common/Modal.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  useTheme
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  children
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};

// components/common/Loading.tsx

import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress
} from '@mui/material';

interface LoadingProps {
  type?: 'circular' | 'linear';
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  type = 'circular',
  message = 'Loading...',
  fullScreen = false
}) => {
  const content = (
    <>
      {type === 'circular' ? (
        <CircularProgress />
      ) : (
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <LinearProgress />
        </Box>
      )}
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          zIndex: 9999
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}
    >
      {content}
    </Box>
  );
};

// components/common/ErrorBoundary.tsx

import React, { Component, ErrorInfo } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message}
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Box
              component="pre"
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                overflow: 'auto',
                maxWidth: '100%'
              }}
            >
              <code>
                {this.state.error?.stack}
                {this.state.errorInfo?.componentStack}
              </code>
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReset}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
