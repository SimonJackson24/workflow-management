// core/backend/src/tests/email.test.ts

import { EmailTestUtils } from '../utils/testing/EmailTestUtils';
import { emailService } from '../services/EmailService';
import { emailQueueService } from '../services/EmailQueueService';
import { emailTrackingService } from '../services/EmailTrackingService';

describe('Email System', () => {
  beforeAll(async () => {
    await EmailTestUtils.createTestAccount();
  });

  beforeEach(async () => {
    await EmailTestUtils.clearEmailQueue();
  });

  it('should send an email successfully', async () => {
    const emailOptions = {
      template: 'welcome',
      to: 'test@example.com',
      data: {
        name: 'Test User'
      }
    };

    const messageUrl = await EmailTestUtils.sendTestEmail(emailOptions);
    expect(messageUrl).toBeTruthy();
  });

  it('should queue multiple emails', async () => {
    const emails = Array.from({ length: 5 }, (_, i) => ({
      template: 'welcome',
      to: `test${i}@example.com`,
      data: { name: `Test User ${i}` }
    }));

    await emailQueueService.addBulkToQueue(emails);
    await EmailTestUtils.waitForEmails(5);

    const status = await emailQueueService.getQueueStatus();
    expect(status.completed).toBe(5);
  });

  it('should track email events', async () => {
    const trackingId = await emailTrackingService.createTracking({
      recipientEmail: 'test@example.com',
      templateName: 'welcome'
    });

    await emailTrackingService.markAsSent(trackingId);
    await emailTrackingService.markAsDelivered(trackingId);
    await emailTrackingService.markAsOpened(trackingId, {
      ipAddress: '127.0.0.1',
      userAgent: 'Jest Test'
    });

    const tracking = await emailTrackingService.getTracking(trackingId);
    expect(tracking?.status).toBe('opened');
  });
});
