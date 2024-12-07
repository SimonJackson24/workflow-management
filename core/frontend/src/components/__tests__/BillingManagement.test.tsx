// core/frontend/src/components/__tests__/BillingManagement.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BillingManagement from '../billing/BillingManagement';
import { BillingProvider } from '../../contexts/BillingContext';

describe('BillingManagement', () => {
  const mockBillingData = {
    plan: {
      name: 'Pro',
      price: 99,
      interval: 'monthly',
      features: ['Feature 1', 'Feature 2']
    },
    subscription: {
      status: 'active',
      currentPeriodEnd: '2024-12-31'
    },
    invoices: [
      {
        id: '1',
        amount: 99,
        status: 'paid',
        date: '2023-12-01'
      }
    ]
  };

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/api/billing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBillingData)
        } as Response);
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('displays billing information correctly', async () => {
    render(
      <BillingProvider>
        <BillingManagement />
      </BillingProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('$99/monthly')).toBeInTheDocument();
    });
  });

  it('handles payment method updates', async () => {
    render(
      <BillingProvider>
        <BillingManagement />
      </BillingProvider>
    );

    const updateButton = await screen.findByText('Update Payment Method');
    userEvent.click(updateButton);

    const cardInput = screen.getByLabelText('Card Number');
    userEvent.type(cardInput, '4242424242424242');

    const submitButton = screen.getByText('Save Payment Method');
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/billing/payment-method'),
        expect.any(Object)
      );
    });
  });
});

// core/frontend/src/components/__tests__/IntegrationCard.test.tsx

describe('IntegrationCard', () => {
  const mockIntegration = {
    id: '1',
    name: 'Slack',
    status: 'connected',
    config: { webhook: 'https://slack.com' }
  };

  it('renders integration details correctly', () => {
    render(<IntegrationCard integration={mockIntegration} />);
    
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.getByText('connected')).toBeInTheDocument();
  });

  it('handles configuration updates', async () => {
    const onUpdate = jest.fn();
    render(
      <IntegrationCard
        integration={mockIntegration}
        onUpdate={onUpdate}
      />
    );

    const configButton = screen.getByLabelText('Configure');
    userEvent.click(configButton);

    const webhookInput = screen.getByLabelText('Webhook URL');
    userEvent.type(webhookInput, 'https://new-webhook.com');

    const saveButton = screen.getByText('Save');
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({
        id: '1',
        config: { webhook: 'https://new-webhook.com' }
      });
    });
  });
});

// core/frontend/src/components/__tests__/UserProfile.test.tsx

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg'
  };

  it('displays user information correctly', () => {
    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toHaveAttribute(
      'src',
      'https://example.com/avatar.jpg'
    );
  });

  it('handles profile updates', async () => {
    const onUpdate = jest.fn();
    render(<UserProfile user={mockUser} onUpdate={onUpdate} />);

    const editButton = screen.getByText('Edit Profile');
    userEvent.click(editButton);

    const nameInput = screen.getByLabelText('Name');
    userEvent.clear(nameInput);
    userEvent.type(nameInput, 'Jane Doe');

    const saveButton = screen.getByText('Save Changes');
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({
        ...mockUser,
        name: 'Jane Doe'
      });
    });
  });

  it('validates form inputs', async () => {
    render(<UserProfile user={mockUser} />);

    const editButton = screen.getByText('Edit Profile');
    userEvent.click(editButton);

    const emailInput = screen.getByLabelText('Email');
    userEvent.clear(emailInput);
    userEvent.type(emailInput, 'invalid-email');

    const saveButton = screen.getByText('Save Changes');
    userEvent.click(saveButton);

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
  });
});

// core/frontend/src/components/__tests__/AnalyticsDashboard.test.tsx

describe('AnalyticsDashboard', () => {
  const mockData = {
    activeUsers: 1000,
    pageViews: 5000,
    averageSessionDuration: 300
  };

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      } as Response)
    );
  });

  it('renders analytics metrics correctly', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1,000')).toBeInTheDocument(); // Active Users
      expect(screen.getByText('5,000')).toBeInTheDocument(); // Page Views
    });
  });

  it('handles date range changes', async () => {
    render(<AnalyticsDashboard />);

    const dateRangeButton = screen.getByText('Last 7 Days');
    userEvent.click(dateRangeButton);

    const monthOption = screen.getByText('Last 30 Days');
    userEvent.click(monthOption);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('timeRange=30d'),
        expect.any(Object)
      );
    });
  });

  it('exports data correctly', async () => {
    render(<AnalyticsDashboard />);

    const exportButton = screen.getByText('Export Data');
    userEvent.click(exportButton);

    const csvOption = screen.getByText('Export as CSV');
    userEvent.click(csvOption);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/export'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });
});
