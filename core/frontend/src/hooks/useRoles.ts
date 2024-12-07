// core/frontend/src/hooks/useRoles.ts

import { useState, useEffect } from 'react';
import { roleService } from '../services/roleService';
import { Role, RoleFormData } from '../types/role.types';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getRoles();
      setRoles(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: RoleFormData): Promise<Role> => {
    try {
      setLoading(true);
      const newRole = await roleService.createRole(roleData);
      setRoles([...roles, newRole]);
      setError(null);
      return newRole;
    } catch (err: any) {
      setError(err.message || 'Failed to create role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (roleId: string, roleData: Partial<RoleFormData>): Promise<Role> => {
    try {
      setLoading(true);
      const updatedRole = await roleService.updateRole(roleId, roleData);
      setRoles(roles.map(role => role.id === roleId ? updatedRole : role));
      setError(null);
      return updatedRole;
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (roleId: string): Promise<void> => {
    try {
      setLoading(true);
      await roleService.deleteRole(roleId);
      setRoles(roles.filter(role => role.id !== roleId));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete role');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    roles,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    refreshRoles: fetchRoles
  };
};
