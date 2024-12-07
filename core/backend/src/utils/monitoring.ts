
4. In the code editor, paste this code:

```typescript
import { Request, Response, NextFunction } from 'express';
import { Gauge, Counter, Histogram, Registry } from 'prom-client';
import os from 'os';
import { logger } from './logger';
import { redisClient } from '../config/redis';

// Create a Registry
const register = new Registry();

/**
 * System Metrics
 */
const systemMetrics = {
  // CPU Usage
  cpuUsage: new Gauge({
    name: 'node_cpu_usage',
    help: 'CPU usage percentage',
    registers: [register]
  }),

  // Memory Usage
  memoryUsage: new Gauge({
    name: 'node_memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'],
    registers: [register]
  }),

  // Event Loop Lag
  eventLoopLag: new Gauge({
    name: 'node_event_loop_lag_seconds',
    help: 'Event loop lag in seconds',
    registers: [register]
  })
};

/**
 * HTTP Metrics
 */
const httpMetrics = {
  // Request Duration
  requestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register]
  }),

  // Request Size
  requestSize: new Histogram({
    name: 'http_request_size_bytes',
    help: 'Size of HTTP requests in bytes',
    labelNames: ['method', 'route'],
    buckets: [100, 1000, 10000, 100000],
    registers: [register]
  }),

  // Response Size
  responseSize: new Histogram({
    name: 'http_response_size_bytes',
    help: 'Size of HTTP responses in bytes',
    labelNames: ['method', 'route'],
    buckets: [100, 1000, 10000, 100000],
    registers: [register]
  }),

  // Active Connections
  activeConnections: new Gauge({
    name: 'http_active_connections',
    help: 'Number of active HTTP connections',
    registers: [register]
  }),

  // Total Requests
  totalRequests: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
  })
};

/**
 * Database Metrics
 */
const databaseMetrics = {
  // Query Duration
  queryDuration: new Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'collection'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
    registers: [register]
  }),

  // Active Connections
  activeConnections: new Gauge({
    name: 'database_active_connections',
    help: 'Number of active database connections',
    registers: [register]
  }),

  // Connection Pool Size
  connectionPoolSize: new Gauge({
    name: 'database_connection_pool_size',
    help: 'Size of database connection pool',
    registers: [register]
  })
};

/**
 * Cache Metrics
 */
const cacheMetrics = {
  // Cache Hits
  cacheHits: new Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type'],
    registers: [register]
  }),

  // Cache Misses
  cacheMisses: new Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type'],
    registers: [register]
  }),

  // Cache Size
  cacheSize: new Gauge({
    name: 'cache_size_bytes',
    help: 'Size of cache in bytes',
    labelNames: ['cache_type'],
    registers: [register]
  })
};

/**
 * Business Metrics
 */
const businessMetrics = {
  // Active Users
  activeUsers: new Gauge({
    name: 'business_active_users',
    help: 'Number of active users',
    labelNames: ['organization'],
    registers: [register]
  }),

  // Subscription Status
  subscriptionStatus: new Gauge({
    name: 'business_subscription_status',
    help: 'Subscription status by organization',
    labelNames: ['organization', 'plan'],
    registers: [register]
  }),

  // API Usage
  apiUsage: new Counter({
    name: 'business_api_usage_total',
    help: 'Total API usage by organization',
    labelNames: ['organization', 'endpoint'],
    registers: [register]
  })
};

/**
 * Collect System Metrics
 */
const collectSystemMetrics = () => {
  // CPU Usage
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  systemMetrics.cpuUsage.set(cpuUsage);

  // Memory Usage
  const used = process.memoryUsage();
  systemMetrics.memoryUsage.labels('heap').set(used.heapUsed);
  systemMetrics.memoryUsage.labels('rss').set(used.rss);

  // Event Loop Lag
  const start = Date.now();
  setImmediate(() => {
    const lag = (Date.now() - start) / 1000;
    systemMetrics.eventLoopLag.set(lag);
  });
};

/**
 * HTTP Monitoring Middleware
 */
export const httpMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  // Increment active connections
  httpMetrics.activeConnections.inc();

  // Track request size
  const requestSize = Buffer.byteLength(JSON.stringify(req.body));
  httpMetrics.requestSize.labels(req.method, req.route?.path || req.path).observe(requestSize);

  // Override end function to capture metrics
  const originalEnd = res.end;
  res.end = function(chunk: any, ...args: any[]): any {
    // Decrement active connections
    httpMetrics.activeConnections.dec();

    // Calculate duration
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;

    // Record metrics
    httpMetrics.requestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);

    httpMetrics.totalRequests
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .inc();

    if (chunk) {
      const responseSize = Buffer.byteLength(chunk);
      httpMetrics.responseSize
        .labels(req.method, req.route?.path || req.path)
        .observe(responseSize);
    }

    return originalEnd.call(this, chunk, ...args);
  };

  next();
};

/**
 * Initialize Monitoring
 */
export const initializeMonitoring = () => {
  // Collect metrics every 15 seconds
  setInterval(collectSystemMetrics, 15000);

  // Log any collection errors
  register.on('error', (error) => {
    logger.error('Metrics collection error:', error);
  });
};

/**
 * Metrics Endpoint Handler
 */
export const metricsHandler = async (req: Request, res: Response) => {
  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType);
    res.end(metrics);
  } catch (error) {
    logger.error('Metrics endpoint error:', error);
    res.status(500).end();
  }
};

/**
 * Custom Metric Recording
 */
export const recordMetric = {
  // Record Cache Operation
  cacheOperation: (type: 'hit' | 'miss', cacheType: string) => {
    if (type === 'hit') {
      cacheMetrics.cacheHits.labels(cacheType).inc();
    } else {
      cacheMetrics.cacheMisses.labels(cacheType).inc();
    }
  },

  // Record Database Query
  databaseQuery: (operation: string, collection: string, duration: number) => {
    databaseMetrics.queryDuration.labels(operation, collection).observe(duration);
  },

  // Record Business Metric
  businessMetric: (metric: 'activeUsers' | 'subscriptionStatus' | 'apiUsage', labels: object, value: number) => {
    businessMetrics[metric].labels(labels).set(value);
  }
};

export default {
  register,
  systemMetrics,
  httpMetrics,
  databaseMetrics,
  cacheMetrics,
  businessMetrics,
  httpMonitoringMiddleware,
  initializeMonitoring,
  metricsHandler,
  recordMetric
};
```
