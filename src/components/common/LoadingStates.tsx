// src/components/common/LoadingStates.tsx

import React from 'react';
import { Box, CircularProgress, Skeleton, Typography } from '@mui/material';

// Full Page Loading
export const FullPageLoader: React.FC = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 9999,
    }}
  >
    <Box sx={{ textAlign: 'center' }}>
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Loading...
      </Typography>
    </Box>
  </Box>
);

// Component Loading Skeleton
export const ComponentSkeleton: React.FC = () => (
  <Box sx={{ padding: 2 }}>
    <Skeleton variant="rectangular" width="100%" height={118} />
    <Skeleton variant="text" sx={{ mt: 1 }} />
    <Skeleton variant="text" width="60%" />
  </Box>
);

// Table Loading
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <Box>
    <Skeleton variant="rectangular" height={52} /> {/* Header */}
    {Array(rows).fill(0).map((_, index) => (
      <Skeleton key={index} variant="rectangular" height={52} sx={{ mt: 1 }} />
    ))}
  </Box>
);

// Card Loading
export const CardSkeleton: React.FC = () => (
  <Box sx={{ width: '100%', marginRight: 0.5, my: 5 }}>
    <Skeleton variant="rectangular" width="100%" height={118} />
    <Box sx={{ pt: 0.5 }}>
      <Skeleton />
      <Skeleton width="60%" />
    </Box>
  </Box>
);

// Inline Loading
export const InlineLoader: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <CircularProgress size={20} sx={{ mr: 1 }} />
    <Typography variant="body2">Loading...</Typography>
  </Box>
);
