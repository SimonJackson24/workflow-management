// core/frontend/src/components/__tests__/NotificationSystem.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationSystem from '../notifications/NotificationSystem';
import { NotificationProvider } from '../../contexts/NotificationContext';

describe('NotificationSystem', () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'info',
      read: false,
      timestamp: new Date()
    }
  ];

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockNotifications),
        ok: true
      } as Response)
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('displays notifications correctly', async () => {
    render(
      <NotificationProvider>
        <NotificationSystem />
      </NotificationProvider>
    );

    const badge = screen.getByTestId('notification-badge');
    expect(badge).toHaveTextContent('1');

    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });
  });

  it('marks notifications as read', async () => {
    render(
      <NotificationProvider>
        <NotificationSystem />
      </NotificationProvider>
    );

    const notification = await screen.findByText('Test Notification');
    userEvent.click(notification);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications'),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });
});

// core/frontend/src/components/__tests__/IntegrationManagement.test.tsx

describe('IntegrationManagement', () => {
  const mockIntegrations = [
    {
      id: '1',
      name: 'Test Integration',
      type: 'slack',
      status: 'connected',
      enabled: true
    }
  ];

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockIntegrations),
        ok: true
      } as Response)
    );
  });

  it('renders integrations list', async () => {
    render(<IntegrationManagement />);

    await waitFor(() => {
      expect(screen.getByText('Test Integration')).toBeInTheDocument();
    });
  });

  it('handles integration toggle', async () => {
    render(<IntegrationManagement />);

    const toggle = await screen.findByRole('switch');
    userEvent.click(toggle);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/integrations/1/toggle'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
