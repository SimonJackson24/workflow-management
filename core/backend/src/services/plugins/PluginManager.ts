// core/backend/src/services/plugins/PluginManager.ts

import { EventEmitter } from 'events';
import {
  Plugin,
  PluginMetadata,
  PluginStatus,
  PluginConfig
} from '../../types/plugin.types';
import { PluginRegistry } from './PluginRegistry';
import { PluginLoader } from './PluginLoader';
import { PluginValidator } from './PluginValidator';

export class PluginManager {
  private registry: PluginRegistry;
  private loader: PluginLoader;
  private validator: PluginValidator;
  private eventEmitter: EventEmitter;

  constructor(pluginsDir: string) {
    this.registry = new PluginRegistry();
    this.validator = new PluginValidator();
    this.loader = new PluginLoader(this.registry, this.validator, pluginsDir);
    this.eventEmitter = new EventEmitter();
  }

  async initialize(): Promise<void> {
    try {
      // Load all plugins
      await this.loader.loadAllPlugins();

      // Initialize loaded plugins
      const plugins = this.registry.getAllPlugins();
      for (const plugin of plugins) {
        await this.initializePlugin(plugin.id);
      }
    } catch (error) {
      throw new Error(`Plugin manager initialization failed: ${error.message}`);
    }
  }

  async installPlugin(pluginId: string): Promise<Plugin> {
    try {
      // Load plugin
      const plugin = await this.loader.loadPlugin(pluginId);

      // Initialize plugin
      await this.initializePlugin(plugin.id);

      return plugin;
    } catch (error) {
      throw new Error(`Plugin installation failed: ${error.message}`);
    }
  }

  async uninstallPlugin(pluginId: string): Promise<void> {
    try {
      // Deactivate plugin
      await this.deactivatePlugin(pluginId);

      // Unload plugin
      await this.loader.unloadPlugin(pluginId);
    } catch (error) {
      throw new Error(`Plugin uninstallation failed: ${error.message}`);
    }
  }

  async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    try {
      // Check dependencies
      if (!await this.registry.validateDependencies(pluginId)) {
        throw new Error('Plugin dependencies not satisfied');
      }

      // Activate plugin
      if (typeof plugin.module.activate === 'function') {
        await plugin.module.activate();
      }

      // Update status
      plugin.status = 'active';
      this.eventEmitter.emit('plugin:activated', { pluginId });
    } catch (error) {
      throw new Error(`Plugin activation failed: ${error.message}`);
    }
  }

  async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    try {
      // Deactivate plugin
      if (typeof plugin.module.deactivate === 'function') {
        await plugin.module.deactivate();
      }

      // Update status
      plugin.status = 'inactive';
      this.eventEmitter.emit('plugin:deactivated', { pluginId });
    } catch (error) {
      throw new Error(`Plugin deactivation failed: ${error.message}`);
    }
  }

  private async initializePlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    try {
      // Initialize plugin
      if (typeof plugin.module.initialize === 'function') {
        await plugin.module.initialize();
      }

      this.eventEmitter.emit('plugin:initialized', { pluginId });
    } catch (error) {
      throw new Error(`Plugin initialization failed: ${error.message}`);
    }
  }

  // Event handlers
  onPluginEvent(event: string, handler: (data: any) => void): void {
    this.eventEmitter.on(event, handler);
  }

  // Plugin configuration
  async updatePluginConfig(
    pluginId: string,
    config: Partial<PluginConfig>
  ): Promise<void> {
    await this.registry.updateConfiguration(pluginId, config);
  }

  // Plugin status
  getPluginStatus(pluginId: string): PluginStatus | undefined {
    const plugin = this.registry.getPlugin(pluginId);
    return plugin?.status;
  }

  // Plugin metadata
  getPluginMetadata(pluginId: string): PluginMetadata | undefined {
    return this.registry.getMetadata(pluginId);
  }
}
