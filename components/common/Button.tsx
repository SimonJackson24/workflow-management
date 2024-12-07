// components/common/Button.tsx

import React from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress
} from '@mui/material';

interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  icon,
  disabled,
  ...props
}) => {
  return (
    <MuiButton
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} /> : icon}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
