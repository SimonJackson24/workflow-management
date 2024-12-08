// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { CssBaseline, LinearProgress } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { loadableReady } from '@loadable/component';
import { enableMapSet, enablePatches } from 'immer';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { PluginProvider } from './contexts/PluginProvider';
import { StoreProvider } from './store/StoreProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingScreen } from './components/common/LoadingScreen';
import { UpdatePrompt } from './components/common/UpdatePrompt';
import { ErrorFallback } from './components/common/ErrorFallback';
import { globalStyles } from './theme/globalStyles';
import { initializeAnalytics } from './utils/analytics';
import { registerServiceWorker } from './utils/serviceWorker';
import { setupAxiosInterceptors } from './utils/api';
import { initializeI18n } from './utils/i18n';
import { monitorWebVitals } from './utils/monitoring';
import { setupPerformanceMonitoring } from './utils/performance';
import { configureStore } from './store/configureStore';

// Enable Immer features
enableMapSet();
enablePatches();

// Initialize Sentry for error tracking
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Integrations.BrowserTracing({
        tracingOrigins: ['localhost', import.meta.env.VITE_API_URL],
      }),
      new Integrations.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,
    beforeSend(event) {
      if (event.exception) {
        Sentry.showReportDialog({ eventId: event.event_id });
      }
      return event;
    },
  });
}

// Initialize i18n
initializeI18n();

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      suspense: true,
      useErrorBoundary: (error: any) => {
        return error?.response?.status >= 500;
      },
      onError: (error: any) => {
        if (!error?.response?.status) {
          console.error('Network error:', error);
          Sentry.captureException(error);
        }
      },
    },
    mutations: {
      useErrorBoundary: true,
      retry: false,
    },
  },
});

// Configure store
const store = configureStore();

// Configure API interceptors
setupAxiosInterceptors(store);

// Initialize analytics
initializeAnalytics();

// App Wrapper Component
const AppWrapper: React.FC = () => {
  const [isReady, setIsReady] = React.useState(false);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    // Initialize any required resources
    const initializeApp = async () => {
      try {
        // Setup performance monitoring
        setupPerformanceMonitoring();

        // Register service worker with update handling
        if (import.meta.env.PROD) {
          const updateSW = registerSW({
            onNeedRefresh() {
              setUpdateAvailable(true);
            },
            onOfflineReady() {
              console.log('App ready to work offline');
            },
          });
        }

        // Wait for all initializations
        await Promise.all([
          loadableReady(),
          registerServiceWorker(),
          initializeI18n(),
          new Promise(resolve => setTimeout(resolve, 1000)), // Minimum loading time
        ]);
        
        // Mark app as ready
        setIsReady(true);
      } catch (error) {
        console.error('Initialization failed:', error);
        Sentry.captureException(error);
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      // Cleanup any resources
    };
  }, []);

  // Handle updates
  const handleUpdate = () => {
    window.location.reload();
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <React.Suspense fallback={<LinearProgress />}>
      <HelmetProvider>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            {globalStyles}
            <CssBaseline />
            <StoreProvider store={store}>
              <AuthProvider>
                <PluginProvider>
                  <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                      <App />
                      <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme={theme.palette.mode}
                      />
                      {updateAvailable && (
                        <UpdatePrompt onUpdate={handleUpdate} />
                      )}
                    </BrowserRouter>
                    {import.meta.env.DEV && <ReactQueryDevtools />}
                  </QueryClientProvider>
                </PluginProvider>
              </AuthProvider>
            </StoreProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </HelmetProvider>
    </React.Suspense>
  );
};

// Error Handler Component
const ErrorHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
        {children}
      </Sentry.ErrorBoundary>
    </ErrorBoundary>
  );
};

// Mount Application
const mountApp = () => {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorHandler>
        <AppWrapper />
      </ErrorHandler>
    </React.StrictMode>
  );

  // Monitor web vitals
  monitorWebVitals();
};

// Initialize app
if (import.meta.env.PROD) {
  // In production, wait for all resources
  loadableReady(() => {
    mountApp();
  });
} else {
  // In development, mount immediately
  mountApp();
}

// Hot Module Replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}

// Export for testing
export { AppWrapper, ErrorHandler };
