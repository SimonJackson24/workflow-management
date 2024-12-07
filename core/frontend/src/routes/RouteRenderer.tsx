// core/frontend/src/routes/RouteRenderer.tsx

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { routes } from './routes.config';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/layout/Layout';

const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

const RouteRenderer: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {routes.map((route) => {
          const Component = route.component;

          if (route.public) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Component />}
              />
            );
          }

          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute config={route}>
                  <Layout>
                    <Component />
                  </Layout>
                </ProtectedRoute>
              }
            />
          );
        })}
      </Routes>
    </Suspense>
  );
};

export default RouteRenderer;
