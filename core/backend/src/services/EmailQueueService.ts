// core/backend/src/services/EmailQueueService.ts

import Bull, { Queue, Job } from 'bull';
import { EmailOptions } from '../types/email.types';
import { emailService } from './EmailService';
import { logger } from '../utils/logger';
import { config } from '../config';
import { EmailTrackingService } from './EmailTrackingService';

interface QueuedEmail extends EmailOptions {
  id?: string;
  priority?: number;
  attempts?: number;
  trackingId?: string;
}

export class EmailQueueService {
  private queue: Queue<QueuedEmail>;
  private trackingService: EmailTrackingService;

  constructor() {
    this.queue = new Bull('email-queue', {
      redis: config.redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: true
      }
    });

    this.trackingService = new EmailTrackingService();
    this.setupQueueHandlers();
  }

  private setupQueueHandlers(): void {
    // Process emails in the queue
    this.queue.process(async (job: Job<QueuedEmail>) => {
      try {
        const { trackingId, ...emailData } = job.data;
        await emailService.sendEmail(emailData);

        if (trackingId) {
          await this.trackingService.markAsSent(trackingId);
        }

        logger.info(`Email sent successfully: ${job.id}`);
      } catch (error) {
        logger.error(`Failed to send email: ${job.id}`, error);
        throw error;
      }
    });

    // Handle failed jobs
    this.queue.on('failed', (job: Job<QueuedEmail>, error: Error) => {
      logger.error(`Job ${job.id} failed:`, error);
      if (job.data.trackingId) {
        this.trackingService.markAsFailed(job.data.trackingId, error.message);
      }
    });

    // Handle completed jobs
    this.queue.on('completed', (job: Job<QueuedEmail>) => {
      logger.info(`Job ${job.id} completed`);
    });
  }

  public async addToQueue(email: QueuedEmail): Promise<Job<QueuedEmail>> {
    const trackingId = await this.trackingService.createTracking({
      recipientEmail: email.to,
      templateName: email.template,
      metadata: email.data
    });

    return this.queue.add(
      { ...email, trackingId },
      {
        priority: email.priority || 0,
        attempts: email.attempts || 3
      }
    );
  }

  public async addBulkToQueue(emails: QueuedEmail[]): Promise<Job<QueuedEmail>[]> {
    const jobs = await Promise.all(
      emails.map(async (email) => {
        const trackingId = await this.trackingService.createTracking({
          recipientEmail: email.to,
          templateName: email.template,
          metadata: email.data
        });

        return {
          data: { ...email, trackingId },
          opts: {
            priority: email.priority || 0,
            attempts: email.attempts || 3
          }
        };
      })
    );

    return this.queue.addBulk(jobs);
  }

  public async getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount()
    ]);

    return { waiting, active, completed, failed };
  }

  public async clearQueue(): Promise<void> {
    await this.queue.empty();
  }

  public async pauseQueue(): Promise<void> {
    await this.queue.pause();
  }

  public async resumeQueue(): Promise<void> {
    await this.queue.resume();
  }
}

export const emailQueueService = new EmailQueueService();
