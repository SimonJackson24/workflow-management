// core/frontend/src/utils/analytics.ts

interface EventData {
  category: string;
  action: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

class Analytics {
  private static instance: Analytics;
  private initialized: boolean = false;
  private queue: EventData[] = [];

  private constructor() {
    this.initializeGoogleAnalytics();
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  private initializeGoogleAnalytics(): void {
    if (typeof window !== 'undefined' && process.env.REACT_APP_GA_ID) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_APP_GA_ID}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', process.env.REACT_APP_GA_ID);

      this.initialized = true;
      this.processQueue();
    }
  }

  private processQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.trackEvent(event);
      }
    }
  }

  public pageView(path: string): void {
    if (this.initialized && window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_ID!, {
        page_path: path,
      });
    }
  }

  public trackEvent(data: EventData): void {
    if (!this.initialized) {
      this.queue.push(data);
      return;
    }

    if (window.gtag) {
      window.gtag('event', data.action, {
        event_category: data.category,
        event_label: data.label,
        value: data.value,
        ...data,
      });
    }

    // You can add more analytics providers here
  }

  public setUser(userId: string, userData?: Record<string, any>): void {
    if (this.initialized && window.gtag) {
      window.gtag('set', {
        user_id: userId,
        ...userData,
      });
    }
  }

  public timing(category: string, variable: string, value: number, label?: string): void {
    if (this.initialized && window.gtag) {
      window.gtag('event', 'timing_complete', {
        event_category: category,
        name: variable,
        value,
        event_label: label,
      });
    }
  }
}

export const analytics = Analytics.getInstance();

// Usage example:
// analytics.trackEvent({
//   category: 'User',
//   action: 'Created Account',
//   label: 'Premium Plan',
//   value: 99
// });
