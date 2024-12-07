// core/backend/src/services/plugins/PluginLoader.ts

import { promises as fs } from 'fs';
import path from 'path';
import { Plugin, PluginMetadata } from '../../types/plugin.types';
import { PluginValidator } from './PluginValidator';
import { PluginRegistry } from './PluginRegistry';

export class PluginLoader {
  private validator: PluginValidator;
  private registry: PluginRegistry;
  private pluginsDir: string;

  constructor(
    registry: PluginRegistry,
    validator: PluginValidator,
    pluginsDir: string
  ) {
    this.registry = registry;
    this.validator = validator;
    this.pluginsDir = pluginsDir;
  }

  async loadPlugin(pluginId: string): Promise<Plugin> {
    try {
      // Get plugin directory
      const pluginDir = path.join(this.pluginsDir, pluginId);
      
      // Read plugin metadata
      const metadata = await this.readMetadata(pluginDir);
      
      // Validate plugin
      await this.validator.validatePlugin(pluginDir, metadata);

      // Load plugin module
      const plugin = await this.loadPluginModule(pluginDir, metadata);

      // Register plugin
      await this.registry.registerPlugin(plugin, metadata);

      return plugin;
    } catch (error) {
      throw new Error(`Failed to load plugin ${pluginId}: ${error.message}`);
    }
  }

  async loadAllPlugins(): Promise<Plugin[]> {
    const plugins: Plugin[] = [];
    const entries = await fs.readdir(this.pluginsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const plugin = await this.loadPlugin(entry.name);
          plugins.push(plugin);
        } catch (error) {
          console.error(`Failed to load plugin ${entry.name}:`, error);
        }
      }
    }

    return plugins;
  }

  private async readMetadata(pluginDir: string): Promise<PluginMetadata> {
    const metadataPath = path.join(pluginDir, 'plugin.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(metadataContent);
  }

  private async loadPluginModule(
    pluginDir: string,
    metadata: PluginMetadata
  ): Promise<Plugin> {
    const mainFile = path.join(pluginDir, metadata.main);
    const pluginModule = require(mainFile);

    return {
      id: metadata.id,
      name: metadata.name,
      version: metadata.version,
      status: 'inactive',
      module: pluginModule
    };
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not loaded`);
    }

    // Cleanup plugin resources
    if (typeof plugin.module.cleanup === 'function') {
      await plugin.module.cleanup();
    }

    // Unregister plugin
    await this.registry.unregisterPlugin(pluginId);

    // Clear module cache
    this.clearModuleCache(pluginId);
  }

  private clearModuleCache(pluginId: string): void {
    const pluginDir = path.join(this.pluginsDir, pluginId);
    Object.keys(require.cache).forEach(key => {
      if (key.startsWith(pluginDir)) {
        delete require.cache[key];
      }
    });
  }
}
