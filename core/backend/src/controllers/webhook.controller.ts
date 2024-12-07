// core/backend/src/controllers/webhook.controller.ts

import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { WebhookService } from '../services/webhook.service';
import { logger } from '../utils/logger';

export class WebhookController extends BaseController {
  constructor(private webhookService: WebhookService) {
    super();
  }

  public async handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const event = req.body;
      logger.info('Received Stripe webhook:', event.type);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.webhookService.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.failed':
          await this.webhookService.handlePaymentFailure(event.data.object);
          break;
        case 'subscription.created':
          await this.webhookService.handleSubscriptionCreated(event.data.object);
          break;
        case 'subscription.updated':
          await this.webhookService.handleSubscriptionUpdated(event.data.object);
          break;
        case 'subscription.deleted':
          await this.webhookService.handleSubscriptionCancelled(event.data.object);
          break;
        default:
          logger.warn('Unhandled Stripe webhook event:', event.type);
      }

      return this.ok(res);
    } catch (error) {
      next(error);
    }
  }

  public async handleGithubWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const event = req.headers['x-github-event'];
      const payload = req.body;
      
      logger.info('Received GitHub webhook:', event);

      switch (event) {
        case 'push':
          await this.webhookService.handleGithubPush(payload);
          break;
        case 'pull_request':
          await this.webhookService.handleGithubPullRequest(payload);
          break;
        default:
          logger.warn('Unhandled GitHub webhook event:', event);
      }

      return this.ok(res);
    } catch (error) {
      next(error);
    }
  }

  public async handlePluginWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { pluginId } = req.params;
      const event = req.body;

      await this.webhookService.handlePluginWebhook(pluginId, event);
      return this.ok(res);
    } catch (error) {
      next(error);
    }
  }

  // ... other webhook-related methods
}

export const webhookController = new WebhookController(new WebhookService());
