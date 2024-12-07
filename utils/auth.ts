// utils/auth.ts

import { api } from './api';
import { setStoredToken, removeStoredToken, getStoredToken } from './storage';
import { User } from '../types/auth.types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      setStoredToken(response.token);
      return response.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      setStoredToken(response.token);
      return response.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      removeStoredToken();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (!getStoredToken()) return null;
      const user = await api.get<User>('/auth/me');
      return user;
    } catch (error) {
      removeStoredToken();
      return null;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/update-password', {
      currentPassword,
      newPassword,
    });
  }

  isAuthenticated(): boolean {
    return !!getStoredToken();
  }

  private handleAuthError(error: any): Error {
    if (error.status === 401) {
      return new Error('Invalid credentials');
    }
    if (error.status === 422) {
      return new Error('Invalid input data');
    }
    return new Error('Authentication failed');
  }
}

export const authService = AuthService.getInstance();
