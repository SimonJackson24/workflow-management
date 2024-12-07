import { 
  Plugin, 
  PluginMetadata, 
  PluginEventType,
  PluginEvent,
  IPluginManager,
  PluginInstallationStatus
} from '../../types/plugin.types';
import { ApiError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { redisClient } from '../../config/redis';
import fs from 'fs/promises';
import path from 'path';
import semver from 'semver';
import { EventEmitter } from 'events';

export class PluginManager implements IPluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();
  private pluginsDir: string;
  private metadataCache: Map<string, PluginMetadata> = new Map();

  constructor(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
    this.setupEventListeners();
  }

  /**
   * Initialize Plugin Manager
   */
  public async initialize(): Promise<void> {
    try {
      // Create plugins directory if it doesn't exist
      await fs.mkdir(this.pluginsDir, { recursive: true });

      // Load installed plugins from database/cache
      await this.loadInstalledPlugins();

      // Start plugin monitoring
      this.startPluginMonitoring();

      logger.info('Plugin Manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Plugin Manager:', error);
      throw error;
    }
  }

  /**
   * Install a plugin
   */
  public async installPlugin(pluginId: string): Promise<boolean> {
    try {
      // Check if plugin is already installed
      if (this.plugins.has(pluginId)) {
        throw new ApiError(400, 'Plugin already installed');
      }

      // Load plugin metadata
      const metadata = await this.loadPluginMetadata(pluginId);
      
      // Validate plugin
      await this.validatePlugin(metadata);
      
      // Check dependencies
      await this.checkDependencies(metadata);
      
      // Load plugin module
      const plugin = await this.loadPluginModule(pluginId);
      
      // Initialize plugin
      await this.initializePlugin(plugin);
      
      // Register plugin components
      await this.registerPluginComponents(plugin);
      
      // Run installation hooks
      if (plugin.hooks?.onInstall) {
        await plugin.hooks.onInstall();
      }
      
      // Save plugin state
      await this.savePluginState(plugin);
      
      // Add to plugins map
      this.plugins.set(pluginId, plugin);
      
      // Emit installation event
      this.emitPluginEvent({
        type: PluginEventType.INSTALLED,
        pluginId,
        timestamp: new Date()
      });

      logger.info(`Plugin ${pluginId} installed successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to install plugin ${pluginId}:`, error);
      this.emitPluginEvent({
        type: PluginEventType.ERROR,
        pluginId,
        timestamp: new Date(),
        error: error as Error
      });
      return false;
    }
  }

  /**
   * Uninstall a plugin
   */
  public async uninstallPlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        throw new ApiError(404, 'Plugin not found');
      }

      // Run uninstallation hooks
      if (plugin.hooks?.onUninstall) {
        await plugin.hooks.onUninstall();
      }

      // Unregister plugin components
      await this.unregisterPluginComponents(plugin);

      // Remove plugin state
      await this.removePluginState(pluginId);

      // Remove from plugins map
      this.plugins.delete(pluginId);

      // Emit uninstallation event
      this.emitPluginEvent({
        type: PluginEventType.UNINSTALLED,
        pluginId,
        timestamp: new Date()
      });

      logger.info(`Plugin ${pluginId} uninstalled successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to uninstall plugin ${pluginId}:`, error);
      this.emitPluginEvent({
        type: PluginEventType.ERROR,
        pluginId,
        timestamp: new Date(),
        error: error as Error
      });
      return false;
    }
  }

  /**
   * Enable a plugin
   */
  public async enablePlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        throw new ApiError(404, 'Plugin not found');
      }

      if (plugin.enabled) {
        return true;
      }

      // Run enable hooks
      if (plugin.hooks?.onEnable) {
        await plugin.hooks.onEnable();
      }

      // Update plugin state
      plugin.enabled = true;
      await this.savePluginState(plugin);

      // Emit enable event
      this.emitPluginEvent({
        type: PluginEventType.ENABLED,
        pluginId,
        timestamp: new Date()
      });

      logger.info(`Plugin ${pluginId} enabled successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to enable plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Disable a plugin
   */
  public async disablePlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        throw new ApiError(404, 'Plugin not found');
      }

      if (!plugin.enabled) {
        return true;
      }

      // Run disable hooks
      if (plugin.hooks?.onDisable) {
        await plugin.hooks.onDisable();
      }

      // Update plugin state
      plugin.enabled = false;
      await this.savePluginState(plugin);

      // Emit disable event
      this.emitPluginEvent({
        type: PluginEventType.DISABLED,
        pluginId,
        timestamp: new Date()
      });

      logger.info(`Plugin ${pluginId} disabled successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to disable plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Update plugin configuration
   */
  public async updatePluginConfig(pluginId: string, config: Record<string, any>): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin || !plugin.configurable) {
        throw new ApiError(400, 'Plugin not configurable');
      }

      // Validate configuration
      await this.validatePluginConfig(plugin, config);

      // Run config update hooks
      if (plugin.hooks?.onConfigUpdate) {
        await plugin.hooks.onConfigUpdate(config);
      }

      // Update plugin configuration
      plugin.defaultConfig = { ...plugin.defaultConfig, ...config };
      await this.savePluginState(plugin);

      // Emit config update event
      this.emitPluginEvent({
        type: PluginEventType.CONFIG_UPDATED,
        pluginId,
        timestamp: new Date(),
        data: config
      });

      return true;
    } catch (error) {
      logger.error(`Failed to update plugin config ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Get plugin by ID
   */
  public getPlugin(pluginId: string): Plugin | null {
    return this.plugins.get(pluginId) || null;
  }

  /**
   * Get all plugins
   */
  public getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get enabled plugins
   */
  public getEnabledPlugins(): Plugin[] {
    return this.getAllPlugins().filter(plugin => plugin.enabled);
  }

  /**
   * Private helper methods
   */

  private async loadPluginMetadata(pluginId: string): Promise<PluginMetadata> {
    try {
      // Check cache first
      if (this.metadataCache.has(pluginId)) {
        return this.metadataCache.get(pluginId)!;
      }

      const metadataPath = path.join(this.pluginsDir, pluginId, 'plugin.json');
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      
      // Validate metadata
      if (!this.isValidMetadata(metadata)) {
        throw new Error('Invalid plugin metadata');
      }

      // Cache metadata
      this.metadataCache.set(pluginId, metadata);
      
      return metadata;
    } catch (error) {
      throw new Error(`Failed to load plugin metadata: ${error.message}`);
    }
  }

  private async loadPluginModule(pluginId: string): Promise<Plugin> {
    try {
      const pluginPath = path.join(this.pluginsDir, pluginId);
      const module = require(pluginPath);
      return module.default || module;
    } catch (error) {
      throw new Error(`Failed to load plugin module: ${error.message}`);
    }
  }

  private async validatePlugin(metadata: PluginMetadata): Promise<void> {
    // Validate version
    if (!semver.valid(metadata.version)) {
      throw new Error('Invalid version format');
    }

    // Validate required fields
    const requiredFields = ['id', 'name', 'version', 'author'];
    for (const field of requiredFields) {
      if (!metadata[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  private async checkDependencies(metadata: PluginMetadata): Promise<void> {
    if (!metadata.dependencies) return;

    for (const [dep, version] of Object.entries(metadata.dependencies)) {
      const dependencyPlugin = this.plugins.get(dep);
      if (!dependencyPlugin) {
        throw new Error(`Missing dependency: ${dep}`);
      }

      if (!semver.satisfies(dependencyPlugin.version, version)) {
        throw new Error(`Incompatible dependency version: ${dep}@${version}`);
      }
    }
  }

  private async registerPluginComponents(plugin: Plugin): Promise<void> {
    // Register routes
    if (plugin.routes) {
      // Implementation for registering routes
    }

    // Register models
    if (plugin.models) {
      // Implementation for registering models
    }

    // Register UI components
    if (plugin.components) {
      // Implementation for registering UI components
    }
  }

  private async unregisterPluginComponents(plugin: Plugin): Promise<void> {
    // Unregister routes
    if (plugin.routes) {
      // Implementation for unregistering routes
    }

    // Unregister models
    if (plugin.models) {
      // Implementation for unregistering models
    }

    // Unregister UI components
    if (plugin.components) {
      // Implementation for unregistering UI components
    }
  }

  private async savePluginState(plugin: Plugin): Promise<void> {
    await redisClient.set(
      `plugin:${plugin.id}`,
      JSON.stringify(plugin),
      'EX',
      86400 // 24 hours
    );
  }

  private async removePluginState(pluginId: string): Promise<void> {
    await redisClient.del(`plugin:${pluginId}`);
  }

  private setupEventListeners(): void {
    this.eventEmitter.on('error', (error: Error) => {
      logger.error('Plugin Manager Error:', error);
    });
  }

  private emitPluginEvent(event: PluginEvent): void {
    this.eventEmitter.emit(event.type, event);
  }

  private async loadInstalledPlugins(): Promise<void> {
    try {
      const pluginKeys = await redisClient.keys('plugin:*');
      for (const key of pluginKeys) {
        const pluginData = await redisClient.get(key);
        if (pluginData) {
          const plugin = JSON.parse(pluginData);
          this.plugins.set(plugin.id, plugin);
        }
      }
    } catch (error) {
      logger.error('Failed to load installed plugins:', error);
    }
  }

  private startPluginMonitoring(): void {
    setInterval(() => {
      this.monitorPlugins();
    }, 60000); // Check every minute
  }

  private async monitorPlugins(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        // Check plugin health
        await this.checkPluginHealth(plugin);

        // Check for updates
        await this.checkPluginUpdates(plugin);
      } catch (error) {
        logger.error(`Plugin monitoring error for ${plugin.id}:`, error);
      }
    }
  }

  private async checkPluginHealth(plugin: Plugin): Promise<void> {
    // Implementation for health checks
  }

  private async checkPluginUpdates(plugin: Plugin): Promise<void> {
    // Implementation for update checks
  }
}

export default PluginManager;
