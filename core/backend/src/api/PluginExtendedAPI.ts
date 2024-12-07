// core/backend/src/api/PluginExtendedAPI.ts

import { Router } from 'express';
import { PluginController } from '../controllers/PluginController';
import { validateRequest } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { pluginSchemas } from '../schemas/plugin.schemas';

export class PluginExtendedAPI {
  private router: Router;
  private controller: PluginController;

  constructor() {
    this.router = Router();
    this.controller = new PluginController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Plugin Lifecycle Management
    this.router.post(
      '/plugins/:pluginId/start',
      authenticate,
      authorize(['admin']),
      this.controller.startPlugin
    );

    this.router.post(
      '/plugins/:pluginId/stop',
      authenticate,
      authorize(['admin']),
      this.controller.stopPlugin
    );

    this.router.post(
      '/plugins/:pluginId/restart',
      authenticate,
      authorize(['admin']),
      this.controller.restartPlugin
    );

    // Plugin Configuration
    this.router.get(
      '/plugins/:pluginId/config/schema',
      authenticate,
      this.controller.getConfigSchema
    );

    this.router.post(
      '/plugins/:pluginId/config/validate',
      authenticate,
      validateRequest(pluginSchemas.configValidation),
      this.controller.validateConfig
    );

    // Plugin Development
    this.router.post(
      '/plugins/:pluginId/debug',
      authenticate,
      authorize(['developer']),
      this.controller.enableDebugMode
    );

    this.router.get(
      '/plugins/:pluginId/logs',
      authenticate,
      this.controller.getPluginLogs
    );

    // Plugin Monitoring
    this.router.get(
      '/plugins/:pluginId/metrics',
      authenticate,
      this.controller.getPluginMetrics
    );

    this.router.get(
      '/plugins/:pluginId/health',
      authenticate,
      this.controller.getPluginHealth
    );

    // Plugin Security
    this.router.post(
      '/plugins/:pluginId/scan',
      authenticate,
      authorize(['admin']),
      this.controller.scanPlugin
    );

    this.router.get(
      '/plugins/:pluginId/permissions',
      authenticate,
      this.controller.getPluginPermissions
    );

    // Plugin Updates
    this.router.get(
      '/plugins/:pluginId/updates',
      authenticate,
      this.controller.checkUpdates
    );

    this.router.post(
      '/plugins/:pluginId/update',
      authenticate,
      authorize(['admin']),
      validateRequest(pluginSchemas.update),
      this.controller.updatePlugin
    );

    // Plugin Backup & Restore
    this.router.post(
      '/plugins/:pluginId/backup',
      authenticate,
      authorize(['admin']),
      this.controller.backupPlugin
    );

    this.router.post(
      '/plugins/:pluginId/restore',
      authenticate,
      authorize(['admin']),
      validateRequest(pluginSchemas.restore),
      this.controller.restorePlugin
    );

    // Plugin Dependencies
    this.router.get(
      '/plugins/:pluginId/dependencies',
      authenticate,
      this.controller.getPluginDependencies
    );

    this.router.post(
      '/plugins/:pluginId/dependencies/check',
      authenticate,
      this.controller.checkDependencies
    );

    // Plugin Events & Webhooks
    this.router.post(
      '/plugins/:pluginId/webhooks',
      authenticate,
      validateRequest(pluginSchemas.webhook),
      this.controller.registerWebhook
    );

    this.router.get(
      '/plugins/:pluginId/events',
      authenticate,
      this.controller.getPluginEvents
    );

    // Plugin Marketplace Integration
    this.router.post(
      '/plugins/:pluginId/publish',
      authenticate,
      authorize(['developer']),
      validateRequest(pluginSchemas.publish),
      this.controller.publishPlugin
    );

    this.router.post(
      '/plugins/:pluginId/unpublish',
      authenticate,
      authorize(['developer']),
      this.controller.unpublishPlugin
    );

    // Plugin Analytics
    this.router.get(
      '/plugins/:pluginId/analytics',
      authenticate,
      this.controller.getPluginAnalytics
    );

    this.router.get(
      '/plugins/:pluginId/usage',
      authenticate,
      this.controller.getPluginUsage
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
