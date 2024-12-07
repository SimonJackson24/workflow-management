// core/frontend/src/components/rbac/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRBAC } from '../../contexts/RBACContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  permissions?: string | string[];
  roles?: string | string[];
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  permissions,
  roles,
  children,
  redirectTo = '/unauthorized'
}) => {
  const { isAuthenticated } = useAuth();
  const { checkPermission, checkRole, loading } = useRBAC();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  const hasAccess = () => {
    if (permissions && !checkPermission(permissions)) {
      return false;
    }
    if (roles && !checkRole(roles)) {
      return false;
    }
    return true;
  };

  if (!hasAccess()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
