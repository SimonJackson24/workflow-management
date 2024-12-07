// core/frontend/src/routes/routes.config.ts

import { lazy } from 'react';
import { RouteConfig } from './types';

// Dashboard & Analytics
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Analytics = lazy(() => import('../pages/Analytics'));

// Authentication
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// User Management
const Profile = lazy(() => import('../pages/Profile'));
const Users = lazy(() => import('../pages/Users'));
const UserDetails = lazy(() => import('../pages/UserDetails'));

// Organization Management
const Settings = lazy(() => import('../pages/Settings'));
const OrganizationSettings = lazy(() => import('../pages/settings/OrganizationSettings'));
const SecuritySettings = lazy(() => import('../pages/settings/SecuritySettings'));
const BillingSettings = lazy(() => import('../pages/settings/BillingSettings'));
const IntegrationSettings = lazy(() => import('../pages/settings/IntegrationSettings'));

// Plugin Management
const Plugins = lazy(() => import('../pages/Plugins'));
const PluginDetails = lazy(() => import('../pages/plugins/PluginDetails'));
const PluginMarketplace = lazy(() => import('../pages/plugins/PluginMarketplace'));
const PluginSettings = lazy(() => import('../pages/plugins/PluginSettings'));

// Billing & Subscriptions
const Subscriptions = lazy(() => import('../pages/Subscriptions'));
const Billing = lazy(() => import('../pages/Billing'));
const Invoices = lazy(() => import('../pages/Invoices'));

// Documentation
const Documentation = lazy(() => import('../pages/Documentation'));
const Support = lazy(() => import('../pages/Support'));

// Error Pages
const NotFound = lazy(() => import('../pages/NotFound'));
const ErrorBoundary = lazy(() => import('../pages/ErrorBoundary'));

export const routes: RouteConfig[] = [
  // Public Routes
  {
    path: '/login',
    component: Login,
    public: true
  },
  {
    path: '/register',
    component: Register,
    public: true
  },
  {
    path: '/forgot-password',
    component: ForgotPassword,
    public: true
  },
  {
    path: '/reset-password/:token',
    component: ResetPassword,
    public: true
  },

  // Protected Routes
  // Dashboard & Analytics
  {
    path: '/',
    component: Dashboard,
    exact: true,
    roles: ['user', 'admin']
  },
  {
    path: '/analytics',
    component: Analytics,
    roles: ['admin']
  },

  // User Management
  {
    path: '/profile',
    component: Profile,
    roles: ['user', 'admin']
  },
  {
    path: '/users',
    component: Users,
    roles: ['admin']
  },
  {
    path: '/users/:userId',
    component: UserDetails,
    roles: ['admin']
  },

  // Settings
  {
    path: '/settings',
    component: Settings,
    roles: ['admin'],
    children: [
      {
        path: '/settings/organization',
        component: OrganizationSettings,
        roles: ['admin']
      },
      {
        path: '/settings/security',
        component: SecuritySettings,
        roles: ['admin']
      },
      {
        path: '/settings/billing',
        component: BillingSettings,
        roles: ['admin']
      },
      {
        path: '/settings/integrations',
        component: IntegrationSettings,
        roles: ['admin']
      }
    ]
  },

  // Plugin Management
  {
    path: '/plugins',
    component: Plugins,
    roles: ['admin']
  },
  {
    path: '/plugins/marketplace',
    component: PluginMarketplace,
    roles: ['admin']
  },
  {
    path: '/plugins/:pluginId',
    component: PluginDetails,
    roles: ['admin']
  },
  {
    path: '/plugins/:pluginId/settings',
    component: PluginSettings,
    roles: ['admin']
  },

  // Billing & Subscriptions
  {
    path: '/subscriptions',
    component: Subscriptions,
    roles: ['admin']
  },
  {
    path: '/billing',
    component: Billing,
    roles: ['admin']
  },
  {
    path: '/billing/invoices',
    component: Invoices,
    roles: ['admin']
  },

  // Documentation & Support
  {
    path: '/documentation',
    component: Documentation,
    roles: ['user', 'admin']
  },
  {
    path: '/support',
    component: Support,
    roles: ['user', 'admin']
  },

  // Error Pages
  {
    path: '/error',
    component: ErrorBoundary,
    public: true
  },
  {
    path: '*',
    component: NotFound,
    public: true
  }
];

// Navigation groups for sidebar
export const navigationGroups = [
  {
    title: 'Dashboard',
    items: [
      { path: '/', label: 'Overview', icon: 'Dashboard' },
      { path: '/analytics', label: 'Analytics', icon: 'Analytics', roles: ['admin'] }
    ]
  },
  {
    title: 'Management',
    items: [
      { path: '/users', label: 'Users', icon: 'People', roles: ['admin'] },
      { path: '/plugins', label: 'Plugins', icon: 'Extension', roles: ['admin'] },
      { path: '/plugins/marketplace', label: 'Marketplace', icon: 'Store', roles: ['admin'] }
    ]
  },
  {
    title: 'Settings',
    items: [
      { path: '/profile', label: 'Profile', icon: 'Person' },
      { path: '/settings/organization', label: 'Organization', icon: 'Business', roles: ['admin'] },
      { path: '/settings/security', label: 'Security', icon: 'Security', roles: ['admin'] },
      { path: '/settings/billing', label: 'Billing', icon: 'Payment', roles: ['admin'] },
      { path: '/settings/integrations', label: 'Integrations', icon: 'Integration', roles: ['admin'] }
    ]
  },
  {
    title: 'Help',
    items: [
      { path: '/documentation', label: 'Documentation', icon: 'Book' },
      { path: '/support', label: 'Support', icon: 'Help' }
    ]
  }
];
