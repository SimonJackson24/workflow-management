// core/frontend/src/routes/routes.config.tsx

import React from 'react';
import { RouteConfig } from './types';
import Layout from '../components/layout/Layout';

// Pages
import Dashboard from '../pages/Dashboard';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Users from '../pages/Users';
import Plugins from '../pages/Plugins';
import Subscriptions from '../pages/Subscriptions';
import NotFound from '../pages/NotFound';

export const routes: RouteConfig[] = [
  // Public routes
  {
    path: '/login',
    element: <Login />,
    isPublic: true,
  },
  {
    path: '/register',
    element: <Register />,
    isPublic: true,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    isPublic: true,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
    isPublic: true,
  },
  
  // Protected routes with Layout
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
        roles: ['user', 'admin'],
      },
      {
        path: '/profile',
        element: <Profile />,
        roles: ['user', 'admin'],
      },
      {
        path: '/settings',
        element: <Settings />,
        roles: ['admin'],
      },
      {
        path: '/users',
        element: <Users />,
        roles: ['admin'],
      },
      {
        path: '/plugins',
        element: <Plugins />,
        roles: ['admin'],
      },
      {
        path: '/subscriptions',
        element: <Subscriptions />,
        roles: ['admin'],
      },
    ],
  },

  // 404 route
  {
    path: '*',
    element: <NotFound />,
    isPublic: true,
  },
];
