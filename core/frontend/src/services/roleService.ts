// core/frontend/src/services/roleService.ts

import { api } from '../utils/api';
import { Role, RoleFormData } from '../types/role.types';

export const roleService = {
  async getRoles(): Promise<Role[]> {
    const response = await api.get('/api/roles');
    return response.data;
  },

  async getRole(roleId: string): Promise<Role> {
    const response = await api.get(`/api/roles/${roleId}`);
    return response.data;
  },

  async createRole(roleData: RoleFormData): Promise<Role> {
    const response = await api.post('/api/roles', roleData);
    return response.data;
  },

  async updateRole(roleId: string, roleData: Partial<RoleFormData>): Promise<Role> {
    const response = await api.put(`/api/roles/${roleId}`, roleData);
    return response.data;
  },

  async deleteRole(roleId: string): Promise<void> {
    await api.delete(`/api/roles/${roleId}`);
  },

  async assignUserRole(userId: string, roleId: string): Promise<void> {
    await api.post(`/api/users/${userId}/roles`, { roleId });
  },

  async removeUserRole(userId: string, roleId: string): Promise<void> {
    await api.delete(`/api/users/${userId}/roles/${roleId}`);
  },

  async getRoleUsers(roleId: string): Promise<string[]> {
    const response = await api.get(`/api/roles/${roleId}/users`);
    return response.data;
  }
};
