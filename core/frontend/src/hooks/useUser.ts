// core/frontend/src/hooks/useUser.ts

import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User, UserFormData } from '../types/user.types';

export const useUser = (userId?: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchUser = async (id: string) => {
    try {
      setLoading(true);
      const data = await userService.getUser(id);
      setUser(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: UserFormData) => {
    try {
      setLoading(true);
      const newUser = await userService.createUser(userData);
      setError(null);
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, userData: Partial<UserFormData>) => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateUser(id, userData);
      setUser(updatedUser);
      setError(null);
      return updatedUser;
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setLoading(true);
      await userService.deleteUser(id);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUser: () => userId && fetchUser(userId)
  };
};

// core/frontend/src/hooks/usePermissions.ts

import { useState, useEffect } from 'react';
import { permissionService } from '../services/permissionService';
import { Permission } from '../types/permission.types';

export const usePermissions = (userId: string) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
    fetchUserPermissions();
  }, [userId]);

  const fetchPermissions = async () => {
    try {
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permissions');
    }
  };

  const fetchUserPermissions = async () => {
    try {
      const data = await permissionService.getUserPermissions(userId);
      setUserPermissions(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user permissions');
    } finally {
      setLoading(false);
    }
  };

  const updatePermissions = async (userId: string, permissions: string[]) => {
    try {
      setLoading(true);
      await permissionService.updateUserPermissions(userId, permissions);
      setUserPermissions(permissions);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update permissions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    permissions,
    userPermissions,
    loading,
    error,
    updatePermissions,
    refreshPermissions: fetchUserPermissions
  };
};
