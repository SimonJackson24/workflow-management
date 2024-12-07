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
    const response = await api.get(`/api/rbac/roles/${roleId}/effective-permissions`);
    return response.data;
  }

  async updateRoleHierarchy(roleId: string, parentId: string | null): Promise<void> {
    await api.put(`/api/rbac/roles/${roleId}/parent`, { parentId });
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await api.post(`/api/rbac/roles/${roleId}/permissions`, { permissionId });
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await api.delete(`/api/rbac/roles/${roleId}/permissions/${permissionId}`);
  }

  async createRole(role: Partial<Role>): Promise<Role> {
    const response = await api.post('/api/rbac/roles', role);
    return response.data;
  }

  async updateRole(roleId: string, role: Partial<Role>): Promise<Role> {
    const response = await api.put(`/api/rbac/roles/${roleId}`, role);
    return response.data;
  }

  async deleteRole(roleId: string): Promise<void> {
    await api.delete(`/api/rbac/roles/${roleId}`);
  }
}

export const rbacService = new RBACService();
