// core/frontend/src/hooks/usePermission.ts

import { useRBAC } from '../contexts/RBACContext';

export const usePermission = (permission: string | string[]) => {
  const { checkPermission, loading, error } = useRBAC();

  return {
    hasPermission: checkPermission(permission),
    loading,
    error
  };
};

// Usage example:
// const { hasPermission } = usePermission('users.create');
