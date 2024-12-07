// core/frontend/src/components/rbac/ProtectedComponent.tsx

import React from 'react';
import { useRBAC } from '../../contexts/RBACContext';

interface ProtectedComponentProps {
  permissions?: string | string[];
  roles?: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  permissions,
  roles,
  children,
  fallback = null
}) => {
  const { checkPermission, checkRole } = useRBAC();

  const hasAccess = () => {
    if (permissions && !checkPermission(permissions)) {
      return false;
    }
    if (roles && !checkRole(roles)) {
      return false;
    }
    return true;
  };

  return hasAccess() ? <>{children}</> : <>{fallback}</>;
};
