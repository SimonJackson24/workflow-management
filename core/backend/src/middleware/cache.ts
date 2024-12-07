import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

interface CacheOptions {
  duration?: number;          // Cache duration in seconds
  key?: string | ((req: Request) => string);  // Custom cache key
  condition?: (req: Request) => boolean;      // Condition to enable caching
  serialize?: (data: any) => string;          // Custom serialization
  deserialize?: (data: string) => any;        // Custom deserialization
  tags?: string[] | ((req: Request) => string[]); // Cache tags for invalidation
  compress?: boolean;         // Enable compression
  staleWhileRevalidate?: number;  // Time to serve stale content while updating
}

/**
 * Default cache options
 */
const defaultOptions: CacheOptions = {
  duration: 3600,            // 1 hour
  compress: false,
  staleWhileRevalidate: 0
};

/**
 * Generate cache key from request
 */
const generateCacheKey = (req: Request, customKey?: string | ((req: Request) => string)): string => {
  if (typeof customKey === 'function') {
    return customKey(req);
  }
  if (customKey) {
    return customKey;
  }

  // Default key generation
  const { baseUrl, path, query, body } = req;
  const userId = req.user?.id || 'anonymous';
  const organizationId = req.organization?.id || 'none';

  return `cache:${organizationId}:${userId}:${baseUrl}${path}:${JSON.stringify(query)}:${JSON.stringify(body)}`;
};

/**
 * Cache Middleware
 */
export const cache = (options: CacheOptions = {}) => {
  const opts = { ...defaultOptions, ...options };

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip cache based on condition
    if (opts.condition && !opts.condition(req)) {
      return next();
    }

    // Skip cache for non-GET methods
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req, opts.key);
    
    try {
      // Try to get cached response
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        const data = opts.deserialize ? 
          opts.deserialize(cachedData) : 
          JSON.parse(cachedData);

        // Check if data is stale
        const metadata = await redisClient.get(`${cacheKey}:metadata`);
        const isStale = metadata ? 
          JSON.parse(metadata).timestamp + (opts.duration! * 1000) < Date.now() : 
          false;

        // If data is stale and staleWhileRevalidate is enabled
        if (isStale && opts.staleWhileRevalidate) {
          // Trigger background refresh
          refreshCache(req, res, cacheKey, opts).catch(err => 
            logger.error('Cache refresh error:', err)
          );
        }

        // Send cached response
        return res.json(data);
      }

      // Store original send function
      const originalSend = res.json;

      // Override send function
      res.json = function(body: any): Response {
        // Restore original send
        res.json = originalSend;

        // Cache the response
        const dataToCache = opts.serialize ? 
          opts.serialize(body) : 
          JSON.stringify(body);

        // Store response data
        redisClient.setex(cacheKey, opts.duration!, dataToCache);

        // Store metadata
        const metadata = {
          timestamp: Date.now(),
          tags: typeof opts.tags === 'function' ? 
            opts.tags(req) : 
            opts.tags
        };
        redisClient.setex(
          `${cacheKey}:metadata`,
          opts.duration!,
          JSON.stringify(metadata)
        );

        // If tags are provided, store cache key in tag sets
        if (metadata.tags) {
          metadata.tags.forEach(tag => {
            redisClient.sadd(`cachetag:${tag}`, cacheKey);
          });
        }

        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Refresh cache in background
 */
async function refreshCache(
  req: Request,
  res: Response,
  cacheKey: string,
  options: CacheOptions
) {
  try {
    // Clone request and create new response
    const clonedReq = Object.assign({}, req);
    const clonedRes = Object.assign({}, res);

    // Execute request handler
    const result = await new Promise((resolve) => {
      clonedRes.json = resolve;
      req.app._router.handle(clonedReq, clonedRes, () => {});
    });

    // Cache the new response
    const dataToCache = options.serialize ? 
      options.serialize(result) : 
      JSON.stringify(result);

    await redisClient.setex(cacheKey, options.duration!, dataToCache);

    // Update metadata
    const metadata = {
      timestamp: Date.now(),
      tags: typeof options.tags === 'function' ? 
        options.tags(req) : 
        options.tags
    };
    await redisClient.setex(
      `${cacheKey}:metadata`,
      options.duration!,
      JSON.stringify(metadata)
    );
  } catch (error) {
    logger.error('Cache refresh error:', error);
  }
}

/**
 * Clear cache by tags
 */
export const clearCacheByTags = async (tags: string[]) => {
  try {
    for (const tag of tags) {
      // Get all cache keys for tag
      const cacheKeys = await redisClient.smembers(`cachetag:${tag}`);

      // Delete all cached data and metadata
      for (const key of cacheKeys) {
        await redisClient.del(key);
        await redisClient.del(`${key}:metadata`);
      }

      // Delete tag set
      await redisClient.del(`cachetag:${tag}`);
    }
  } catch (error) {
    logger.error('Clear cache error:', error);
    throw error;
  }
};

/**
 * Clear cache by pattern
 */
export const clearCacheByPattern = async (pattern: string) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.error('Clear cache error:', error);
    throw error;
  }
};

/**
 * Cache warmer
 */
export const warmCache = async (
  requests: Array<{ path: string; query?: any }>,
  options: CacheOptions = {}
) => {
  try {
    for (const request of requests) {
      const req = {
        method: 'GET',
        baseUrl: '',
        path: request.path,
        query: request.query || {},
        user: { id: 'system' }
      } as Request;

      const cacheKey = generateCacheKey(req, options.key);
      
      // Execute request and cache result
      const result = await fetch(`${process.env.API_URL}${request.path}`);
      const data = await result.json();

      const dataToCache = options.serialize ? 
        options.serialize(data) : 
        JSON.stringify(data);

      await redisClient.setex(cacheKey, options.duration || 3600, dataToCache);
    }
  } catch (error) {
    logger.error('Cache warming error:', error);
    throw error;
  }
};

export default {
  cache,
  clearCacheByTags,
  clearCacheByPattern,
  warmCache
};
