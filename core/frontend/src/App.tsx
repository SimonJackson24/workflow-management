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
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import ApiDocs from './pages/ApiDocs';
import AuditLogs from './pages/AuditLogs';
import TeamManagement from './pages/TeamManagement';
import Integrations from './pages/Integrations';

const MonitoredApp: React.FC = () => {

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


      {/* Protected Routes with Layout */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        {/* Existing Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<Users />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/subscriptions" element={<Subscriptions />} />

        {/* New Routes */}
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/api-docs" element={<ApiDocs />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/team" element={<TeamManagement />} />
        <Route path="/integrations" element={<Integrations />} />

        {/* Nested Routes */}
        <Route path="/settings/*" element={<Settings />}>
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="billing" element={<BillingSettings />} />
        </Route>

        <Route path="/users/*" element={<Users />}>
          <Route path=":userId" element={<UserDetails />} />
          <Route path=":userId/edit" element={<UserEdit />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="permissions" element={<PermissionManagement />} />
        </Route>

        <Route path="/plugins/*" element={<Plugins />}>
          <Route path="marketplace" element={<PluginMarketplace />} />
          <Route path=":pluginId" element={<PluginDetails />} />
          <Route path=":pluginId/settings" element={<PluginSettings />} />
          <Route path=":pluginId/analytics" element={<PluginAnalytics />} />
        </Route>
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
