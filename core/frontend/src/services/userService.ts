// core/frontend/src/services/userService.ts

import { api } from '../utils/api';
import { User, UserFormData } from '../types/user.types';

export const userService = {
  async getUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<{ users: User[]; total: number }> {
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  async createUser(userData: UserFormData): Promise<User> {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  async updateUser(id: string, userData: Partial<UserFormData>): Promise<User> {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },

  async updateUserStatus(id: string, status: string): Promise<User> {
    const response = await api.put(`/api/users/${id}/status`, { status });
    return response.data;
  },

  async inviteUser(email: string, role: string): Promise<void> {
    await api.post('/api/users/invite', { email, role });
  },

  async resendInvitation(userId: string): Promise<void> {
    await api.post(`/api/users/${userId}/resend-invitation`);
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post(`/api/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
  }
};

// core/frontend/src/services/permissionService.ts

import { api } from '../utils/api';
import { Permission } from '../types/permission.types';

export const permissionService = {
  async getAllPermissions(): Promise<Permission[]> {
    const response = await api.get('/api/permissions');
    return response.data;
  },

  async getUserPermissions(userId: string): Promise<string[]> {
    const response = await api.get(`/api/users/${userId}/permissions`);
    return response.data;
  },

  async updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
    await api.put(`/api/users/${userId}/permissions`, { permissions });
  },

  async getRolePermissions(role: string): Promise<Permission[]> {
    const response = await api.get(`/api/roles/${role}/permissions`);
    return response.data;
  },

  async updateRolePermissions(role: string, permissions: string[]): Promise<void> {
    await api.put(`/api/roles/${role}/permissions`, { permissions });
  }
};
