// core/backend/src/monitoring/PerformanceMetricsMonitor.ts

import { EventEmitter } from 'events';
import {
  PerformanceMetric,
  MetricThreshold,
  PerformanceAlert,
  MetricTrend
} from '../types/monitoring.types';

export class PerformanceMetricsMonitor {
  private readonly eventEmitter: EventEmitter;
  private readonly metrics: Map<string, PerformanceMetric>;
  private readonly thresholds: Map<string, MetricThreshold>;
  private monitoringInterval: NodeJS.Timer | null;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.metrics = new Map();
    this.thresholds = new Map();
    this.monitoringInterval = null;
  }

  async startMonitoring(): Promise<void> {
    this.monitoringInterval = setInterval(
      () => this.collectMetrics(),
      config.monitoring.metricsInterval
    );
  }

  private async collectMetrics(): Promise<void> {
    const metrics = {
      api: await this.collectAPIMetrics(),
      database: await this.collectDatabaseMetrics(),
      cache: await this.collectCacheMetrics(),
      queue: await this.collectQueueMetrics()
    };

    await this.analyzeMetrics(metrics);
    await this.storeMetrics(metrics);
  }

  private async collectAPIMetrics(): Promise<any> {
    return {
      responseTime: await this.measureResponseTime(),
      requestRate: await this.measureRequestRate(),
      errorRate: await this.measureErrorRate(),
      successRate: await this.measureSuccessRate()
    };
  }

  private async collectDatabaseMetrics(): Promise<any> {
    return {
      queryTime: await this.measureQueryTime(),
      connectionPool: await this.checkConnectionPool(),
      deadlocks: await this.checkDeadlocks(),
      queryCache: await this.checkQueryCache()
    };
  }

  private async collectCacheMetrics(): Promise<any> {
    return {
      hitRate: await this.measureCacheHitRate(),
      missRate: await this.measureCacheMissRate(),
      evictionRate: await this.measureEvictionRate(),
      memory: await this.measureCacheMemory()
    };
  }

  private async collectQueueMetrics(): Promise<any> {
    return {
      length: await this.measureQueueLength(),
      processTime: await this.measureProcessTime(),
      errorRate: await this.measureQueueErrorRate(),
      throughput: await this.measureQueueThroughput()
    };
  }

  private async analyzeMetrics(metrics: any): Promise<void> {
    // Analyze trends
    const trends = await this.analyzeTrends(metrics);
    
    // Check thresholds
    await this.checkThresholds(metrics);
    
    // Detect anomalies
    await this.detectAnomalies(metrics);
    
    // Generate insights
    await this.generateInsights(metrics, trends);
  }

  private async analyzeTrends(metrics: any): Promise<MetricTrend[]> {
    const trends: MetricTrend[] = [];

    for (const [category, categoryMetrics] of Object.entries(metrics)) {
      for (const [metric, value] of Object.entries(categoryMetrics)) {
        const trend = await this.calculateTrend(category, metric, value);
        trends.push(trend);
      }
    }

    return trends;
  }

  private async checkThresholds(metrics: any): Promise<void> {
    for (const [category, categoryMetrics] of Object.entries(metrics)) {
      for (const [metric, value] of Object.entries(categoryMetrics)) {
        const threshold = this.thresholds.get(`${category}.${metric}`);
        if (threshold && value > threshold.value) {
          await this.handleThresholdViolation(category, metric, value, threshold);
        }
      }
    }
  }

  async getMetrics(options: {
    timeRange: string;
    metrics?: string[];
  }): Promise<any> {
    return await prisma.performanceMetrics.findMany({
      where: {
        timestamp: {
          gte: this.calculateTimeRange(options.timeRange)
        },
        metric: options.metrics ? { in: options.metrics } : undefined
      }
    });
  }

  setThreshold(
    metricName: string,
    threshold: MetricThreshold
  ): void {
    this.thresholds.set(metricName, threshold);
  }

  onAlert(handler: (alert: PerformanceAlert) => void): void {
    this.eventEmitter.on('alert', handler);
  }

  async cleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}
