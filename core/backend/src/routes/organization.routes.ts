// core/backend/src/routes/organization.routes.ts

import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validators';
import { organizationController } from '../controllers/organization.controller';
import { cache } from '../middleware/cache';

const router = express.Router();

// Organization management
router.post(
  '/',
  authenticate,
  validate('createOrganization'),
  organizationController.createOrganization
);

router.get(
  '/:orgId',
  authenticate,
  cache({ duration: 300 }),
  organizationController.getOrganization
);

router.put(
  '/:orgId',
  authenticate,
  authorize(['admin', 'owner']),
  validate('updateOrganization'),
  organizationController.updateOrganization
);

router.delete(
  '/:orgId',
  authenticate,
  authorize('owner'),
  validate('deleteOrganization'),
  organizationController.deleteOrganization
);

// Member management
router.get(
  '/:orgId/members',
  authenticate,
  cache({ duration: 60 }),
  organizationController.getMembers
);

router.post(
  '/:orgId/members',
  authenticate,
  authorize(['admin', 'owner']),
  validate('inviteMember'),
  organizationController.inviteMember
);

router.put(
  '/:orgId/members/:memberId',
  authenticate,
  authorize(['admin', 'owner']),
  validate('updateMember'),
  organizationController.updateMember
);

router.delete(
  '/:orgId/members/:memberId',
  authenticate,
  authorize(['admin', 'owner']),
  organizationController.removeMember
);

// Settings and configuration
router.get(
  '/:orgId/settings',
  authenticate,
  authorize(['admin', 'owner']),
  cache({ duration: 300 }),
  organizationController.getSettings
);

router.put(
  '/:orgId/settings',
  authenticate,
  authorize(['admin', 'owner']),
  validate('updateSettings'),
  organizationController.updateSettings
);

// Billing and subscription
router.get(
  '/:orgId/billing',
  authenticate,
  authorize(['admin', 'owner']),
  organizationController.getBillingInfo
);

router.put(
  '/:orgId/billing',
  authenticate,
  authorize(['admin', 'owner']),
  validate('updateBilling'),
  organizationController.updateBillingInfo
);

export default router;
