// core/frontend/src/utils/monitoring/AdvancedMonitoring.ts

import { BehaviorSubject } from 'rxjs';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
}

interface ErrorEvent {
  type: string;
  message: string;
  stack?: string;
  metadata: Record<string, any>;
  timestamp: number;
}

interface UserAction {
  type: string;
  path: string;
  duration?: number;
  metadata: Record<string, any>;
  timestamp: number;
}

class AdvancedMonitoring {
  private static instance: AdvancedMonitoring;
  private metrics$ = new BehaviorSubject<PerformanceMetric[]>([]);
  private errors$ = new BehaviorSubject<ErrorEvent[]>([]);
  private actions$ = new BehaviorSubject<UserAction[]>([]);
  private sessionId: string;
  private userId?: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupPerformanceObservers();
    this.setupErrorHandling();
    this.setupNetworkMonitoring();
    this.setupUserActionTracking();
  }

  public static getInstance(): AdvancedMonitoring {
    if (!AdvancedMonitoring.instance) {
      AdvancedMonitoring.instance = new AdvancedMonitoring();
    }
    return AdvancedMonitoring.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPerformanceObservers(): void {
    if (typeof window !== 'undefined') {
      // Navigation Timing
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordMetric('page_load', entry.duration, {
              type: 'navigation',
              path: window.location.pathname
            });
          }
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });

      // Resource Timing
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.recordMetric('resource_load', entry.duration, {
              type: entry.initiatorType,
              name: entry.name
            });
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Layout Shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'layout-shift') {
            this.recordMetric('layout_shift', entry.value, {
              path: window.location.pathname
            });
          }
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

      // Long Tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric('long_task', entry.duration, {
            path: window.location.pathname
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
  }

  private setupErrorHandling(): void {
    window.addEventListener('error', (event) => {
      this.recordError('uncaught_error', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError('unhandled_promise', event.reason.message, {
        reason: event.reason
      });
    });
  }

  private setupNetworkMonitoring(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.recordMetric('network_request', duration, {
          url: typeof args[0] === 'string' ? args[0] : args[0].url,
          method: args[1]?.method || 'GET',
          status: response.status.toString()
        });
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.recordError('network_error', error.message, {
          url: typeof args[0] === 'string' ? args[0] : args[0].url,
          duration
        });
        throw error;
      }
    };
  }

  private setupUserActionTracking(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.recordUserAction('click', {
        element: target.tagName,
        id: target.id,
        class: target.className
      });
    });

    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.recordUserAction('navigation', {
        path: window.location.pathname
      });
    };
  }

  public setUser(userId: string, metadata?: Record<string, any>): void {
    this.userId = userId;
    this.recordMetric('user_identified', 1, {
      userId,
      ...metadata
    });
  }

  public recordMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {}
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags: {
        ...tags,
        sessionId: this.sessionId,
        userId: this.userId || 'anonymous'
      }
    };

    this.metrics$.next([...this.metrics$.value, metric]);
    this.flushMetricsIfNeeded();
  }

  public recordError(
    type: string,
    message: string,
    metadata: Record<string, any> = {}
  ): void {
    const error: ErrorEvent = {
      type,
      message,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        userId: this.userId || 'anonymous',
        url: window.location.href
      },
      timestamp: Date.now()
    };

    this.errors$.next([...this.errors$.value, error]);
    this.flushErrorsIfNeeded();
  }

  public recordUserAction(
    type: string,
    metadata: Record<string, any> = {}
  ): void {
    const action: UserAction = {
      type,
      path: window.location.pathname,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        userId: this.userId || 'anonymous'
      },
      timestamp: Date.now()
    };

    this.actions$.next([...this.actions$.value, action]);
    this.flushActionsIfNeeded();
  }

  private async flushMetricsIfNeeded(): Promise<void> {
    const metrics = this.metrics$.value;
    if (metrics.length >= 100) {
      try {
        await fetch('/api/monitoring/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metrics)
        });
        this.metrics$.next([]);
      } catch (error) {
        console.error('Failed to flush metrics:', error);
      }
    }
  }

  private async flushErrorsIfNeeded(): Promise<void> {
    const errors = this.errors$.value;
    if (errors.length >= 10) {
      try {
        await fetch('/api/monitoring/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errors)
        });
        this.errors$.next([]);
      } catch (error) {
        console.error('Failed to flush errors:', error);
      }
    }
  }

  private async flushActionsIfNeeded(): Promise<void> {
    const actions = this.actions$.value;
    if (actions.length >= 50) {
      try {
        await fetch('/api/monitoring/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actions)
        });
        this.actions$.next([]);
      } catch (error) {
        console.error('Failed to flush actions:', error);
      }
    }
  }

  public async flushAll(): Promise<void> {
    await Promise.all([
      this.flushMetricsIfNeeded(),
      this.flushErrorsIfNeeded(),
      this.flushActionsIfNeeded()
    ]);
  }
}

export const monitoring = AdvancedMonitoring.getInstance();
