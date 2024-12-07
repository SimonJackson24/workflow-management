// core/frontend/src/components/rbac/withPermission.tsx

import React from 'react';
import { useRBAC } from '../../contexts/RBACContext';

interface WithPermissionProps {
  permissions?: string | string[];
  roles?: string | string[];
  fallback?: React.ReactNode;
}

export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { permissions, roles, fallback = null }: WithPermissionProps
) => {
  return function WithPermissionComponent(props: P) {
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

    return hasAccess() ? <WrappedComponent {...props} /> : <>{fallback}</>;
  };
};
