// core/frontend/src/components/__tests__/Dashboard.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../dashboard/Dashboard';
import { AuthProvider } from '../../contexts/AuthContext';

describe('Dashboard Component', () => {
  it('renders dashboard metrics', async () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Storage Used')).toBeInTheDocument();
    expect(screen.getByText('API Calls')).toBeInTheDocument();
  });

  it('handles time range selection', async () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );

    const timeRangeButton = screen.getBy
