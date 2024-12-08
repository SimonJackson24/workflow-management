// src/utils/api.ts

import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
); 

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { analytics } from './analytics';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      this.handleRequest,
      this.handleRequestError
    );

    this.client.interceptors.response.use(
      this.handleResponse,
      this.handleResponseError
    );
  }

  private handleRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return config;
  };

  private handleRequestError = (error: any): Promise<never> => {
    analytics.trackError(error);
    return Promise.reject(error);
  };

  private handleResponse = (response: AxiosResponse): AxiosResponse => {
    return response;
  };

  private handleResponseError = async (error: any): Promise<any> => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (this.refreshPromise) {
        // Wait for the existing refresh request
        const token = await this.refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return this.client(originalRequest);
      }

      originalRequest._retry = true;
      this.refreshPromise = this.refreshToken();

      try {
        const token = await this.refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return this.client(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure
        this.handleAuthError();
        return Promise.reject(refreshError);
      } finally {
        this.refreshPromise = null;
      }
    }

    analytics.trackError(error);
    return Promise.reject(error);
  };

  private async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await this.client.post('/auth/refresh', { refreshToken });
      const { token } = response.data;
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      this.handleAuthError();
      throw error;
    }
  }

  private handleAuthError(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const api = new ApiClient();
