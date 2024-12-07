// core/frontend/src/utils/monitoring.ts

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private static instance: PerformanceMonitor;

  private constructor() {
    this.setupPerformanceObserver();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupPerformanceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric(entry.name, entry.duration);
        });
      });

      observer.observe({ entryTypes: ['measure'] });
    }
  }

  public recordMetric(name: string, value: number) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
    });

    // Send metrics to analytics if threshold is reached
    if (this.metrics.length >= 10) {
      this.sendMetrics();
    }
  }

  private async sendMetrics() {
    try {
      const metricsToSend = [...this.metrics];
      this.metrics = [];

      await fetch('/api/metrics', {
        method: 'POST',
        body: JSON.stringify(metricsToSend),
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }

  public measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    });
  }

  public measure<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
