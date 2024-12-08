// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from './App';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { PluginProvider } from './contexts/PluginContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { globalStyles } from './theme/globalStyles';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Performance monitoring
const reportWebVitals = (metric: any) => {
  // Implement analytics
  console.log(metric);
};

// Initialize monitoring
if (import.meta.env.VITE_ENABLE_MONITORING === 'true') {
  // Initialize monitoring services
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          {globalStyles}
          <CssBaseline />
          <AuthProvider>
            <PluginProvider>
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
                />
              </BrowserRouter>
            </PluginProvider>
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Report web vitals
reportWebVitals();

// Remove Preload scripts loading
postMessage({ payload: 'removeLoading' }, '*');

// PWA HMR setup
if (import.meta.env.DEV) {
  window.addEventListener('message', (event) => {
    if (event.data.payload === 'reload') {
      window.location.reload();
    }
  });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
