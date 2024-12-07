// core/frontend/src/types/index.ts

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  department?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  dependencies?: string[];
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  installed: boolean;
  configuration?: Record<string, any>;
  dependencies: string[];
  permissions: string[];
  status: 'active' | 'inactive' | 'error';
  lastUpdated: Date;
  installedAt: Date;
}

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license: string;
  tags: string[];
  category: string;
  pricing?: {
    type: 'free' | 'paid' | 'subscription';
    price?: number;
    currency?: string;
  };
}
