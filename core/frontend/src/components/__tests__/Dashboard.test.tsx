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

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Active Users/i)).toBeInTheDocument();
      expect(screen.getByText(/Storage Used/i)).toBeInTheDocument();
      expect(screen.getByText(/API Calls/i)).toBeInTheDocument();
    });
  });

  it('handles time range changes', async () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );

    const timeRangeButton = await screen.findByText(/7d/i);
    userEvent.click(timeRangeButton);

    const thirtyDayOption = screen.getByText(/30d/i);
    userEvent.click(thirtyDayOption);

    await waitFor(() => {
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });
  });
});
