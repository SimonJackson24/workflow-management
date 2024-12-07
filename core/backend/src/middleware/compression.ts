import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { logger } from '../utils/logger';

interface CompressionOptions {
  level?: number;              // Compression level (0-9)
  threshold?: number;          // Minimum size to compress (in bytes)
  memLevel?: number;          // Memory level (1-9)
  windowBits?: number;        // Window size (8-15)
  strategy?: number;          // Compression strategy
  filter?: (req: Request, res: Response) => boolean;  // Custom filter function
  cache?: boolean;            // Enable compression caching
  cacheSize?: number;         // Maximum cache size
  bytesSaved?: boolean;       // Track bytes saved
}

/**
 * Enhanced Compression Middleware
 */
export const enhancedCompression = (options: CompressionOptions = {}) => {
  const defaultOptions: CompressionOptions = {
    level: 6,
    threshold: 1024,  // 1KB
    memLevel: 8,
    windowBits: 15,
    strategy: 0,      // Default strategy
    cache: true,
    cacheSize: 100,   // Cache last 100 compressions
    bytesSaved: true
  };

  const opts = { ...defaultOptions, ...options };
  const compressionCache = new Map<string, Buffer>();
  let totalBytesSaved = 0;

  // Custom filter function
  const shouldCompress = (req: Request, res: Response): boolean => {
    // Skip compression for small responses
    if (parseInt(res.get('Content-Length') || '0') < opts.threshold!) {
      return false;
    }

    // Skip compression for already compressed content
    if (res.get('Content-Encoding')) {
      return false;
    }

    // Skip compression for certain content types
    const contentType = res.get('Content-Type') || '';
    if (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('application/zip') ||
      contentType.includes('application/x-gzip')
    ) {
      return false;
    }

    // Use custom filter if provided
    if (opts.filter) {
      return opts.filter(req, res);
    }

    return true;
  };

  // Create compression middleware
  const compressMiddleware = compression({
    level: opts.level,
    threshold: opts.threshold,
    memLevel: opts.memLevel,
    windowBits: opts.windowBits,
    strategy: opts.strategy,
    filter: shouldCompress
  });

  // Return enhanced middleware
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const cacheKey = `${req.method}:${req.originalUrl}`;

    // Check cache if enabled
    if (opts.cache && compressionCache.has(cacheKey)) {
      const cachedResponse = compressionCache.get(cacheKey);
      res.set('Content-Encoding', 'gzip');
      res.set('X-Compression-Cache', 'HIT');
      return originalSend.call(res, cachedResponse);
    }

    // Override send method to implement caching and tracking
    res.send = function(body: any): Response {
      // Restore original send
      res.send = originalSend;

      // Track original size
      const originalSize = Buffer.byteLength(
        typeof body === 'string' ? body : JSON.stringify(body)
      );

      // Apply compression
      compressMiddleware(req, res, () => {
        const compressedResponse = Buffer.from(body);
        const compressedSize = compressedResponse.length;

        // Cache compressed response if enabled
        if (opts.cache) {
          if (compressionCache.size >= opts.cacheSize!) {
            const firstKey = compressionCache.keys().next().value;
            compressionCache.delete(firstKey);
          }
          compressionCache.set(cacheKey, compressedResponse);
          res.set('X-Compression-Cache', 'MISS');
        }

        // Track bytes saved
        if (opts.bytesSaved) {
          const saved = originalSize - compressedSize;
          totalBytesSaved += saved;
          res.set('X-Compression-Saved', saved.toString());
          
          // Log compression stats
          logger.debug('Compression stats:', {
            path: req.path,
            originalSize,
            compressedSize,
            saved,
            totalSaved: totalBytesSaved,
            ratio: ((saved / originalSize) * 100).toFixed(2) + '%'
          });
        }

        return originalSend.call(res, body);
      });

      return res;
    };

    next();
  };
};

/**
 * Compression Stats Interface
 */
export interface CompressionStats {
  totalRequests: number;
  totalBytesSaved: number;
  averageCompressionRatio: number;
  cacheHits: number;
  cacheMisses: number;
}

/**
 * Get Compression Stats
 */
export const getCompressionStats = (): CompressionStats => {
  // Implementation would track these metrics
  return {
    totalRequests: 0,
    totalBytesSaved: 0,
    averageCompressionRatio: 0,
    cacheHits: 0,
    cacheMisses: 0
  };
};

/**
 * Clear Compression Cache
 */
export const clearCompressionCache = (): void => {
  // Implementation would clear the cache
};

/**
 * Compression Middleware Factory
 */
export const createCompression = (options: CompressionOptions = {}) => {
  return enhancedCompression(options);
};

// Export default middleware with standard options
export default enhancedCompression();
