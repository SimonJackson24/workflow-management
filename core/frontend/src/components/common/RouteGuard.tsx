// core/frontend/src/components/common/RouteGuard.tsx

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import LoadingScreen from '../common/LoadingScreen';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requiredPermissions 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasPermissions, loading: permissionsLoading } = usePermissions();

  if (authLoading || permissionsLoading) {
    return <LoadingScreen />;
  }

  if (requiredPermissions && !hasPermissions(requiredPermissions)) {
    return <UnauthorizedAccess />;
  }

  return <>{children}</>;
};

// Update PrivateRoute to use RouteGuard
const PrivateRoute: React.FC<{ 
  children: React.ReactNode;
  permissions?: string[];
}> = ({ children, permissions }) => {
  return (
    <RouteGuard requiredPermissions={permissions}>
      {children}
    </RouteGuard>
  );
};
