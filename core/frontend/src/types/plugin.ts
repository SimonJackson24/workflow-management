// core/frontend/src/types/plugin.ts

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  installed: boolean;
  status: 'active' | 'inactive' | 'error';
  configuration?: PluginConfig;
  dependencies: string[];
  permissions: string[];
  hooks: PluginHooks;
  metadata: PluginMetadata;
  stats: PluginStats;
}

export interface PluginConfig {
  settings: Record<string, any>;
  schema: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required?: boolean;
      default?: any;
      description?: string;
      enum?: any[];
      minimum?: number;
      maximum?: number;
      items?: any;
    };
  };
}

export interface PluginHooks {
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
  onUpdate?: () => Promise<void>;
}

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license: string;
  category: string;
  tags: string[];
  pricing?: {
    type: 'free' | 'paid' | 'subscription';
    price?: number;
    currency?: string;
    trial?: number;
  };
  compatibility: {
    minimumVersion: string;
    maximumVersion?: string;
  };
}

export interface PluginStats {
  installCount: number;
  rating: number;
  reviewCount: number;
  lastUpdated: Date;
  size: number;
  activeInstalls: number;
}
