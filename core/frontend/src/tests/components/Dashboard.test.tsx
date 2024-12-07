// core/frontend/src/tests/components/Dashboard.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '../utils/testHelpers';
import { Dashboard } from '../../components/Dashboard';
import { createMockMetric, createMockActivity } from '../utils/dashboardTestUtils';

describe('Dashboard', () => {
  it('renders all dashboard sections', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Recent Plugins')).toBeInTheDocument();
    });
  });

  it('handles data refresh', async () => {
    const { container } = render(<Dashboard />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(container.querySelector('.loading-indicator')).toBeNull();
    });
  });

  it('handles error states', async () => {
    const mockError = new Error('Test error');
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Dashboard />, {
      initialState: {
        dashboard: {
          metrics: {
            error: mockError.message,
            loading: false,
            data: []
          }
        }
      }
    });

    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });
});

// core/frontend/src/tests/hooks/useDashboard.test.ts

import { renderHook, act } from '@testing-library/react-hooks';
import { useDashboard } from '../../hooks/useDashboard';
import { TestProviders } from '../utils/TestProviders';

describe('useDashboard', () => {
  it('fetches initial dashboard data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useDashboard(), {
      wrapper: TestProviders
    });

    await waitForNextUpdate();

    expect(result.current.metrics.data).toBeDefined();
    expect(result.current.activities.data).toBeDefined();
    expect(result.current.plugins.data).toBeDefined();
    expect(result.current.usage.data).toBeDefined();
  });

  it('handles refresh interval changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useDashboard(), {
      wrapper: TestProviders
    });

    await waitForNextUpdate();

    act(() => {
      result.current.setRefreshInterval(5000);
    });

    expect(result.current.refreshInterval).toBe(5000);
  });
});
