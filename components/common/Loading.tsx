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
