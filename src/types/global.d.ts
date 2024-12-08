// src/types/global.d.ts
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  }

  namespace NodeJS {
    interface ProcessEnv {
      VITE_API_URL: string;
      VITE_APP_NAME: string;
      VITE_SENTRY_DSN: string;
      VITE_ENABLE_ANALYTICS: string;
      VITE_ENABLE_MONITORING: string;
    }
  }
}

export {};
