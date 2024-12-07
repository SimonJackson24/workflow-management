// core/frontend/src/App.tsx

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PluginProvider } from './contexts/PluginContext';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/layout/Layout';
import { monitoring } from './utils/monitoring/AdvancedMonitoring';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Plugins from './pages/Plugins';
import Subscriptions from './pages/Subscriptions';
import NotFound from './pages/NotFound';

// Create a monitored app wrapper to handle monitoring setup
const MonitoredApp: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize monitoring when app starts
    if (user) {
      monitoring.setUser(user.id, {
        email: user.email,
        role: user.role,
        organization: user.organization?.id
      });
    }

    // Monitor route changes
    const handleRouteChange = () => {
      monitoring.recordUserAction('route_change', {
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);

    // Monitor performance metrics
    monitoring.recordMetric('app_init', performance.now(), {
      environment: process.env.NODE_ENV
    });

    // Cleanup function
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      monitoring.flushAll();
    };
  }, [user]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<Users />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PluginProvider>
          <BrowserRouter>
            <MonitoredApp />
          </BrowserRouter>
        </PluginProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
