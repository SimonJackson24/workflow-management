// core/backend/src/services/PluginSandboxService.ts

import { VM, NodeVM, VMScript } from 'vm2';
import { promises as fs } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import {
  SandboxConfig,
  ResourceLimits,
  NetworkRules,
  FileSystemRules,
  ProcessRules
} from '../types/sandbox.types';

export class PluginSandboxService {
  private readonly sandboxes: Map<string, NodeVM>;
  private readonly resourceMonitor: ResourceMonitor;
  private readonly networkController: NetworkController;
  private readonly fsController: FileSystemController;
  private readonly processManager: ProcessManager;
  private readonly eventEmitter: EventEmitter;

  constructor() {
    this.sandboxes = new Map();
    this.resourceMonitor = new ResourceMonitor();
    this.networkController = new NetworkController();
    this.fsController = new FileSystemController();
    this.processManager = new ProcessManager();
    this.eventEmitter = new EventEmitter();
  }

  async createSandbox(pluginId: string, config: SandboxConfig): Promise<void> {
    try {
      // Create isolated directory
      const sandboxDir = await this.createSandboxDirectory(pluginId);

      // Set up resource limits
      await this.resourceMonitor.setupLimits(pluginId, config.resources);

      // Configure network access
      await this.networkController.setupRules(pluginId, config.network);

      // Set up filesystem restrictions
      await this.fsController.setupRules(pluginId, config.filesystem);

      // Initialize process management
      await this.processManager.initialize(pluginId, config.process);

      // Create sandbox instance
      const sandbox = new NodeVM({
        console: 'redirect',
        sandbox: {},
        require: {
          external: false,
          builtin: this.getAllowedModules(config),
          root: sandboxDir,
          mock: this.createMocks(pluginId)
        },
        wrapper: 'none',
        sourceExtensions: ['js', 'json'],
        env: this.createEnvironment(pluginId, config)
      });

      // Set up event handlers
      this.setupEventHandlers(pluginId, sandbox);

      // Store sandbox instance
      this.sandboxes.set(pluginId, sandbox);

      // Start monitoring
      this.startMonitoring(pluginId);

    } catch (error) {
      await this.cleanup(pluginId);
      throw error;
    }
  }

  private async createSandboxDirectory(pluginId: string): Promise<string> {
    const dir = path.join(process.cwd(), 'sandboxes', pluginId);
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  private getAllowedModules(config: SandboxConfig): string[] {
    // Return list of allowed modules based on config
    return ['crypto', 'path', 'url'].filter(module => 
      config.allowedModules.includes(module)
    );
  }

  private createMocks(pluginId: string): Record<string, any> {
    return {
      fs: this.fsController.createRestrictedFS(pluginId),
      net: this.networkController.createRestrictedNetwork(pluginId),
      child_process: this.processManager.createRestrictedProcess(pluginId)
    };
  }

  private createEnvironment(pluginId: string, config: SandboxConfig): Record<string, any> {
    return {
      PLUGIN_ID: pluginId,
      NODE_ENV: process.env.NODE_ENV,
      ...this.filterEnvironmentVariables(config.env)
    };
  }

  private filterEnvironmentVariables(env: Record<string, string>): Record<string, string> {
    // Filter sensitive environment variables
    const allowedVars = ['NODE_ENV', 'PUBLIC_URL'];
    return Object.fromEntries(
      Object.entries(env).filter(([key]) => allowedVars.includes(key))
    );
  }

  private setupEventHandlers(pluginId: string, sandbox: NodeVM): void {
    sandbox.on('console.log', (...args) => {
      this.eventEmitter.emit('log', {
        pluginId,
        level: 'info',
        message: args.join(' '),
        timestamp: new Date()
      });
    });

    sandbox.on('error', (error) => {
      this.eventEmitter.emit('error', {
        pluginId,
        error,
        timestamp: new Date()
      });
    });
  }

  private startMonitoring(pluginId: string): void {
    this.resourceMonitor.startMonitoring(pluginId, (metrics) => {
      this.eventEmitter.emit('metrics', {
        pluginId,
        ...metrics,
        timestamp: new Date()
      });

      if (metrics.exceedsLimits) {
        this.handleResourceViolation(pluginId, metrics);
      }
    });
  }

  private async handleResourceViolation(pluginId: string, metrics: any): Promise<void> {
    this.eventEmitter.emit('violation', {
      pluginId,
      metrics,
      timestamp: new Date()
    });

    // Attempt to gracefully stop the plugin
    await this.stopPlugin(pluginId);
  }

  async runInSandbox(pluginId: string, code: string): Promise<any> {
    const sandbox = this.sandboxes.get(pluginId);
    if (!sandbox) {
      throw new Error(`Sandbox not found for plugin: ${pluginId}`);
    }

    try {
      return await sandbox.run(new VMScript(code));
    } catch (error) {
      this.eventEmitter.emit('error', {
        pluginId,
        error,
        timestamp: new Date()
      });
      throw error;
    }
  }

  async stopPlugin(pluginId: string): Promise<void> {
    const sandbox = this.sandboxes.get(pluginId);
    if (sandbox) {
      // Stop monitoring
      this.resourceMonitor.stopMonitoring(pluginId);

      // Clean up network rules
      await this.networkController.cleanupRules(pluginId);

      // Clean up filesystem
      await this.fsController.cleanup(pluginId);

      // Stop processes
      await this.processManager.cleanup(pluginId);

      // Dispose sandbox
      sandbox.dispose();
      this.sandboxes.delete(pluginId);
    }
  }

  async cleanup(pluginId: string): Promise<void> {
    await this.stopPlugin(pluginId);
    
    // Clean up sandbox directory
    const sandboxDir = path.join(process.cwd(), 'sandboxes', pluginId);
    await fs.rm(sandboxDir, { recursive: true, force: true });
  }

  // Event listeners
  onLog(handler: (log: any) => void): void {
    this.eventEmitter.on('log', handler);
  }

  onError(handler: (error: any) => void): void {
    this.eventEmitter.on('error', handler);
  }

  onMetrics(handler: (metrics: any) => void): void {
    this.eventEmitter.on('metrics', handler);
  }

  onViolation(handler: (violation: any) => void): void {
    this.eventEmitter.on('violation', handler);
  }
}
