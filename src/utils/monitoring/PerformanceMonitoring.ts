// src/utils/monitoring/PerformanceMonitoring.ts

import { WebVitals } from '../../types/monitoring.types';

export class PerformanceMonitoring {
  private static instance: PerformanceMonitoring;
  private metrics: Map<string, any>;

  private constructor() {
    this.metrics = new Map();
    this.initializeMonitoring();
  }

  static getInstance(): PerformanceMonitoring {
    if (!PerformanceMonitoring.instance) {
      PerformanceMonitoring.instance = new PerformanceMonitoring();
    }
    return PerformanceMonitoring.instance;
  }

  private initializeMonitoring(): void {
    // Web Vitals
    this.measureWebVitals();

    // Performance Observer
    this.setupPerformanceObserver();

    // Error Tracking
    this.setupErrorTracking();

    // Network Requests
    this.trackNetworkRequests();
  }

  private measureWebVitals(): void {
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
        getCLS(this.handleWebVital);
        getFID(this.handleWebVital);
        getLCP(this.handleWebVital);
      });
    }
  }

  private handleWebVital = (metric: WebVitals): void => {
    this.metrics.set(metric.name, metric.value);
    this.reportMetric(metric);
  };

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      // Long Tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.reportLongTask(entry);
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Resource Timing
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.reportResourceTiming(entry);
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  private setupErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.reportError({
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        type: 'promise_rejection',
        message: event.reason,
        timestamp: new Date().toISOString()
      });
    });
  }

  private trackNetworkRequests(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        this.reportNetworkRequest({
          url: args[0].toString(),
          duration: performance.now() - startTime,
          status: response.status,
          success: response.ok
        });
        return response;
      } catch (error) {
        this.reportNetworkRequest({
          url: args[0].toString(),
          duration: performance.now() - startTime,
          status: 0,
          success: false,
          error: error.message
        });
        throw error;
      }
    };
  }

  private reportMetric(metric: any): void {
    // Send metric to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Implementation for reporting to your analytics service
    }
  }

  private reportLongTask(entry: PerformanceEntry): void {
    this.reportMetric({
      type: 'longtask',
      duration: entry.duration,
      timestamp: new Date().toISOString()
    });
  }

  private reportResourceTiming(entry: PerformanceResourceTiming): void {
    this.reportMetric({
      type: 'resource',
      name: entry.name,
      duration: entry.duration,
      initiatorType: entry.initiatorType,
      timestamp: new Date().toISOString()
    });
  }

  private reportError(error: any): void {
    this.reportMetric({
      type: 'error',
      ...error
    });
  }

  private reportNetworkRequest(request: any): void {
    this.reportMetric({
      type: 'network',
      ...request
    });
  }

  public getMetrics(): Map<string, any> {
    return new Map(this.metrics);
  }
}

export const performanceMonitoring = PerformanceMonitoring.getInstance();
