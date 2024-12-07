// core/backend/src/routes/index.ts

import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import organizationRoutes from './organization.routes';
import pluginRoutes from './plugin.routes';
import subscriptionRoutes from './subscription.routes';
import webhookRoutes from './webhook.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/plugins', pluginRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
