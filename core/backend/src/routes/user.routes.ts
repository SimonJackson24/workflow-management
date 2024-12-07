// core/backend/src/routes/user.routes.ts

import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validators';
import { userController } from '../controllers/user.controller';
import { cache } from '../middleware/cache';

const router = express.Router();

// User profile management
router.get(
  '/me',
  authenticate,
  cache({ duration: 300 }), // Cache for 5 minutes
  userController.getCurrentUser
);

router.put(
  '/me',
  authenticate,
  validate('updateProfile'),
  userController.updateProfile
);

router.delete(
  '/me',
  authenticate,
  validate('deleteAccount'),
  userController.deleteAccount
);

// User management (admin only)
router.get(
  '/',
  authenticate,
  authorize('admin'),
  cache({ duration: 60 }),
  userController.getUsers
);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate('createUser'),
  userController.createUser
);

router.get(
  '/:userId',
  authenticate,
  authorize('admin'),
  cache({ duration: 300 }),
  userController.getUser
);

router.put(
  '/:userId',
  authenticate,
  authorize('admin'),
  validate('updateUser'),
  userController.updateUser
);

router.delete(
  '/:userId',
  authenticate,
  authorize('admin'),
  validate('deleteUser'),
  userController.deleteUser
);

// User preferences
router.get(
  '/preferences',
  authenticate,
  cache({ duration: 300 }),
  userController.getPreferences
);

router.put(
  '/preferences',
  authenticate,
  validate('updatePreferences'),
  userController.updatePreferences
);

// User activity
router.get(
  '/activity',
  authenticate,
  cache({ duration: 60 }),
  userController.getActivity
);

// User notifications
router.get(
  '/notifications',
  authenticate,
  cache({ duration: 60 }),
  userController.getNotifications
);

router.put(
  '/notifications/:notificationId',
  authenticate,
  userController.markNotificationRead
);

router.delete(
  '/notifications/:notificationId',
  authenticate,
  userController.deleteNotification
);

// User permissions
router.get(
  '/:userId/permissions',
  authenticate,
  authorize('admin'),
  cache({ duration: 300 }),
  userController.getUserPermissions
);

router.put(
  '/:userId/permissions',
  authenticate,
  authorize('admin'),
  validate('updatePermissions'),
  userController.updateUserPermissions
);

export default router;
