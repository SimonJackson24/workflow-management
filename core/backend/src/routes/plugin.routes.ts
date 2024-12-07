// core/backend/src/routes/plugin.routes.ts

import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validators';
import { pluginController } from '../controllers/plugin.controller';
import { cache } from '../middleware/cache';
import { uploadPlugin } from '../middleware/upload';

const router = express.Router();

// Plugin marketplace
router.get(
  '/marketplace',
  authenticate,
  cache({ duration: 300 }),
  pluginController.getMarketplacePlugins
);

router.get(
  '/marketplace/:pluginId',
  authenticate,
  cache({ duration: 300 }),
  pluginController.getMarketplacePlugin
);

// Plugin management
router.get(
  '/',
  authenticate,
  cache({ duration: 60 }),
  pluginController.getInstalledPlugins
);

router.post(
  '/install/:pluginId',
  authenticate,
  authorize(['admin', 'owner']),
  validate('installPlugin'),
  pluginController.installPlugin
);

router.delete(
  '/uninstall/:pluginId',
  authenticate,
  authorize(['admin', 'owner']),
  validate('uninstallPlugin'),
  pluginController.uninstallPlugin
);

// Plugin configuration
router.get(
  '/:pluginId/config',
  authenticate,
  cache({ duration: 300 }),
  pluginController.getPluginConfig
);

router.put(
  '/:pluginId/config',
  authenticate,
  authorize(['admin', 'owner']),
  validate('updatePluginConfig'),
  pluginController.updatePluginConfig
);

// Plugin development
router.post(
  '/upload',
  authenticate,
  authorize('admin'),
  uploadPlugin.single('plugin'),
  validate('uploadPlugin'),
  pluginController.uploadPlugin
);

router.post(
  '/:pluginId/publish',
  authenticate,
  authorize('admin'),
  validate('publishPlugin'),
  pluginController.publishPlugin
);

// Plugin analytics
router.get(
  '/:pluginId/analytics',
  authenticate,
  authorize(['admin', 'owner']),
  cache({ duration: 300 }),
  pluginController.getPluginAnalytics
);

// Plugin reviews
router.get(
  '/:pluginId/reviews',
  authenticate,
  cache({ duration: 300 }),
  pluginController.getPluginReviews
);

router.post(
  '/:pluginId/reviews',
  authenticate,
  validate('createReview'),
  pluginController.createPluginReview
);

export default router;
