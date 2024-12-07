import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisClient } from '../config/redis';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

interface RateLimitOptions {
  windowMs?: number;        // Time window in milliseconds
  max?: number;            // Max requests per window
  keyPrefix?: string;      // Redis key prefix
  handler?: (req: Request, res: Response) => void;  // Custom handler
  skipFailedRequests?: boolean;  // Don't count failed requests
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  whitelist?: string[];    // IPs to whitelist
  blacklist?: string[];    // IPs to blacklist
}

/**
 * Default rate limit options
 */
const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  max: 100,           // 100 requests per minute
  keyPrefix: 'rl:',   // Redis key prefix
  skipFailedRequests: false,
  skipSuccessfulRequests: false
};

/**
 * Create Redis-based rate limiter
 */
const createRateLimiter = (options: RateLimitOptions) => {
  const opts = { ...defaultOptions, ...options };

  return new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: opts.keyPrefix,
    points: opts.max,
    duration: opts.windowMs / 1000, // Convert to seconds
    blockDuration: opts.windowMs / 1000,
  });
};

/**
 * Rate Limiter Middleware Factory
 */
export const rateLimiter = (options: RateLimitOptions = {}) => {
  const limiter = createRateLimiter(options);
  const opts = { ...defaultOptions, ...options };

  return async (req: Request, res: Response, next: NextFunction) => {
    // Get IP address
    const ip = req.ip || req.connection.remoteAddress;

    // Check whitelist
    if (opts.whitelist?.includes(ip)) {
      return next();
    }

    // Check blacklist
    if (opts.blacklist?.includes(ip)) {
      throw new ApiError(403, 'IP address blocked');
    }

    try {
      // Generate key based on IP and route
      const key = `${ip}:${req.method}:${req.baseUrl}${req.path}`;

      // Check rate limit
      const rateLimitResult = await limiter.consume(key);

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': opts.max,
        'X-RateLimit-Remaining': rateLimitResult.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + rateLimitResult.msBeforeNext)
      });

      next();
    } catch (error) {
      if (error instanceof Error) {
        const retryAfter = Math.ceil(error.msBeforeNext / 1000);
        
        res.set('Retry-After', String(retryAfter));
        
        if (opts.handler) {
          return opts.handler(req, res);
        }

        throw new ApiError(429, 'Too many requests', 'RATE_LIMIT_EXCEEDED', {
          retryAfter,
          limit: opts.max,
          windowMs: opts.windowMs
        });
      }
      next(error);
    }
  };
};

/**
 * API Rate Limiter
 * Specific configuration for API endpoints
 */
export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                  // limit each IP to 100 requests per windowMs
  keyPrefix: 'rl:api:',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many API requests. Please try again later.'
      }
    });
  }
});

/**
 * Auth Rate Limiter
 * Stricter limits for authentication endpoints
 */
export const authRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                    // limit each IP to 5 requests per windowMs
  keyPrefix: 'rl:auth:',
  skipSuccessfulRequests: true,  // Don't count successful logins
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again later.'
      }
    });
  }
});

/**
 * Upload Rate Limiter
 * Specific limits for file upload endpoints
 */
export const uploadRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,                   // limit each IP to 10 uploads per windowMs
  keyPrefix: 'rl:upload:',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        message: 'Too many file uploads. Please try again later.'
      }
    });
  }
});

/**
 * Dynamic Rate Limiter
 * Creates rate limits based on user role/subscription
 */
export const dynamicRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  const subscriptionTier = req.organization?.subscription?.planId;

  let rateLimit: RateLimitOptions = {
    windowMs: 60 * 1000,  // 1 minute
    max: 60               // default: 60 requests per minute
  };

  // Adjust limits based on role
  switch (userRole) {
    case 'admin':
      rateLimit.max = 300;
      break;
    case 'manager':
      rateLimit.max = 180;
      break;
    case 'member':
      rateLimit.max = 120;
      break;
  }

  // Adjust limits based on subscription
  switch (subscriptionTier) {
    case 'enterprise':
      rateLimit.max *= 2;
      break;
    case 'professional':
      rateLimit.max *= 1.5;
      break;
  }

  // Create and apply rate limiter
  const limiter = rateLimiter(rateLimit);
  return limiter(req, res, next);
};

/**
 * Monitor rate limit events
 */
export const monitorRateLimits = () => {
  redisClient.on('error', (error) => {
    logger.error('Rate Limiter Redis Error:', error);
  });

  // Optional: Monitor rate limit hits
  redisClient.on('message', (channel, message) => {
    if (channel === 'rate-limit-events') {
      const event = JSON.parse(message);
      logger.warn('Rate Limit Event:', event);
    }
  });
};
