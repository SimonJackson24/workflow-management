// core/backend/src/services/EmailTrackingService.ts

import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma';
import { logger } from '../utils/logger';

interface EmailTracking {
  id: string;
  recipientEmail: string;
  templateName: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  metadata?: Record<string, any>;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class EmailTrackingService {
  public async createTracking(data: {
    recipientEmail: string;
    templateName: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const tracking = await prisma.emailTracking.create({
      data: {
        id: uuidv4(),
        recipientEmail: data.recipientEmail,
        templateName: data.templateName,
        status: 'queued',
        metadata: data.metadata
      }
    });

    return tracking.id;
  }

  public async markAsSent(trackingId: string): Promise<void> {
    await prisma.emailTracking.update({
      where: { id: trackingId },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    });
  }

  public async markAsDelivered(trackingId: string): Promise<void> {
    await prisma.emailTracking.update({
      where: { id: trackingId },
      data: {
        status: 'delivered',
        deliveredAt: new Date()
      }
    });
  }

  public async markAsOpened(trackingId: string, metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await prisma.emailTracking.update({
      where: { id: trackingId },
      data: {
        status: 'opened',
        openedAt: new Date(),
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent
      }
    });
  }

  public async markAsClicked(trackingId: string, metadata?: {
    ipAddress?: string;
    userAgent?: string;
    link?: string;
  }): Promise<void> {
    await prisma.emailTracking.update({
      where: { id: trackingId },
      data: {
        status: 'clicked',
        clickedAt: new Date(),
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        metadata: { link: metadata?.link }
      }
    });
  }

  public async markAsFailed(trackingId: string, errorMessage: string): Promise<void> {
    await prisma.emailTracking.update({
      where: { id: trackingId },
      data: {
        status: 'failed',
        failedAt: new Date(),
        errorMessage
      }
    });
  }

  public async getTracking(trackingId: string): Promise<EmailTracking | null> {
    return prisma.emailTracking.findUnique({
      where: { id: trackingId }
    });
  }

  public async getTrackingStats(filter?: {
    startDate?: Date;
    endDate?: Date;
    templateName?: string;
  }): Promise<{
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  }> {
    const where = {
      ...(filter?.startDate && {
        sentAt: { gte: filter.startDate }
      }),
      ...(filter?.endDate && {
        sentAt: { lte: filter.endDate }
      }),
      ...(filter?.templateName && {
        templateName: filter.templateName
      })
    };

    const [total, sent, delivered, opened, clicked, failed] = await Promise.all([
      prisma.emailTracking.count({ where }),
      prisma.emailTracking.count({ where: { ...where, status: 'sent' } }),
      prisma.emailTracking.count({ where: { ...where, status: 'delivered' } }),
      prisma.emailTracking.count({ where: { ...where, status: 'opened' } }),
      prisma.emailTracking.count({ where: { ...where, status: 'clicked' } }),
      prisma.emailTracking.count({ where: { ...where, status: 'failed' } })
    ]);

    return { total, sent, delivered, opened, clicked, failed };
  }
}

export const emailTrackingService = new EmailTrackingService();
