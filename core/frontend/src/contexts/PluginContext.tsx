// core/frontend/src/contexts/PluginContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

interface Plugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
}

interface PluginContextType {
  plugins: Plugin[];
  loading: boolean;
  error: string | null;
  installPlugin: (pluginId: string) => Promise<void>;
  uninstallPlugin: (pluginId: string) => Promise<void>;
  enablePlugin: (pluginId: string) => Promise<void>;
  disablePlugin: (pluginId: string) => Promise<void>;
  updatePluginConfig: (pluginId: string, config: Record<string, any>) => Promise<void>;
  refreshPlugins: () => Promise<void>;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { organization } = useAuth();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organization) {
      refreshPlugins();
    }
  }, [organization]);

  const refreshPlugins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/plugins');
      setPlugins(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load plugins');
    } finally {
      setLoading(false);
    }
  };

  const installPlugin = async (pluginId: string) => {
    try {
      await api.post(`/plugins/${pluginId}/install`);
      await refreshPlugins();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to install plugin');
    }
  };

  const uninstallPlugin = async (pluginId: string) => {
    try {
      await api.delete(`/plugins/${pluginId}`);
      await refreshPlugins();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to uninstall plugin');
    }
  };

  const enablePlugin = async (pluginId: string) => {
    try {
      await api.post(`/plugins/${pluginId}/enable`);
      await refreshPlugins();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to enable plugin');
    }
  };

  const disablePlugin = async (pluginId: string) => {
    try {
      await api.post(`/plugins/${pluginId}/disable`);
      await refreshPlugins();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to disable plugin');
    }
  };

  const updatePluginConfig = async (pluginId: string, config: Record<string, any>) => {
    try {
      await api.put(`/plugins/${pluginId}/config`, { config });
      await refreshPlugins();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update plugin configuration');
    }
  };

  return (
    <PluginContext.Provider
      value={{
        plugins,
        loading,
        error,
        installPlugin,
        uninstallPlugin,
        enablePlugin,
        disablePlugin,
        updatePluginConfig,
        refreshPlugins,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};
