// core/backend/src/routes/auth.routes.ts

import express from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validators';
import { authController } from '../controllers/auth.controller';
import { rateLimiter } from '../middleware/rate-limiter';

const router = express.Router();

// Authentication routes
router.post(
  '/register',
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 requests per hour
  validate('register'),
  authController.register
);

router.post(
  '/login',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  validate('login'),
  authController.login
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.post(
  '/refresh-token',
  validate('refreshToken'),
  authController.refreshToken
);

// Password management
router.post(
  '/forgot-password',
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 3 }), // 3 requests per hour
  validate('forgotPassword'),
  authController.forgotPassword
);

router.post(
  '/reset-password/:token',
  validate('resetPassword'),
  authController.resetPassword
);

router.put(
  '/change-password',
  authenticate,
  validate('changePassword'),
  authController.changePassword
);

// Email verification
router.post(
  '/verify-email/:token',
  validate('verifyEmail'),
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  authenticate,
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 3 }), // 3 requests per hour
  authController.resendVerification
);

// Two-factor authentication
router.post(
  '/2fa/enable',
  authenticate,
  authController.enable2FA
);

router.post(
  '/2fa/verify',
  authenticate,
  validate('verify2FA'),
  authController.verify2FA
);

router.post(
  '/2fa/disable',
  authenticate,
  validate('disable2FA'),
  authController.disable2FA
);

// Session management
router.get(
  '/sessions',
  authenticate,
  authController.getSessions
);

router.delete(
  '/sessions/:sessionId',
  authenticate,
  authController.revokeSession
);

router.delete(
  '/sessions',
  authenticate,
  authController.revokeAllSessions
);

export default router;
