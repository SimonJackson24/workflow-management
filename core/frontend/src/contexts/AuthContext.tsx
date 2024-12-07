// core/frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organization: any;
  twoFactorEnabled?: boolean;
  // Add other user properties
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  // New 2FA methods
  setupTwoFactor: () => Promise<{ qrCodeUrl: string; backupCodes: string[] }>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  disableTwoFactor: (code: string) => Promise<void>;
  validateTwoFactorCode: (code: string) => Promise<{ token: string; user: User }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Check if 2FA is required
      if (response.data.requiresTwoFactor) {
        // Store temporary session for 2FA verification
        sessionStorage.setItem('tempAuthSession', response.data.tempToken);
        return navigate('/two-factor');
      }

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // New 2FA methods
  const setupTwoFactor = async () => {
    try {
      const response = await api.post('/auth/2fa/setup');
      return {
        qrCodeUrl: response.data.qrCodeUrl,
        backupCodes: response.data.backupCodes
      };
    } catch (error: any) {
      setError(error.response?.data?.message || '2FA setup failed');
      throw error;
    }
  };

  const verifyTwoFactor = async (code: string) => {
    try {
      const response = await api.post('/auth/2fa/verify', { code });
      if (response.data.success) {
        setUser(prev => prev ? { ...prev, twoFactorEnabled: true } : null);
      }
      return response.data.success;
    } catch (error: any) {
      setError(error.response?.data?.message || '2FA verification failed');
      throw error;
    }
  };

  const validateTwoFactorCode = async (code: string) => {
    try {
      const tempToken = sessionStorage.getItem('tempAuthSession');
      if (!tempToken) throw new Error('No temporary session found');

      const response = await api.post('/auth/2fa/validate', {
        code,
        tempToken
      });

      // Clear temporary session
      sessionStorage.removeItem('tempAuthSession');

      // Set actual auth token and user
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);

      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.message || '2FA validation failed');
      throw error;
    }
  };

  const disableTwoFactor = async (code: string) => {
    try {
      await api.post('/auth/2fa/disable', { code });
      setUser(prev => prev ? { ...prev, twoFactorEnabled: false } : null);
    } catch (error: any) {
      setError(error.response?.data?.message || '2FA disable failed');
      throw error;
    }
  };

  // Your existing methods...
  // logout, register, forgotPassword, resetPassword, updateProfile

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        forgotPassword,
        resetPassword,
        updateProfile,
        // Add new 2FA methods
        setupTwoFactor,
        verifyTwoFactor,
        disableTwoFactor,
        validateTwoFactorCode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
