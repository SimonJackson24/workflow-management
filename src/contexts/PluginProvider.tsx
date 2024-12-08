// src/contexts/PluginProvider.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plugin, PluginConfig, PluginStatus } from '@/types/plugin.types';
import { RootState } from '@/store/configureStore';
import { api } from '@/utils/api';
import { analytics } from '@/utils/analytics';

interface PluginContextValue {
  plugins: Plugin[];
  loadedPlugins: Map<string, Plugin>;
  loadPlugin: (pluginId: string, config?: PluginConfig) => Promise<void>;
  unloadPlugin: (pluginId: string) => Promise<void>;
  getPlugin: (pluginId: string) => Plugin | undefined;
  getPluginStatus: (pluginId: string) => PluginStatus;
  updatePluginConfig: (pluginId: string, config: PluginConfig) => Promise<void>;
}

const PluginContext = createContext<PluginContextValue | undefined>(undefined);

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};

interface PluginProviderProps {
  children: React.ReactNode;
}

export const PluginProvider: React.FC<PluginProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const [loadedPlugins, setLoadedPlugins] = useState<Map<string, Plugin>>(new Map());
  const plugins = useSelector((state: RootState) => state.plugins.installed);
  const pluginStatuses = useSelector((state: RootState) => state.plugins.statuses);

  useEffect(() => {
    // Load initially installed plugins
    const loadInitialPlugins = async () => {
      try {
        const installedPlugins = await api.get('/plugins/installed');
        for (const plugin of installedPlugins) {
          await loadPlugin(plugin.id, plugin.config);
        }
      } catch (error) {
        analytics.trackError(error as Error);
        console.error('Failed to load initial plugins:', error);
      }
    };

    loadInitialPlugins();
  }, []);

  const loadPlugin = async (pluginId: string, config?: PluginConfig) => {
    try {
      // Check if plugin is already loaded
      if (loadedPlugins.has(pluginId)) {
        return;
      }

      // Load plugin module
      const pluginModule = await import(`@/plugins/${pluginId}`);
      const PluginClass = pluginModule.default;

      // Initialize plugin
      const plugin = new PluginClass();
      await plugin.initialize(config);

      // Store loaded plugin
      setLoadedPlugins(prev => new Map(prev).set(pluginId, plugin));

      // Update plugin status
      dispatch({ type: 'plugins/setStatus', payload: { id: pluginId, status: 'active' } });

      analytics.trackEvent('Plugin', 'Load', pluginId);
    } catch (error) {
      analytics.trackError(error as Error, { pluginId });
      dispatch({ 
        type: 'plugins/setStatus', 
        payload: { id: pluginId, status: 'error', error: (error as Error).message } 
      });
      throw error;
    }
  };

  const unloadPlugin = async (pluginId: string) => {
    try {
      const plugin = loadedPlugins.get(pluginId);
      if (!plugin) return;

      // Cleanup plugin
      await plugin.cleanup();

      // Remove from loaded plugins
      setLoadedPlugins(prev => {
        const next = new Map(prev);
        next.delete(pluginId);
        return next;
      });

      dispatch({ type: 'plugins/setStatus', payload: { id: pluginId, status: 'inactive' } });

      analytics.trackEvent('Plugin', 'Unload', pluginId);
    } catch (error) {
      analytics.trackError(error as Error, { pluginId });
      throw error;
    }
  };

  const getPlugin = (pluginId: string) => {
    return loadedPlugins.get(pluginId);
  };

  const getPluginStatus = (pluginId: string): PluginStatus => {
    return pluginStatuses[pluginId] || 'inactive';
  };

  const updatePluginConfig = async (pluginId: string, config: PluginConfig) => {
    try {
      const plugin = loadedPlugins.get(pluginId);
      if (!plugin) throw new Error(`Plugin ${pluginId} not loaded`);

      await plugin.updateConfig(config);
      dispatch({ 
        type: 'plugins/updateConfig', 
        payload: { id: pluginId, config } 
      });

      analytics.trackEvent('Plugin', 'UpdateConfig', pluginId);
    } catch (error) {
      analytics.trackError(error as Error, { pluginId });
      throw error;
    }
  };

  const value: PluginContextValue = {
    plugins,
    loadedPlugins,
    loadPlugin,
    unloadPlugin,
    getPlugin,
    getPluginStatus,
    updatePluginConfig
  };

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  );
};
