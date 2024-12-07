// core/sdk/PluginSDK.ts

import { EventEmitter } from 'events';
import { PluginContext, PluginConfig, PluginAPI } from './types';

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
      // Data Management
      data: {
        get: async (key: string) => {
          return this.context.storage.get(key);
        },
        set: async (key: string, value: any) => {
          return this.context.storage.set(key, value);
        },
        delete: async (key: string) => {
          return this.context.storage.delete(key);
        }
      },

      // UI Integration
      ui: {
        registerComponent: (component: any) => {
          this.context.ui.registerComponent(component);
        },
        showNotification: (message: string, options?: any) => {
          this.context.ui.showNotification(message, options);
        },
        showModal: (content: any, options?: any) => {
          return this.context.ui.showModal(content, options);
        }
      },

      // Event Handling
      events: {
        on: (event: string, handler: Function) => {
          this.events.on(event, handler);
        },
        emit: (event: string, data: any) => {
          this.events.emit(event, data);
        },
        off: (event: string, handler: Function) => {
          this.events.off(event, handler);
        }
      },

      // HTTP Client
      http: {
        get: async (url: string, options?: any) => {
          return this.context.http.get(url, options);
        },
        post: async (url: string, data: any, options?: any) => {
          return this.context.http.post(url, data, options);
        },
        put: async (url: string, data: any, options?: any) => {
          return this.context.http.put(url, data, options);
        },
        delete: async (url: string, options?: any) => {
          return this.context.http.delete(url, options);
        }
      },

      // Authentication
      auth: {
        getCurrentUser: () => {
          return this.context.auth.getCurrentUser();
        },
        isAuthenticated: () => {
          return this.context.auth.isAuthenticated();
        }
      },

      // Logging
      logger: {
        info: (message: string, ...args: any[]) => {
          this.context.logger.info(message, ...args);
        },
        error: (message: string, ...args: any[]) => {
          this.context.logger.error(message, ...args);
        },
        warn: (message: string, ...args: any[]) => {
          this.context.logger.warn(message, ...args);
        },
        debug: (message: string, ...args: any[]) => {
          this.context.logger.debug(message, ...args);
        }
      }
    };
  }

  // Plugin Lifecycle Methods
  async initialize(): Promise<void> {
    // Initialize plugin
    await this.context.lifecycle.initialize();
  }

  async start(): Promise<void> {
    // Start plugin
    await this.context.lifecycle.start();
  }

  async stop(): Promise<void> {
    // Stop plugin
    await this.context.lifecycle.stop();
  }

  // Configuration Methods
  getConfig<T = any>(key: string): T {
    return this.config.get(key);
  }

  setConfig<T = any>(key: string, value: T): void {
    this.config.set(key, value);
  }

  // API Access
  getAPI(): PluginAPI {
    return this.api;
  }
}
