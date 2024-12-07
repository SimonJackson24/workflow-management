// core/frontend/src/hooks/usePluginManagement.ts

import { useState, useEffect } from 'react';
import { pluginService } from '../services/pluginService';
import { Plugin, PluginConfig, PluginStatus } from '../types/plugin.types';

export const usePluginManagement = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const data = await pluginService.getInstalledPlugins();
      setPlugins(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const installPlugin = async (pluginId: string, config?: PluginConfig) => {
    try {
      setLoading(true);
      await pluginService.installPlugin(pluginId, config);
      await fetchPlugins();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uninstallPlugin = async (pluginId: string) => {
    try {
      setLoading(true);
      await pluginService.uninstallPlugin(pluginId);
      await fetchPlugins();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePluginConfig = async (pluginId: string, config: PluginConfig) => {
    try {
      setLoading(true);
      await pluginService.updatePluginConfig(pluginId, config);
      await fetchPlugins();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const togglePlugin = async (pluginId: string) => {
    try {
      setLoading(true);
      await pluginService.togglePlugin(pluginId);
      await fetchPlugins();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    plugins,
    loading,
    error,
    installPlugin,
    uninstallPlugin,
    updatePluginConfig,
    togglePlugin,
    refreshPlugins: fetchPlugins
  };
};

// core/frontend/src/services/pluginService.ts

import { api } from '../utils/api';
import { Plugin, PluginConfig, PluginStatus } from '../types/plugin.types';

class PluginService {
  async getInstalledPlugins(): Promise<Plugin[]> {
    const response = await api.get('/api/plugins');
    return response.data;
  }

  async installPlugin(pluginId: string, config?: PluginConfig): Promise<Plugin> {
    const response = await api.post(`/api/plugins/install/${pluginId}`, { config });
    return response.data;
  }

  async uninstallPlugin(pluginId: string): Promise<void> {
    await api.delete(`/api/plugins/${pluginId}`);
  }

  async updatePluginConfig(pluginId: string, config: PluginConfig): Promise<Plugin> {
    const response = await api.put(`/api/plugins/${pluginId}/config`, { config });
    return response.data;
  }

  async togglePlugin(pluginId: string): Promise<Plugin> {
    const response = await api.post(`/api/plugins/${pluginId}/toggle`);
    return response.data;
  }

  async getPluginStatus(pluginId: string): Promise<PluginStatus> {
    const response = await api.get(`/api/plugins/${pluginId}/status`);
    return response.data;
  }

  async validatePluginConfig(pluginId: string, config: PluginConfig): Promise<boolean> {
    const response = await api.post(`/api/plugins/${pluginId}/validate`, { config });
    return response.data.valid;
  }
}

export const pluginService = new PluginService();
