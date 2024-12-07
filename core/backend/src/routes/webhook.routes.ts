// core/backend/src/routes/webhook.routes.ts

import express from 'express';
import { webhookController } from '../controllers/webhook.controller';
import { validateWebhookSignature } from '../middleware/webhook';

const router = express.Router();

// Stripe webhooks
router.post(
  '/stripe',
  validateWebhookSignature('stripe'),
  webhookController.handleStripeWebhook
);

// GitHub webhooks
router.post(
  '/github',
  validateWebhookSignature('github'),
  webhookController.handleGithubWebhook
);

// Plugin webhooks
router.post(
  '/plugins/:pluginId',
  validateWebhookSignature('plugin'),
  webhookController.handlePluginWebhook
);

// Integration webhooks
router.post(
  '/integrations/:integrationId',
  validateWebhookSignature('integration'),
  webhookController.handleIntegrationWebhook
);

export default router;
