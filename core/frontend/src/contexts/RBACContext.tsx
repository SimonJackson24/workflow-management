// core/frontend/src/contexts/RBACContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Permission } from '../types/permission.types';
import { roleService } from '../services/roleService';

interface RBACContextType {
  userPermissions: Set<string>;
  userRoles: Set<string>;
  checkPermission: (permission: string | string[]) => boolean;
  checkRole: (role: string | string[]) => boolean;
  loading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());
  const [userRoles, setUserRoles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPermissions = async () => {
    if (!user) {
      setUserPermissions(new Set());
      setUserRoles(new Set());
      return;
    }

    try {
      setLoading(true);
      const [permissions, roles] = await Promise.all([
        roleService.getUserPermissions(user.id),
        roleService.getUserRoles(user.id)
      ]);

      setUserPermissions(new Set(permissions));
      setUserRoles(new Set(roles));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [user]);

  const checkPermission = (permission: string | string[]): boolean => {
    if (Array.isArray(permission)) {
      return permission.some(p => userPermissions.has(p));
    }
    return userPermissions.has(permission);
  };

  const checkRole = (role: string | string[]): boolean => {
    if (Array.isArray(role)) {
      return role.some(r => userRoles.has(r));
    }
    return userRoles.has(role);
  };

  return (
    <RBACContext.Provider
      value={{
        userPermissions,
        userRoles,
        checkPermission,
        checkRole,
        loading,
        error,
        refreshPermissions: fetchUserPermissions
      }}
    >
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within a RBACProvider');
  }
  return context;
};
