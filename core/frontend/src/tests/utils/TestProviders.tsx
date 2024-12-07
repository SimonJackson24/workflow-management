// core/frontend/src/tests/utils/TestProviders.tsx

import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from '../../store/dashboardSlice';
import { theme } from '../../theme';

export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      dashboard: dashboardReducer
    },
    preloadedState: initialState
  });
};

interface TestProvidersProps {
  children: React.ReactNode;
  initialState?: any;
}

export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  initialState
}) => {
  const store = createTestStore(initialState);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </Provider>
  );
};
