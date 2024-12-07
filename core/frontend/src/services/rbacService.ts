// core/frontend/src/services/rbacService.ts

import { api } from '../utils/api';
import { Role, Permission, RoleHierarchy } from '../types/rbac.types';

export class RBACService {
  async getRoleHierarchy(): Promise<RoleHierarchy> {
    const response = await api.get('/api/rbac/hierarchy');
    return response.data;
  }

  async getAllPermissions(): Promise<Permission[]> {
    const response = await api.get('/api/rbac/permissions');
    return response.data;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const response = await api.get(`/api/rbac/roles/${roleId}/permissions`);
    return response.data;
  }

  async getEffectivePermissions(roleId: string): Promise<Permission[]> {
    const response = await api.get
