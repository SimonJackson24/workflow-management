// core/backend/src/services/plugin.service.ts

import { Plugin, IPlugin } from '../models/plugin.model';
import { Organization } from '../models/organization.model';
import { ApiError } from '../utils/errors';
import { AuditService } from './audit.service';
import { validatePlugin } from '../validators/plugin.validator';
import { S3Service } from './s3.service';
import { logger } from '../utils/logger';

export class PluginService {
  constructor(
    private auditService: AuditService,
    private s3Service: S3Service
  ) {}

  async findById(id: string): Promise<IPlugin> {
    const plugin = await Plugin.findById(id);
    if (!plugin) {
      throw new ApiError(404, 'Plugin not found');
    }
    return plugin;
  }

  async findBySlug(slug: string): Promise<IPlugin> {
    const plugin = await Plugin.findOne({ slug });
    if (!plugin) {
      throw new ApiError(404, 'Plugin not found');
    }
    return plugin;
  }

  async create(data: Partial<IPlugin>, files?: Express.Multer.File[]): Promise<IPlugin> {
    // Validate plugin data
    const validatedData = await validatePlugin(data);

    // Upload screenshots if provided
    if (files?.length) {
      const screenshots = await Promise.all(
        files.map(file => this.s3Service.uploadFile(file, 'plugin-screenshots'))
      );
      validatedData.screenshots = screenshots.map(s => s.url);
    }

    // Create plugin
    const plugin = new Plugin(validatedData);
    await plugin.save();

    // Audit log
    await this.auditService.log({
      action: 'plugin.created',
      resourceId: plugin.id,
      resourceType: 'plugin',
      metadata: {
        name: plugin.name,
        version: plugin.version
      }
    });

    return plugin;
  }

  async update(id: string, data: Partial<IPlugin>, files?: Express.Multer.File[]): Promise<IPlugin> {
    const plugin = await this.findById(id);

    // Validate update data
    const validatedData = await validatePlugin(data, true);

    // Upload new screenshots if provided
    if (files?.length) {
      // Delete old screenshots
      if (plugin.screenshots?.length) {
        await Promise.all(
          plugin.screenshots.map(url => this.s3Service.deleteFile(url))
        );
      }

      // Upload new screenshots
      const screenshots = await Promise.all(
        files.map(file => this.s3Service.uploadFile(file, 'plugin-screenshots'))
      );
      validatedData.screenshots = screenshots.map(s => s.url);
    }

    // Update plugin
    Object.assign(plugin, validatedData);
    await plugin.save();

    // Audit log
    await this.auditService.log({
      action: 'plugin.updated',
      resourceId: plugin.id,
      resourceType: 'plugin',
      metadata: {
        updatedFields: Object.keys(validatedData)
      }
    });

    return plugin;
  }

  async install(pluginId: string, organizationId: string, userId: string): Promise<void> {
    const [plugin, organization] = await Promise.all([
      this.findById(pluginId),
      Organization.findById(organizationId)
    ]);

    if (!organization) {
      throw new ApiError(404, 'Organization not found');
    }

    // Check if plugin is already installed
    if (organization.plugins.some(p => p.id === pluginId)) {
      throw new ApiError(400, 'Plugin already installed');
    }

    // Check plugin requirements
    await this.checkRequirements(plugin, organization);

    // Add plugin to organization
    organization.plugins.push({
      id: pluginId,
      enabled: true,
      config: plugin.configuration.defaultValues,
      installedAt: new Date(),
      installedBy: userId
    });

    await organization.save();

    // Update plugin stats
    await Plugin.findByIdAndUpdate(pluginId, {
      $inc: {
        'stats.installations': 1,
        'stats.activeInstallations': 1
      }
    });

    // Audit log
    await this.auditService.log({
      action: 'plugin.installed',
      resourceId: pluginId,
      resourceType: 'plugin',
      organizationId,
      userId,
      metadata: {
        pluginName: plugin.name,
        version: plugin.version
      }
    });
  }

  async uninstall(pluginId: string, organizationId: string, userId: string): Promise<void> {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new ApiError(404, 'Organization not found');
    }

    // Remove plugin from organization
    const pluginIndex = organization.plugins.findIndex(p => p.id === pluginId);
    if (pluginIndex === -1) {
      throw new ApiError(404, 'Plugin not installed');
    }

    organization.plugins.splice(pluginIndex, 1);
    await organization.save();

    // Update plugin stats
    await Plugin.findByIdAndUpdate(pluginId, {
      $inc: {
        'stats.activeInstallations': -1
      }
    });

    // Audit log
    await this.auditService.log({
      action: 'plugin.uninstalled',
      resourceId: pluginId,
      resourceType: 'plugin',
      organizationId,
      userId
    });
  }

  async updateConfiguration(
    pluginId: string,
    organizationId: string,
    config: Record<string, any>,
    userId: string
  ): Promise<void> {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new ApiError(404, 'Organization not found');
    }

    const plugin = organization.plugins.find(p => p.id === pluginId);
    if (!plugin) {
      throw new ApiError(404, 'Plugin not installed');
    }

    // Validate configuration against schema
    const validatedConfig = await this.validateConfiguration(pluginId, config);

    // Update configuration
    plugin.config = validatedConfig;
    await organization.save();

    // Audit log
    await this.auditService.log({
      action: 'plugin.configured',
      resourceId: pluginId,
      resourceType: 'plugin',
      organizationId,
      userId,
      metadata: {
        updatedFields: Object.keys(config)
      }
    });
  }

  private async checkRequirements(plugin: IPlugin, organization: any): Promise<void> {
    // Check platform compatibility
    if (plugin.requirements.platform && !plugin.requirements.platform.includes(process.platform)) {
      throw new ApiError(400, 'Plugin not compatible with current platform');
    }

    // Check subscription plan compatibility
    if (plugin.pricing.type !== 'free' && organization.subscription.planId === 'free') {
      throw new ApiError(400, 'Plugin requires paid subscription');
    }

    // Add more requirement checks as needed
  }

  private async validateConfiguration(pluginId: string, config: Record<string, any>): Promise<Record<string, any>> {
    const plugin = await this.findById(pluginId);
    
    // Implement configuration validation against plugin.configuration.schema
    // This would depend on your schema format and validation requirements
    
    return config;
  }
}

export const pluginService = new PluginService(
  new AuditService(),
  new S3Service()
);
