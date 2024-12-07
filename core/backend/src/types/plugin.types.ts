// Plugin Interface Definitions

/**
 * Base Plugin Configuration
 */
export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  configurable: boolean;
  settings?: Record<string, any>;
}

/**
 * Plugin Metadata Interface
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository?: string;
  dependencies?: {
    [key: string]: string;
  };
  configSchema?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required?: boolean;
      default?: any;
      description?: string;
    };
  };
}

/**
 * Plugin Hooks Interface
 */
export interface PluginHooks {
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
  onUpdate?: (previousVersion: string) => Promise<void>;
  onConfigUpdate?: (newConfig: Record<string, any>) => Promise<void>;
}

/**
 * Plugin Routes Interface
 */
export interface PluginRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: Function;
  middleware?: Function[];
  auth?: boolean;
  roles?: string[];
}

/**
 * Plugin UI Component Interface
 */
export interface PluginUIComponent {
  type: 'dashboard' | 'settings' | 'modal' | 'sidebar';
  component: any; // React component
  props?: Record<string, any>;
  position?: string;
  priority?: number;
}

/**
 * Plugin Permissions Interface
 */
export interface PluginPermission {
  id: string;
  name: string;
  description: string;
  roles?: string[];
}

/**
 * Main Plugin Interface
 */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  
  // Core components
  routes?: PluginRoute[];
  models?: any[];
  controllers?: any[];
  services?: any[];
  
  // UI components
  components?: PluginUIComponent[];
  
  // Dependencies and permissions
  dependencies?: string[];
  permissions?: PluginPermission[];
  
  // Configuration
  configurable?: boolean;
  defaultConfig?: Record<string, any>;
  
  // Lifecycle hooks
  hooks?: PluginHooks;
  
  // Plugin API
  api?: {
    [key: string]: Function;
  };
}

/**
 * Plugin Manager Interface
 */
export interface IPluginManager {
  installPlugin(pluginId: string): Promise<boolean>;
  uninstallPlugin(pluginId: string): Promise<boolean>;
  enablePlugin(pluginId: string): Promise<boolean>;
  disablePlugin(pluginId: string): Promise<boolean>;
  updatePlugin(pluginId: string, version: string): Promise<boolean>;
  getPlugin(pluginId: string): Plugin | null;
  getAllPlugins(): Plugin[];
  getEnabledPlugins(): Plugin[];
  updatePluginConfig(pluginId: string, config: Record<string, any>): Promise<boolean>;
}

/**
 * Plugin Installation Status
 */
export interface PluginInstallationStatus {
  status: 'success' | 'error' | 'pending';
  message?: string;
  error?: Error;
  plugin?: Plugin;
}

/**
 * Plugin Event Types
 */
export enum PluginEventType {
  INSTALLED = 'plugin:installed',
  UNINSTALLED = 'plugin:uninstalled',
  ENABLED = 'plugin:enabled',
  DISABLED = 'plugin:disabled',
  UPDATED = 'plugin:updated',
  CONFIG_UPDATED = 'plugin:config:updated',
  ERROR = 'plugin:error'
}

/**
 * Plugin Event Interface
 */
export interface PluginEvent {
  type: PluginEventType;
  pluginId: string;
  timestamp: Date;
  data?: any;
  error?: Error;
}
