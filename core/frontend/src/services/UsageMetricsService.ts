// core/frontend/src/services/UsageMetricsService.ts

import { 
  UsageMetric, 
  MetricData, 
  MetricTrend,
  TimeRange 
} from '../types/analytics.types';

export class UsageMetricsService {
  async getUsageMetrics(timeRange: TimeRange): Promise<{
    metrics: Record<string, MetricData>;
    trends: Record<string, MetricTrend>;
  }> {
    const [metrics, trends] = await Promise.all([
      this.fetchMetrics(timeRange),
      this.calculateTrends(timeRange)
    ]);

    return { metrics, trends };
  }

  private async fetchMetrics(timeRange: TimeRange): Promise<Record<string, MetricData>> {
    const response = await api.get('/api/analytics/usage', {
      params: {
        startDate: timeRange.start,
        endDate: timeRange.end
      }
    });

    return this.processMetricsData(response.data);
  }

  private async calculateTrends(timeRange: TimeRange): Promise<Record<string, MetricTrend>> {
    // Calculate trends for each metric
    const metrics = ['api_calls', 'storage', 'bandwidth', 'compute_time'];
    const trends: Record<string, MetricTrend> = {};

    for (const metric of metrics) {
      trends[metric] = await this.calculateMetricTrend(metric, timeRange);
    }

    return trends;
  }

  private async calculateMetricTrend(
    metric: string,
    timeRange: TimeRange
  ): Promise<MetricTrend> {
    const [currentPeriod, previousPeriod] = await Promise.all([
      this.getMetricData(metric, timeRange),
      this.getMetricData(metric, this.getPreviousPeriod(timeRange))
    ]);

    return {
      change: this.calculateChange(currentPeriod, previousPeriod),
      direction: this.getTrendDirection(currentPeriod, previousPeriod),
      percentage: this.calculatePercentageChange(currentPeriod, previousPeriod)
    };
  }

  private processMetricsData(data: any): Record<string, MetricData> {
    return {
      api_calls: {
        total: data.api_calls.total,
        history: data.api_calls.history,
        breakdown: this.processBreakdown(data.api_calls.breakdown)
      },
      storage: {
        total: this.formatBytes(data.storage.total),
        history: data.storage.history.map(this.formatBytes),
        breakdown: this.processBreakdown(data.storage.breakdown)
      },
      bandwidth: {
        total: this.formatBytes(data.bandwidth.total),
        history: data.bandwidth.history.map(this.formatBytes),
        breakdown: this.processBreakdown(data.bandwidth.breakdown)
      },
      compute_time: {
        total: this.formatDuration(data.compute_time.total),
        history: data.compute_time.history.map(this.formatDuration),
        breakdown: this.processBreakdown(data.compute_time.breakdown)
      }
    };
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`;
  }

  private formatDuration(milliseconds: number): string {
    const seconds = milliseconds / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes.toFixed(2)}m`;
    const hours = minutes / 60;
    return `${hours.toFixed(2)}h`;
  }

  private processBreakdown(breakdown: any): Record<string, number> {
    return Object.entries(breakdown).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: Number(value)
    }), {});
  }

  async getDetailedMetrics(
    metric: string,
    timeRange: TimeRange,
    filters?: Record<string, any>
  ): Promise<any> {
    const response = await api.get(`/api/analytics/usage/${metric}/detailed`, {
      params: {
        startDate: timeRange.start,
        endDate: timeRange.end,
        ...filters
      }
    });

    return this.processDetailedMetrics(response.data);
  }

  private processDetailedMetrics(data: any): any {
    return {
      summary: this.calculateSummary(data),
      distribution: this.calculateDistribution(data),
      patterns: this.identifyPatterns(data),
      anomalies: this.detectAnomalies(data)
    };
  }

  private calculateSummary(data: any): any {
    // Calculate summary statistics
    return {
      mean: this.calculateMean(data),
      median: this.calculateMedian(data),
      percentiles: this.calculatePercentiles(data),
      standardDeviation: this.calculateStandardDeviation(data)
    };
  }

  private calculateDistribution(data: any): any {
    // Calculate usage distribution
    return {
      histogram: this.createHistogram(data),
      densityPlot: this.createDensityPlot(data)
    };
  }

  private identifyPatterns(data: any): any {
    // Identify usage patterns
    return {
      seasonal: this.findSeasonalPatterns(data),
      trending: this.findTrendingPatterns(data),
      cyclic: this.findCyclicPatterns(data)
    };
  }

  private detectAnomalies(data: any): any {
    // Detect usage anomalies
    return {
      outliers: this.findOutliers(data),
      spikes: this.findSpikes(data),
      drops: this.findDrops(data)
    };
  }
}
