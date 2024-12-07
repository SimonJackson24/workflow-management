import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from './async';
import { ApiError } from '../utils/errors';
import User from '../models/user.model';
import Organization from '../models/organization.model';
import { redisClient } from '../config/redis';

interface JwtPayload {
  id: string;
  organizationId: string;
  role: string;
  version: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      organization?: any;
    }
  }
}

/**
 * Protect routes - Authentication middleware
 */
export const authenticate = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    // Check token version in Redis (for invalidation)
    const storedVersion = await redisClient.get(`token:${decoded.id}`);
    if (storedVersion && storedVersion !== decoded.version) {
      throw new ApiError(401, 'Token has been invalidated');
    }

    // Get user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(401, 'User account is deactivated');
    }

    // Get organization
    const organization = await Organization.findById(decoded.organizationId);
    if (!organization) {
      throw new ApiError(401, 'Organization not found');
    }

    // Check subscription status
    if (
      !organization.subscription.status ||
      organization.subscription.status === 'canceled'
    ) {
      throw new ApiError(402, 'Subscription required');
    }

    // Add user and organization to request
    req.user = user;
    req.organization = organization;

    // Add permission checking methods to user
    req.user.canManageSubscriptions = (orgId: string) => {
      return (
        decoded.organizationId === orgId &&
        ['owner', 'admin'].includes(decoded.role)
      );
    };

    req.user.canViewSubscription = (orgId: string) => {
      return (
        decoded.organizationId === orgId &&
        ['owner', 'admin', 'manager'].includes(decoded.role)
      );
    };

    req.user.canManageBilling = (orgId: string) => {
      return (
        decoded.organizationId === orgId &&
        ['owner', 'admin'].includes(decoded.role)
      );
    };

    req.user.canViewBilling = (orgId: string) => {
      return (
        decoded.organizationId === orgId &&
        ['owner', 'admin', 'manager'].includes(decoded.role)
      );
    };

    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized to access this route');
  }
});

/**
 * Grant access to specific roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role ${req.user.role} is not authorized to access this route`
      );
    }
    next();
  };
};

/**
 * Check subscription status
 */
export const checkSubscription = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const organization = req.organization;

  // Check if subscription is active
  if (
    !organization.subscription.status ||
    organization.subscription.status === 'canceled'
  ) {
    throw new ApiError(402, 'Active subscription required');
  }

  // Check if subscription has expired
  if (
    organization.subscription.currentPeriodEnd &&
    new Date(organization.subscription.currentPeriodEnd) < new Date()
  ) {
    throw new ApiError(402, 'Subscription has expired');
  }

  next();
});

/**
 * Check feature access
 */
export const checkFeatureAccess = (feature: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const organization = req.organization;

    if (
      !organization.subscription.features ||
      !organization.subscription.features.includes(feature)
    ) {
      throw new ApiError(
        403,
        `Your subscription plan doesn't include access to ${feature}`
      );
    }

    next();
  };
};

/**
 * Check API rate limits
 */
export const checkApiLimits = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const organization = req.organization;

  // Get current API usage
  const currentUsage = organization.usage.apiCalls.current;
  const limit = organization.subscription.limits.apiCalls;

  if (currentUsage >= limit) {
    throw new ApiError(
      429,
      'API call limit exceeded for current billing period'
    );
  }

  // Increment API usage
  await Organization.findByIdAndUpdate(
    organization._id,
    { $inc: { 'usage.apiCalls.current': 1 } }
  );

  next();
});
