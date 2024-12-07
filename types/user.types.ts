// types/user.types.ts

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  organization?: Organization;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'admin' | 'user' | 'manager' | 'guest';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  plan: SubscriptionPlan;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  language: string;
  timezone: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  desktop: boolean;
  marketing: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  features: string[];
  limits: PlanLimits;
}

export interface PlanLimits {
  users: number;
  storage: number;
  apiCalls: number;
}
