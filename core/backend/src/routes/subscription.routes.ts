import express from 'express';
import subscriptionController from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth';
import { validateSubscription } from '../middleware/validators';
import { rateLimiter } from '../middleware/rate-limiter';
import { cacheMiddleware } from '../middleware/cache';
import { validateWebhookSignature } from '../middleware/stripe';

const router = express.Router();

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubscriptionInput'
 */
router.post(
  '/',
  authenticate,
  validateSubscription('create'),
  rateLimiter({ windowMs: 60000, max: 5 }), // 5 requests per minute
  subscriptionController.createSubscription
);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     summary: Get subscription details
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/:id',
  authenticate,
  cacheMiddleware(300), // Cache for 5 minutes
  subscriptionController.getSubscription
);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   put:
 *     summary: Update subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put(
  '/:id',
  authenticate,
  validateSubscription('update'),
  rateLimiter({ windowMs: 60000, max: 3 }), // 3 requests per minute
  subscriptionController.updateSubscription
);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   delete:
 *     summary: Cancel subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete(
  '/:id',
  authenticate,
  rateLimiter({ windowMs: 300000, max: 3 }), // 3 requests per 5 minutes
  subscriptionController.cancelSubscription
);

/**
 * @swagger
 * /api/subscriptions/{id}/invoices:
 *   get:
 *     summary: Get subscription invoices
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: starting_after
 *         schema:
 *           type: string
 */
router.get(
  '/:id/invoices',
  authenticate,
  cacheMiddleware(300), // Cache for 5 minutes
  subscriptionController.getInvoices
);

/**
 * @swagger
 * /api/subscriptions/{id}/payment-method:
 *   put:
 *     summary: Update payment method
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put(
  '/:id/payment-method',
  authenticate,
  validateSubscription('payment-method'),
  rateLimiter({ windowMs: 60000, max: 3 }), // 3 requests per minute
  subscriptionController.updatePaymentMethod
);

/**
 * @swagger
 * /api/subscriptions/webhook:
 *   post:
 *     summary: Handle Stripe webhook
 *     tags: [Subscriptions]
 *     security:
 *       - stripeSignature: []
 */
router.post(
  '/webhook',
  validateWebhookSignature,
  rateLimiter({ windowMs: 1000, max: 100 }), // 100 requests per second
  subscriptionController.handleWebhook
);

/**
 * Error handling middleware
 */
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Subscription Route Error:', err);
  
  if (err.type === 'StripeSignatureVerificationError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid signature'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

export default router;
