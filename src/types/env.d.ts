// src/types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_MONITORING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
