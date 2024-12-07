// core/frontend/src/components/layout/Header.tsx

import React from 'react';
import {
  Box,
  Breadcrumbs,
  Typography,
  Button,
  useTheme,
  Link,
  Chip
} from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, actions }) => {
  const theme = useTheme();
  const location = useLocation();
  const { organization } = useAuth();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      const isLast = index === paths.length - 1;
      
      return isLast ? (
        <Typography key={url} color="text.primary" sx={{ textTransform: 'capitalize' }}>
          {path.replace('-', ' ')}
        </Typography>
      ) : (
        <Link
          key={url}
          component={RouterLink}
          to={url}
          color="inherit"
          sx={{ textTransform: 'capitalize' }}
        >
          {path.replace('-', ' ')}
        </Link>
      );
    });
  };

  return (
    <Box
      sx={{
        py: 2,
        px: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box>
        <Breadcrumbs>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          {getBreadcrumbs()}
        </Breadcrumbs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
          <Typography variant="h5">
            {title || getBreadcrumbs().pop()}
          </Typography>
          {organization?.subscription?.planId && (
            <Chip
              label={organization.subscription.planId}
              color="primary"
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          )}
        </Box>
      </Box>
      
      {actions && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default Header;
