// core/backend/src/services/PluginMonitoringService.ts

import { EventEmitter } from 'events';
import { createLogger, format, transports } from 'winston';
import { Prometheus, Registry, Counter, Gauge, Histogram } from 'prom-client';
import { ElasticSearchClient } from '@elastic/elasticsearch';
import { PluginMetrics, LogLevel, MonitoringConfig } from '../types/monitoring.types';

export class PluginMonitoringService {
  private readonly logger: any;
  private readonly metrics: Registry;
  private readonly elastic: ElasticSearchClient;
  private readonly eventEmitter: EventEmitter;

  // Prometheus metrics
  private readonly apiCalls: Counter;
  private readonly errorRate: Counter;
  private readonly memoryUsage: Gauge;
  private readonly cpuUsage: Gauge;
  private readonly responseTime: Histogram;
  private readonly activePlugins: Gauge;

  constructor(config: MonitoringConfig) {
    // Initialize logger
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'plugins-error.log', level: 'error' }),
        new transports.File({ filename: 'plugins.log' })
      ]
    });

    // Initialize Prometheus metrics
    this.metrics = new Registry();
    
    this.apiCalls = new Counter({
      name: 'plugin_api_calls_total',
      help: 'Total number of API calls made by plugins',
      labelNames: ['plugin_id', 'endpoint']
    });

    this.errorRate = new Counter({
      name: 'plugin_errors_total',
      help: 'Total number of plugin errors',
      labelNames: ['plugin_id', 'error_type']
    });

    this.memoryUsage = new Gauge({
      name: 'plugin_memory_usage_bytes',
      help: 'Memory usage by plugin',
      labelNames: ['plugin_id']
    });

    this.cpuUsage = new Gauge({
      name: 'plugin_cpu_usage_percent',
      help: 'CPU usage by plugin',
      labelNames: ['plugin_id']
    });

    this.responseTime = new Histogram({
      name: 'plugin_response_time_seconds',
      help: 'Response time of plugin operations',
      labelNames: ['plugin_id', 'operation']
    });

    this.activePlugins = new Gauge({
      name: 'plugins_active_total',
      help: 'Total number of active plugins'
    });

    // Initialize Elasticsearch client
    this.elastic = new ElasticSearchClient({
      node: config.elasticSearch.url
    });

    this.eventEmitter = new EventEmitter();
  }

  // Logging methods
  async log(pluginId: string, level: LogLevel, message: string, metadata: any = {}): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      pluginId,
      level,
      message,
      ...metadata
    };

    // Write to Winston logger
    this.logger.log(level, message, logEntry);

    // Store in Elasticsearch
    await this.elastic.index({
      index: 'plugin-logs',
      body: logEntry
    });

    // Emit log event
    this.eventEmitter.emit('log', logEntry);
  }

  // Metric collection methods
  recordApiCall(pluginId: string, endpoint: string): void {
    this.apiCalls.inc({ plugin_id: pluginId, endpoint });
  }

  recordError(pluginId: string, errorType: string): void {
    this.errorRate.inc({ plugin_id: pluginId, error_type: errorType });
  }

  updateMemoryUsage(pluginId: string, bytes: number): void {
    this.memoryUsage.set({ plugin_id: pluginId }, bytes);
  }

  updateCpuUsage(pluginId: string, percent: number): void {
    this.cpuUsage.set({ plugin_id: pluginId }, percent);
  }

  recordResponseTime(pluginId: string, operation: string, seconds: number): void {
    this.responseTime.observe({ plugin_id: pluginId, operation }, seconds);
  }

  updateActivePlugins(count: number): void {
    this.activePlugins.set(count);
  }

  // Metric retrieval methods
  async getPluginMetrics(pluginId: string): Promise<PluginMetrics> {
    return {
      apiCalls: await this.apiCalls.get(),
      errors: await this.errorRate.get(),
      memoryUsage: await this.memoryUsage.get(),
      cpuUsage: await this.cpuUsage.get(),
      responseTime: await this.responseTime.get()
    };
  }

  // Log retrieval methods
  async getLogs(pluginId: string, options: {
    startTime: Date;
    endTime: Date;
    level?: LogLevel;
    limit?: number;
  }): Promise<any[]> {
    const response = await this.elastic.search({
      index: 'plugin-logs',
      body: {
        query: {
          bool: {
            must: [
              { match: { pluginId } },
              {
                range: {
                  timestamp: {
                    gte: options.startTime.toISOString(),
                    lte: options.endTime.toISOString()
                  }
                }
              },
              ...(options.level ? [{ match: { level: options.level } }] : [])
            ]
          }
        },
        size: options.limit || 100,
        sort: [{ timestamp: 'desc' }]
      }
    });

    return response.body.hits.hits.map((hit: any) => hit._source);
  }

  // Alert methods
  async createAlert(pluginId: string, alert: {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    metadata?: any;
  }): Promise<void> {
    await this.log(pluginId, 'warn', alert.message, {
      type: 'alert',
      ...alert
    });

    this.eventEmitter.emit('alert', {
      pluginId,
      timestamp: new Date(),
      ...alert
    });
  }

  // Health check methods
  async checkHealth(pluginId: string): Promise<{
    healthy: boolean;
    issues: string[];
    metrics: PluginMetrics;
  }> {
    const metrics = await this.getPluginMetrics(pluginId);
    const issues: string[] = [];

    // Check memory usage
    if (metrics.memoryUsage > 1024 * 1024 * 100) { // 100MB
      issues.push('High memory usage');
    }

    // Check error rate
    if (metrics.errors > 10) { // More than 10 errors
      issues.push('High error rate');
    }

    // Check response time
    if (metrics.responseTime.avg > 1000) { // More than 1 second
      issues.push('Slow response time');
    }

    return {
      healthy: issues.length === 0,
      issues,
      metrics
    };
  }

  // Dashboard data methods
  async getDashboardData(pluginId: string): Promise<any> {
    const [metrics, logs, health] = await Promise.all([
      this.getPluginMetrics(pluginId),
      this.getLogs(pluginId, {
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        endTime: new Date(),
        limit: 1000
      }),
      this.checkHealth(pluginId)
    ]);

    return {
      metrics,
      logs,
      health,
      timestamp: new Date()
    };
  }

  // Event listeners
  onLog(handler: (log: any) => void): void {
    this.eventEmitter.on('log', handler);
  }

  onAlert(handler: (alert: any) => void): void {
    this.eventEmitter.on('alert', handler);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.elastic.close();
    this.metrics.clear();
  }
}
