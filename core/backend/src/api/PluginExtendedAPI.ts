// core/backend/src/api/PluginExtendedAPI.ts

import { Router } from 'express';
import { PluginController } from '../controllers/PluginController';
import { validateRequest } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';

export class PluginExtendedAPI {
  private router: Router;
  private controller: PluginController;

  constructor() {
    this.router = Router();
    this.controller = new PluginController();
    this.setupExtendedRoutes();
  }

  private setupExtendedRoutes(): void {
    // Advanced Plugin Management
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
      this.controller.restorePlugin
    );

    this.router.post(
      '/plugins/:pluginId/migrate',
      authenticate,
      authorize(['admin']),
      this.controller.migratePlugin
    );

    // Plugin Development & Testing
    this.router.post(
      '/plugins/test',
      authenticate,
      authorize(['developer']),
      this.controller.testPlugin
    );

    this.router.get(
      '/plugins/:pluginId/test-results',
      authenticate,
      this.controller.getTestResults
    );

    this.router.post(
      '/plugins/:pluginId/debug',
      authenticate,
      authorize(['developer']),
      this.controller.enableDebugMode
    );

    // Plugin Performance & Monitoring
    this.router.get(
      '/plugins/:pluginId/metrics',
      authenticate,
      this.controller.getPluginMetrics
    );

    this.router.get(
      '/plugins/:pluginId/traces',
      authenticate,
      this.controller.getPluginTraces
    );

    this.router.get(
      '/plugins/:pluginId/profiling',
      authenticate,
      authorize(['admin']),
      this.controller.getPluginProfiling
    );

    // Plugin Security
    this.router.post(
      '/plugins/:pluginId/security-scan',
      authenticate,
      authorize(['admin']),
      this.controller.scanPluginSecurity
    );

    this.router.get(
      '/plugins/:pluginId/audit-log',
      authenticate,
      this.controller.getPluginAuditLog
    );

    this.router.post(
      '/plugins/:pluginId/permissions',
      authenticate,
      authorize(['admin']),
      this.controller.updatePluginPermissions
    );

    // Plugin Integration
    this.router.post(
      '/plugins/:pluginId/integrations',
      authenticate,
      this.controller.createPluginIntegration
    );

    this.router.get(
      '/plugins/:pluginId/integrations',
      authenticate,
      this.controller.listPluginIntegrations
    );

    // Plugin Data Management
    this.router.post(
      '/plugins/:pluginId/data/export',
      authenticate,
      this.controller.exportPluginData
    );

    this.router.post(
      '/plugins/:pluginId/data/import',
      authenticate,
      authorize(['admin']),
      this.controller.importPluginData
    );

    // Plugin Collaboration
    this.router.post(
      '/plugins/:pluginId/share',
      authenticate,
      this.controller.sharePlugin
    );

    this.router.get(
      '/plugins/:pluginId/collaborators',
      authenticate,
      this.controller.getPluginCollaborators
    );

    // Plugin Marketplace Integration
    this.router.post(
      '/plugins/:pluginId/publish',
      authenticate,
      authorize(['developer']),
      this.controller.publishPlugin
    );

    this.router.post(
      '/plugins/:pluginId/reviews',
      authenticate,
      this.controller.addPluginReview
    );

    // Plugin Documentation
    this.router.get(
      '/plugins/:pluginId/docs',
      authenticate,
      this.controller.getPluginDocs
    );

    this.router.post(
      '/plugins/:pluginId/docs',
      authenticate,
      authorize(['developer']),
      this.controller.updatePluginDocs
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
