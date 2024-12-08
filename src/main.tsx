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

import App from './App';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { PluginProvider } from './contexts/PluginProvider';
import { StoreProvider } from './store/StoreProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingScreen } from './components/common/LoadingScreen';
import { globalStyles } from './theme/globalStyles';
import { initializeAnalytics } from './utils/analytics';
import { registerServiceWorker } from './utils/serviceWorker';
import { setupAxiosInterceptors } from './utils/api';
import { initializeI18n } from './utils/i18n';
import { monitorWebVitals } from './utils/monitoring';

// Initialize Sentry for error tracking
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,
  });
}

// Initialize i18n
initializeI18n();

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      suspense: true,
      useErrorBoundary: true,
    },
    mutations: {
      useErrorBoundary: true,
    },
  },
});

// Configure API interceptors
setupAxiosInterceptors();

// Initialize analytics
initializeAnalytics();

// App Wrapper Component
const AppWrapper: React.FC = () => {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Initialize any required resources
    const initializeApp = async () => {
      try {
        // Wait for loadable components
        await loadableReady();
        
        // Register service worker
        await registerServiceWorker();
        
        // Mark app as ready
        setIsReady(true);
      } catch (error) {
        console.error('Initialization failed:', error);
        Sentry.captureException(error);
      }
    };

    initializeApp();
  }, []);

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
            <StoreProvider>
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
