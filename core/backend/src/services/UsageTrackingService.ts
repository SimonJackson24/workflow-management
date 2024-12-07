// core/backend/src/services/UsageTrackingService.ts

import { prisma } from '../prisma';
import { 
  UsageMetric, 
  UsageRecord, 
  UsageAlert,
  UsageLimits 
} from '../types/billing.types';
import { EventEmitter } from 'events';

export class UsageTrackingService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  async trackUsage(subscriptionId: string, metric: UsageMetric, value: number): Promise<UsageRecord> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true }
    });

    if (!subscription) throw new Error('Subscription not found');

    // Record usage
    const usageRecord = await prisma.usageRecord.create({
      data: {
        subscriptionId,
        metric,
        value,
        timestamp: new Date()
      }
    });

    // Check limits
    await this.checkUsageLimits(subscriptionId, metric);

    // Emit usage event
    this.eventEmitter.emit('usage:recorded', usageRecord);

    return usageRecord;
  }

  async getCurrentUsage(subscriptionId: string): Promise<Record<UsageMetric, number>> {
    const currentPeriod = await this.getCurrentBillingPeriod(subscriptionId);
    
    const usage = await prisma.usageRecord.groupBy({
      by: ['metric'],
      where: {
        subscriptionId,
        timestamp: {
          gte: currentPeriod.start,
          lte: currentPeriod.end
        }
      },
      _sum: {
        value: true
      }
    });

    return this.formatUsageData(usage);
  }

  async getUsageHistory(
    subscriptionId: string,
    metric: UsageMetric,
    startDate: Date,
    endDate: Date
  ): Promise<UsageRecord[]> {
    return await prisma.usageRecord.findMany({
      where: {
        subscriptionId,
        metric,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
  }

  async checkUsageLimits(subscriptionId: string, metric: UsageMetric): Promise<void> {
    const currentUsage = await this.getCurrentUsage(subscriptionId);
    const limits = await this.getUsageLimits(subscriptionId);

    const usage = currentUsage[metric];
    const limit = limits[metric];

    if (usage >= limit) {
      await this.handleLimitExceeded(subscriptionId, metric, usage, limit);
    } else if (usage >= limit * 0.8) { // 80% threshold
      await this.sendUsageAlert(subscriptionId, metric, usage, limit);
    }
  }

  private async handleLimitExceeded(
    subscriptionId: string,
    metric: UsageMetric,
    usage: number,
    limit: number
  ): Promise<void> {
    // Create alert
    await prisma.usageAlert.create({
      data: {
        subscriptionId,
        metric,
        usage,
        limit,
        type: 'limit_exceeded'
      }
    });

    // Emit limit exceeded event
    this.eventEmitter.emit('usage:limit_exceeded', {
      subscriptionId,
      metric,
      usage,
      limit
    });

    // Handle based on subscription settings
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true }
    });

    if (subscription?.plan.overage_behavior === 'block') {
      await this.blockUsage(subscriptionId, metric);
    } else {
      await this.handleOverage(subscriptionId, metric, usage - limit);
    }
  }

  private async sendUsageAlert(
    subscriptionId: string,
    metric: UsageMetric,
    usage: number,
    limit: number
  ): Promise<void> {
    await prisma.usageAlert.create({
      data: {
        subscriptionId,
        metric,
        usage,
        limit,
        type: 'threshold_warning'
      }
    });

    this.eventEmitter.emit('usage:threshold_warning', {
      subscriptionId,
      metric,
      usage,
      limit
    });
  }

  private async blockUsage(subscriptionId: string, metric: UsageMetric): Promise<void> {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        blockedMetrics: {
          push: metric
        }
      }
    });
  }

  private async handleOverage(
    subscriptionId: string,
    metric: UsageMetric,
    overageAmount: number
  ): Promise<void> {
    // Calculate overage charges
    const charges = await this.calculateOverageCharges(subscriptionId, metric, overageAmount);

    // Create overage record
    await prisma.overageCharge.create({
      data: {
        subscriptionId,
        metric,
        amount: overageAmount,
        charges
      }
    });
  }

  async generateUsageReport(
    subscriptionId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const usage = await prisma.usageRecord.findMany({
      where: {
        subscriptionId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        alerts: true,
        overages: true
      }
    });

    return this.formatUsageReport(usage);
  }

  onUsageEvent(event: string, handler: (data: any) => void): void {
    this.eventEmitter.on(event, handler);
  }
}
