// core/frontend/src/services/PerformanceMetricsService.ts

import {
  PerformanceMetrics,
  SystemMetrics,
  APIMetrics,
  ResourceMetrics,
  TimeRange
} from '../types/analytics.types';

export class PerformanceMetricsService {
  async getPerformanceMetrics(timeRange: TimeRange): Promise<PerformanceMetrics> {
    const [system, api, resources] = await Promise.all([
      this.getSystemMetrics(timeRange),
      this.getAPIMetrics(timeRange),
      this.getResourceMetrics(timeRange)
    ]);

    return {
      system,
      api,
      resources,
      summary: this.generatePerformanceSummary({ system, api, resources })
    };
  }

  private async getSystemMetrics(timeRange: TimeRange): Promise<SystemMetrics> {
    const response = await api.get('/api/analytics/performance/system', {
      params: {
        startDate: timeRange.start,
        endDate: timeRange.end
      }
    });

    return {
      cpu: this.processCPUMetrics(response.data.cpu),
      memory: this.processMemoryMetrics(response.data.memory),
      disk: this.processDiskMetrics(response.data.disk),
      network: this.processNetworkMetrics(response.data.network)
    };
  }

  private async getAPIMetrics(timeRange: TimeRange): Promise<APIMetrics> {
    const response = await api.get('/api/analytics/performance/api', {
      params: {
        startDate: timeRange.start,
        endDate: timeRange.end
      }
    });

    return {
      responseTime: this.processResponseTimeMetrics(response.data.responseTime),
      throughput: this.processThroughputMetrics(response.data.throughput),
      errorRate: this.processErrorRateMetrics(response.data.errorRate),
      availability: this.calculateAvailability(response.data.uptime)
    };
  }

  private async getResourceMetrics(timeRange: TimeRange): Promise<ResourceMetrics> {
    const response = await api.get('/api/analytics/performance/resources', {
      params: {
        startDate: timeRange.start,
        endDate: timeRange.end
      }
    });

    return {
      database: this.processDatabaseMetrics(response.data.database),
      cache: this.processCacheMetrics(response.data.cache),
      storage: this.processStorageMetrics(response.data.storage),
      queue: this.processQueueMetrics(response.data.queue)
    };
  }

  private processCPUMetrics(data: any): any {
    return {
      usage: this.calculateAverageUsage(data.usage),
      load: this.calculateLoadAverages(data.load),
      processes: this.analyzeProcesses(data.processes),
      trends: this.analyzeCPUTrends(data.history)
    };
  }

  private processMemoryMetrics(data: any): any {
    return {
      usage: this.calculateMemoryUsage(data.usage),
      allocation: this.analyzeMemoryAllocation(data.allocation),
      swapUsage: this.calculateSwapUsage(data.swap),
      leaks: this.detectMemoryLeaks(data.history)
    };
  }

  private processDiskMetrics(data: any): any {
    return {
      usage: this.calculateDiskUsage(data.usage),
      iops: this.calculateIOPS(data.io),
      latency: this.calculateDiskLatency(data.latency),
      health: this.assessDiskHealth(data.health)
    };
  }

  private processNetworkMetrics(data: any): any {
    return {
      throughput: this.calculateNetworkThroughput(data.throughput),
      latency: this.calculateNetworkLatency(data.latency),
      packets: this.analyzePacketMetrics(data.packets),
      connections: this.analyzeConnections(data.connections)
    };
  }

  private processResponseTimeMetrics(data: any): any {
    return {
      average: this.calculateAverageResponseTime(data),
      percentiles: this.calculateResponseTimePercentiles(data),
      distribution: this.analyzeResponseTimeDistribution(data),
      slowest: this.identifySlowestEndpoints(data)
    };
  }

  private processThroughputMetrics(data: any): any {
    return {
      requestsPerSecond: this.calculateRPS(data),
      bandwidth: this.calculateBandwidth(data),
      concurrency: this.analyzeConcurrency(data),
      capacity: this.estimateCapacity(data)
    };
  }

  private processErrorRateMetrics(data: any): any {
    return {
      overall: this.calculateOverallErrorRate(data),
      byType: this.categorizeErrors(data),
      trends: this.analyzeErrorTrends(data),
      hotspots: this.identifyErrorHotspots(data)
    };
  }

  private processDatabaseMetrics(data: any): any {
    return {
      queryPerformance: this.analyzeQueryPerformance(data),
      connections: this.analyzeDatabaseConnections(data),
      locks: this.analyzeLocks(data),
      replication: this.analyzeReplication(data)
    };
  }

  private processCacheMetrics(data: any): any {
    return {
      hitRate: this.calculateCacheHitRate(data),
      evictions: this.analyzeCacheEvictions(data),
      memory: this.analyzeCacheMemory(data),
      efficiency: this.calculateCacheEfficiency(data)
    };
  }

  private generatePerformanceSummary(metrics: PerformanceMetrics): any {
    return {
      health: this.calculateSystemHealth(metrics),
      bottlenecks: this.identifyBottlenecks(metrics),
      recommendations: this.generateRecommendations(metrics),
      alerts: this.generatePerformanceAlerts(metrics)
    };
  }
}
