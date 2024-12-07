/**
 * Base Plugin Configuration
 * Defines the basic structure of a plugin
 */
export interface PluginConfig {
  id: string;                  // Unique identifier for the plugin
  name: string;               // Display name of the plugin
  version: string;            // Semantic version number
  enabled: boolean;           // Whether the plugin is currently enabled
  configurable: boolean;      // Whether the plugin has configurable settings
  settings?: Record<string, any>; // Plugin-specific settings
}

/**
 * Plugin Metadata Interface
 * Contains information about the plugin package
 */
export interface PluginMetadata {
  id: string;                 // Unique identifier
  name: string;               // Display name
  version: string;            // Version number
  description: string;        // Plugin description
  author: string;            // Plugin author
  license: string;           // License type
  repository?: string;       // Source code repository
  dependencies?: {           // Required dependencies
    [key: string]: string;   // Package name -> version requirement
  };
  configSchema?: {           // Configuration schema
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required?: boolean;
      default?: any;
      description?: string;
    };
  };
}

/**
 * Plugin Lifecycle Hooks
 * Methods called during plugin lifecycle events
 */
export interface PluginHooks {
  onInstall?: () => Promise<void>;     // Called when plugin is installed
  onUninstall?: () => Promise<void>;   // Called when plugin is removed
  onEnable?: () => Promise<void>;      // Called when plugin is enabled
  onDisable?: () => Promise<void>;     // Called when plugin is disabled
  onUpdate?: (previousVersion: string) => Promise<void>;  // Called during updates
  onConfigUpdate?: (newConfig: Record<string, any>) => Promise<void>;  // Called when config changes
}

/**
 * Plugin Route Interface
 * Defines API routes provided by the plugin
 */
export interface PluginRoute {
  path: string;              // Route path
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';  // HTTP method
  handler: Function;         // Route handler function
  middleware?: Function[];   // Optional middleware
  auth?: boolean;           // Whether route requires authentication
  roles?: string[];         // Required roles for access
}

/**
 * Plugin UI Component Interface
 * Defines frontend components provided by the plugin
 */
export interface PluginUIComponent {
  type: 'dashboard' | 'settings' | 'modal' | 'sidebar';  // Component type
  component: any;           // React component
  props?: Record<string, any>;  // Component props
  position?: string;       // Rendering position
  priority?: number;       // Rendering priority
}

/**
 * Plugin Permission Interface
 * Defines access control for plugin features
 */
export interface PluginPermission {
  id: string;              // Permission identifier
  name: string;            // Display name
  description: string;     // Permission description
  roles?: string[];        // Roles that have this permission
}

/**
 * Main Plugin Interface
 * Complete plugin definition
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
 * Defines methods for managing plugins
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
 * Result of plugin installation attempt
 */
export interface PluginInstallationStatus {
  status: 'success' | 'error' | 'pending';
  message?: string;
  error?: Error;
  plugin?: Plugin;
}

/**
 * Plugin Event Types
 * Different types of plugin-related events
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
 * Structure of plugin-related events
 */
export interface PluginEvent {
  type: PluginEventType;
  pluginId: string;
  timestamp: Date;
  data?: any;
  error?: Error;
}
