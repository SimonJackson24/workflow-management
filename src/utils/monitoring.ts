// src/utils/monitoring.ts

import { analytics } from './analytics';

class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;

  initialize(): void {
    if (!import.meta.env.PROD) return;

    try {
      // Monitor web vitals
      this.monitorWebVitals();

      // Monitor long tasks
      this.monitorLongTasks();

      // Monitor resource timing
      this.monitorResourceTiming();

      // Monitor errors
      this.monitorErrors();

      // Monitor navigation
      this.monitorNavigation();
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  private monitorWebVitals(): void {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.reportWebVital);
      getFID(this.reportWebVital);
      getFCP(this.reportWebVital);
      getLCP(this.reportWebVital);
      getTTFB(this.reportWebVital);
    });
  }

  private monitorLongTasks(): void {
    try {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.reportLongTask(entry);
          }
        });
      });

      this.observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long Tasks API not supported');
    }
  }

  private monitorResourceTiming(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(this.reportResourceTiming);
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource Timing API not supported');
    }
  }

  private monitorErrors(): void {
    window.addEventListener('error', this.reportError);
    window.addEventListener('unhandledrejection', this.reportPromiseError);
  }

  private monitorNavigation(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(this.reportNavigation);
      });

      observer.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      console.warn('Navigation Timing API not supported');
    }
  }

  private reportWebVital = (metric: any): void => {
    analytics.trackEvent('WebVitals', metric.name, undefined, metric.value);
  };

  private reportLongTask = (entry: PerformanceEntry): void => {
    analytics.trackEvent('Performance', 'LongTask', undefined, entry.duration);
  };

  private reportResourceTiming = (entry: PerformanceResourceTiming): void => {
    if (entry.duration > 1000) { // Resources taking longer than 1s
      analytics.trackEvent('Performance', 'SlowResource', entry.name, entry.duration);
    }
  };

  private reportError = (event: ErrorEvent): void => {
    analytics.trackError(event.error);
  };

  private reportPromiseError = (event: PromiseRejectionEvent): void => {
    analytics.trackError(event.reason);
  };

  private reportNavigation = (entry: PerformanceNavigationTiming): void => {
    analytics.trackEvent('Navigation', 'PageLoad', undefined, entry.duration);
  };

  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener('error', this.reportError);
    window.removeEventListener('unhandledrejection', this.reportPromiseError);
  }
}

export const performanceMonitor = new PerformanceMonitor();
