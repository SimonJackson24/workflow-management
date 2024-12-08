// types/env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // App
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  
  // API
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_API_KEY: string;
  
  // Authentication
  readonly VITE_AUTH_DOMAIN: string;
  readonly VITE_AUTH_CLIENT_ID: string;
  readonly VITE_AUTH_AUDIENCE: string;
  
  // Features
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_MONITORING: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
  
  // Third Party Services
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_GA_TRACKING_ID: string;
  
  // Storage
  readonly VITE_STORAGE_PREFIX: string;
  readonly VITE_STORAGE_ENCRYPTION_KEY: string;
  
  // PWA
  readonly VITE_ENABLE_PWA: string;
  readonly VITE_PWA_NAME: string;
  readonly VITE_PWA_SHORT_NAME: string;
  readonly VITE_PWA_THEME_COLOR: string;
  readonly VITE_PWA_BACKGROUND_COLOR: string;
  
  // Development
  readonly VITE_DEV_MOCK_API: string;
  readonly VITE_DEV_LOGGER: string;
  readonly VITE_DEV_PERFORMANCE_MONITORING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend process.env
declare namespace NodeJS {
  interface ProcessEnv extends ImportMetaEnv {}
}

// Export empty object to make it a module
export {};
