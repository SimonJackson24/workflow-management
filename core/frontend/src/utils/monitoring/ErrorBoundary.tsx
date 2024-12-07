// core/frontend/src/utils/monitoring/ErrorBoundary.tsx

import React, { Component, ErrorInfo } from 'react';
import { performanceMonitor } from './performance';

interface Props {
  fallback: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    performanceMonitor.recordError('react_error', {
      error: error.toString(),
      componentStack: errorInfo.componentStack
    });
    
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// core/frontend/src/utils/monitoring/MetricsCollector.ts

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, number[]> = new Map();
  private dimensions: Map<string, string> = new Map();

  private constructor() {
    this.setupNavigationTracking();
    this.setupResourceTracking();
    this.setupErrorTracking();
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  private setupNavigationTracking() {
    if (typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordMetric('page_load_time', entry.duration);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  private setupResourceTracking() {
    if (typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.recordMetric(`resource_load_time_${entry.initiatorType}`, entry.duration);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private setupErrorTracking() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.recordError('js_error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.recordError('unhandled_promise', {
          message: event.reason.toString()
        });
      });
    }
  }

  public recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  public recordError(type: string, details: Record<string, any>) {
    // Send error to monitoring service
    fetch('/api/monitoring/errors', {
      method: 'POST',
      body: JSON.stringify({
        type,
        details,
        timestamp: Date.now(),
        dimensions: Object.fromEntries(this.dimensions)
      })
    }).catch(console.error);
  }

  public setDimension(name: string, value: string) {
    this.dimensions.set(name, value);
  }

  public async flush() {
    const metricsData = Array.from(this.metrics.entries()).map(([name, values]) => ({
      name,
      values,
      dimensions: Object.fromEntries(this.dimensions)
    }));

    try {
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        body: JSON.stringify(metricsData)
      });
      
      // Clear metrics after successful send
      this.metrics.clear();
    } catch (error) {
      console.error('Failed to flush metrics:', error);
    }
  }
}

export const metricsCollector = MetricsCollector.getInstance();
