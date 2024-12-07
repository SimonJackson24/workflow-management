// core/frontend/src/routes/routes.config.ts

import { lazy } from 'react';
import { RouteConfig } from './types';

// Lazy load components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Users = lazy(() => import('../pages/Users'));
const Plugins = lazy(() => import('../pages/Plugins'));
const Subscriptions = lazy(() => import('../pages/Subscriptions'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Route types
export const routes: RouteConfig[] = [
  // Public routes
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

  // Protected routes
  {
    path: '/',
    component: Dashboard,
    exact: true,
    roles: ['user', 'admin']
  },
  {
    path: '/profile',
    component: Profile,
    roles: ['user', 'admin']
  },
  {
    path: '/settings',
    component: Settings,
    roles: ['admin']
  },
  {
    path: '/users',
    component: Users,
    roles: ['admin']
  },
  {
    path: '/plugins',
    component: Plugins,
    roles: ['admin']
  },
  {
    path: '/subscriptions',
    component: Subscriptions,
    roles: ['admin']
  },

  // 404 route
  {
    path: '*',
    component: NotFound,
    public: true
  }
];
