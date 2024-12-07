// core/sdk/PluginSDK.ts

import { EventEmitter } from 'events';
import { 
  PluginContext, 
  PluginConfig, 
  PluginAPI, 
  DatabaseTransaction,
  CacheOptions,
  JobOptions,
  FileSystemOptions,
  MessagingOptions,
  AnalyticsEvent
} from './types';

export class PluginSDK {
  private context: PluginContext;
  private config: PluginConfig;
  private events: EventEmitter;
  private api: PluginAPI;

  constructor(context: PluginContext) {
    this.context = context;
    this.config = context.config;
    this.events = new EventEmitter();
    this.api = this.initializeAPI();
  }

  private initializeAPI(): PluginAPI {
    return {
      // Existing APIs
      data: {
        get: async (key: string) => {
          return this.context.storage.get(key);
        },
        set: async (key: string, value: any) => {
          return this.context.storage.set(key, value);
        },
        delete: async (key: string) => {
          return this.context.storage.delete(key);
        },
        // New methods
        query: async (filter: any) => {
          return this.context.storage.query(filter);
        },
        batch: async (operations: any[]) => {
          return this.context.storage.batch(operations);
        }
      },

      // Enhanced UI Integration
      ui: {
        registerComponent: (component: any) => {
          this.context.ui.registerComponent(component);
        },
        showNotification: (message: string, options?: any) => {
          this.context.ui.showNotification(message, options);
        },
        showModal: (content: any, options?: any) => {
          return this.context.ui.showModal(content, options);
        },
        // New UI methods
        registerRoute: (route: string, component: any) => {
          this.context.ui.registerRoute(route, component);
        },
        registerMenuItem: (item: any) => {
          this.context.ui.registerMenuItem(item);
        },
        updateTheme: (theme: any) => {
          this.context.ui.updateTheme(theme);
        }
      },

      // Enhanced Event Handling
      events: {
        on: (event: string, handler: Function) => {
          this.events.on(event, handler);
        },
        emit: (event: string, data: any) => {
          this.events.emit(event, data);
        },
        off: (event: string, handler: Function) => {
          this.events.off(event, handler);
        },
        // New event methods
        once: (event: string, handler: Function) => {
          this.events.once(event, handler);
        },
        removeAllListeners: (event?: string) => {
          this.events.removeAllListeners(event);
        }
      },

      // Database Operations
      database: {
        query: async (query: string, params?: any[]) => {
          return this.context.database.query(query, params);
        },
        transaction: async (callback: (tx: DatabaseTransaction) => Promise<void>) => {
          return this.context.database.transaction(callback);
        },
        migrate: async (migrations: any[]) => {
          return this.context.database.migrate(migrations);
        }
      },

      // Cache Management
      cache: {
        get: async (key: string) => {
          return this.context.cache.get(key);
        },
        set: async (key: string, value: any, options?: CacheOptions) => {
          return this.context.cache.set(key, value, options);
        },
        delete: async (key: string) => {
          return this.context.cache.delete(key);
        },
        clear: async () => {
          return this.context.cache.clear();
        }
      },

      // File System Operations
      files: {
        read: async (path: string, options?: FileSystemOptions) => {
          return this.context.files.read(path, options);
        },
        write: async (path: string, data: any, options?: FileSystemOptions) => {
          return this.context.files.write(path, data, options);
        },
        delete: async (path: string) => {
          return this.context.files.delete(path);
        },
        list: async (directory: string) => {
          return this.context.files.list(directory);
        }
      },

      // Background Jobs
      jobs: {
        schedule: async (name: string, data: any, options?: JobOptions) => {
          return this.context.jobs.schedule(name, data, options);
        },
        cancel: async (jobId: string) => {
          return this.context.jobs.cancel(jobId);
        },
        getStatus: async (jobId: string) => {
          return this.context.jobs.getStatus(jobId);
        }
      },

      // Messaging System
      messaging: {
        publish: async (channel: string, message: any, options?: MessagingOptions) => {
          return this.context.messaging.publish(channel, message, options);
        },
        subscribe: (channel: string, handler: Function) => {
          return this.context.messaging.subscribe(channel, handler);
        },
        unsubscribe: (channel: string) => {
          return this.context.messaging.unsubscribe(channel);
        }
      },

      // Analytics
      analytics: {
        track: async (event: AnalyticsEvent) => {
          return this.context.analytics.track(event);
        },
        identify: async (userId: string, traits?: any) => {
          return this.context.analytics.identify(userId, traits);
        },
        page: async (name: string, properties?: any) => {
          return this.context.analytics.page(name, properties);
        }
      },

      // Existing APIs (HTTP, Auth, Logger)
      http: { /* ... existing http implementation ... */ },
      auth: { /* ... existing auth implementation ... */ },
      logger: { /* ... existing logger implementation ... */ }
    };
  }

  // Enhanced Lifecycle Methods
  async initialize(): Promise<void> {
    try {
      await this.context.lifecycle.initialize();
      this.logger.info('Plugin initialized successfully');
    } catch (error) {
      this.logger.error('Plugin initialization failed:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    try {
      await this.context.lifecycle.start();
      this.logger.info('Plugin started successfully');
    } catch (error) {
      this.logger.error('Plugin start failed:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await this.context.lifecycle.stop();
      this.logger.info('Plugin stopped successfully');
    } catch (error) {
      this.logger.error('Plugin stop failed:', error);
      throw error;
    }
  }

  // Enhanced Configuration Methods
  getConfig<T = any>(key: string, defaultValue?: T): T {
    try {
      return this.config.get(key) ?? defaultValue;
    } catch (error) {
      this.logger.error(`Error getting config for key ${key}:`, error);
      return defaultValue as T;
    }
  }

  setConfig<T = any>(key: string, value: T): void {
    try {
      this.config.set(key, value);
      this.events.emit('config:changed', { key, value });
    } catch (error) {
      this.logger.error(`Error setting config for key ${key}:`, error);
      throw error;
    }
  }

  // New Methods
  async cleanup(): Promise<void> {
    try {
      await this.stop();
      this.events.removeAllListeners();
      await this.context.cleanup();
    } catch (error) {
      this.logger.error('Cleanup failed:', error);
      throw error;
    }
  }

  getVersion(): string {
    return this.context.version;
  }

  getAPI(): PluginAPI {
    return this.api;
  }
}
