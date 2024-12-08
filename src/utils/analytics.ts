// src/utils/analytics.ts

import * as Sentry from "@sentry/react";

class Analytics {
  private initialized = false;

  initialize() {
    if (this.initialized) return;

    if (import.meta.env.PROD) {
      try {
        // Initialize Sentry
        Sentry.init({
          dsn: import.meta.env.VITE_SENTRY_DSN,
          integrations: [
            new Sentry.BrowserTracing(),
            new Sentry.Replay(),
          ],
          tracesSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
          environment: import.meta.env.MODE,
        });

        // Initialize Google Analytics if configured
        if (import.meta.env.VITE_GA_ID) {
          this.initializeGoogleAnalytics();
        }

        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
      }
    }
  }

  private initializeGoogleAnalytics() {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', import.meta.env.VITE_GA_ID);
  }

  trackEvent(category: string, action: string, label?: string, value?: number) {
    if (!this.initialized || !import.meta.env.PROD) return;

    try {
      // Track in Google Analytics
      if (window.gtag) {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value
        });
      }

      // Track in Sentry
      Sentry.addBreadcrumb({
        category,
        message: action,
        level: 'info',
        data: { label, value }
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  trackError(error: Error, context?: Record<string, any>) {
    if (!this.initialized || !import.meta.env.PROD) return;

    try {
      Sentry.captureException(error, { extra: context });
    } catch (e) {
      console.error('Failed to track error:', e);
    }
  }

  setUser(userId: string, userData?: Record<string, any>) {
    if (!this.initialized || !import.meta.env.PROD) return;

    try {
      Sentry.setUser({
        id: userId,
        ...userData
      });

      if (window.gtag) {
        window.gtag('set', 'user_id', userId);
      }
    } catch (error) {
      console.error('Failed to set user:', error);
    }
  }
}

export const analytics = new Analytics();
