// core/backend/src/controllers/plugin.controller.ts

import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { PluginService } from '../services/plugin.service';
import { validatePlugin } from '../validators/plugin.validator';
import { cache } from '../middleware/cache';

export class PluginController extends BaseController {
  constructor(private pluginService: PluginService) {
    super();
  }

  @cache({ duration: 300 })
  public async getMarketplacePlugins(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, category, sort } = req.query;
      const plugins = await this.pluginService.getMarketplacePlugins({
        page: Number(page),
        limit: Number(limit),
        category: String(category),
        sort: String(sort)
      });
      return this.ok(res, plugins);
    } catch (error) {
      next(error);
    }
  }

  public async installPlugin(req: Request, res: Response, next: NextFunction) {
    try {
      const { pluginId } = req.params;
      const { organizationId } = req.body;
      
      const plugin = await this.pluginService.installPlugin(pluginId, organizationId);
      return this.ok(res, plugin);
    } catch (error) {
      next(error);
    }
  }

  public async uninstallPlugin(req: Request, res: Response, next: NextFunction) {
    try {
      const { pluginId } = req.params;
      const { organizationId } = req.body;
      
      await this.pluginService.uninstallPlugin(pluginId, organizationId);
      return this.ok(res);
    } catch (error) {
      next(error);
    }
  }

  public async updatePluginConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { pluginId } = req.params;
      const config = await this.pluginService.updateConfig(pluginId, req.body);
      return this.ok(res, config);
    } catch (error) {
      next(error);
    }
  }

  public async getPluginAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { pluginId } = req.params;
      const { startDate, endDate } = req.query;
      
      const analytics = await this.pluginService.getAnalytics(
        pluginId,
        String(startDate),
        String(endDate)
      );
      return this.ok(res, analytics);
    } catch (error) {
      next(error);
    }
  }

  // ... other plugin-related methods
}

export const pluginController = new PluginController(new PluginService());
