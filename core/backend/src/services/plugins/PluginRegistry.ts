// core/backend/src/services/plugins/PluginRegistry.ts

import { EventEmitter } from 'events';
import {
  Plugin,
  PluginMetadata,
  PluginStatus,
  PluginConfig
} from '../../types/plugin.types';

export class PluginRegistry {
  private plugins: Map<string, Plugin>;
  private metadata: Map<string, PluginMetadata>;
  private configurations: Map<string, PluginConfig>;
  private eventEmitter: EventEmitter;

  constructor() {
    this.plugins = new Map();
    this.metadata = new Map();
    this.configurations = new Map();
    this.eventEmitter = new EventEmitter();
  }

  async registerPlugin(plugin: Plugin, metadata: PluginMetadata): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }

    // Store plugin and metadata
    this.plugins.set(plugin.id, plugin);
    this.metadata.set(plugin.id, metadata);

    // Initialize default configuration
    this.configurations.set(plugin.id, metadata.defaultConfig || {});

    // Emit registration event
    this.eventEmitter.emit('plugin:registered', { plugin, metadata });
  }

  async unregisterPlugin(pluginId: string): Promise<void> {
    if (!this.plugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    // Remove plugin data
    this.plugins.delete(pluginId);
    this.metadata.delete(pluginId);
    this.configurations.delete(pluginId);

    // Emit unregistration event
    this.eventEmitter.emit('plugin:unregistered', { pluginId });
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  getMetadata(pluginId: string): PluginMetadata | undefined {
    return this.metadata.get(pluginId);
  }

  getConfiguration(pluginId: string): PluginConfig | undefined {
    return this.configurations.get(pluginId);
  }

  async updateConfiguration(
    pluginId: string,
    config: Partial<PluginConfig>
  ): Promise<void> {
    const currentConfig = this.configurations.get(pluginId) || {};
    this.configurations.set(pluginId, { ...currentConfig, ...config });
    this.eventEmitter.emit('plugin:configUpdated', { pluginId, config });
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getPluginsByStatus(status: PluginStatus): Plugin[] {
    return this.getAllPlugins().filter(plugin => plugin.status === status);
  }

  onPluginEvent(event: string, handler: (data: any) => void): void {
    this.eventEmitter.on(event, handler);
  }

  async validateDependencies(pluginId: string): Promise<boolean> {
    const plugin = this.getPlugin(pluginId);
    const metadata = this.getMetadata(pluginId);

    if (!plugin || !metadata) {
      return false;
    }

    for (const dep of metadata.dependencies || []) {
      const dependencyPlugin = this.getPlugin(dep.id);
      if (!dependencyPlugin) {
        return false;
      }

      // Check version compatibility
      if (!this.isVersionCompatible(dependencyPlugin.version, dep.version)) {
        return false;
      }
    }

    return true;
  }

  private isVersionCompatible(actual: string, required: string): boolean {
    // Implement semver comparison logic
    return true;
  }
}
