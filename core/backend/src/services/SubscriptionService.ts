// core/backend/src/services/SubscriptionService.ts

import { prisma } from '../prisma';
import { PaymentService } from './PaymentService';
import { UsageService } from './UsageService';
import { 
  Subscription, 
  Plan, 
  SubscriptionStatus,
  BillingCycle 
} from '../types/billing.types';

export class SubscriptionService {
  private paymentService: PaymentService;
  private usageService: UsageService;

  constructor() {
    this.paymentService = new PaymentService();
    this.usageService = new UsageService();
  }

  async createSubscription(userId: string, planId: string, paymentMethodId: string): Promise<Subscription> {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error('Plan not found');

    const subscription = await prisma.$transaction(async (prisma) => {
      // Create subscription
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          planId,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: this.calculatePeriodEnd(new Date(), plan.billingCycle),
          paymentMethodId
        }
      });

      // Process initial payment
      await this.paymentService.processSubscriptionPayment(subscription.id);

      // Initialize usage metrics
      await this.usageService.initializeUsageMetrics(subscription.id, plan.limits);

      return subscription;
    });

    return subscription;
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    });

    // Handle cancellation logic
    await this.handleSubscriptionCancellation(subscription);

    return subscription;
  }

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updates
    });
  }

  async handleSubscriptionRenewal(subscriptionId: string): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true }
    });

    if (!subscription) throw new Error('Subscription not found');

    try {
      // Process renewal payment
      await this.paymentService.processSubscriptionPayment(subscriptionId);

      // Update subscription period
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          currentPeriodStart: new Date(),
          currentPeriodEnd: this.calculatePeriodEnd(new Date(), subscription.plan.billingCycle)
        }
      });

      // Reset usage metrics
      await this.usageService.resetUsageMetrics(subscriptionId);
    } catch (error) {
      await this.handleFailedRenewal(subscriptionId);
      throw error;
    }
  }

  async changePlan(subscriptionId: string, newPlanId: string): Promise<Subscription> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true }
    });

    const newPlan = await prisma.plan.findUnique({
      where: { id: newPlanId }
    });

    if (!subscription || !newPlan) throw new Error('Subscription or plan not found');

    // Calculate prorated amounts
    const proratedCredit = this.calculateProration(subscription);
    const newAmount = newPlan.price - proratedCredit;

    // Process plan change payment if needed
    if (newAmount > 0) {
      await this.paymentService.processOneTimePayment(subscription.userId, newAmount);
    }

    // Update subscription
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        planId: newPlanId,
        updatedAt: new Date()
      }
    });
  }

  private calculatePeriodEnd(startDate: Date, billingCycle: BillingCycle): Date {
    const endDate = new Date(startDate);
    switch (billingCycle) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
    }
    return endDate;
  }

  private async handleSubscriptionCancellation(subscription: Subscription): Promise<void> {
    // Handle any cleanup or final billing
    await this.paymentService.processFinalCharges(subscription.id);
    await this.usageService.finalizeUsage(subscription.id);
  }

  private async handleFailedRenewal(subscriptionId: string): Promise<void> {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'past_due',
        failedPayments: {
          increment: 1
        }
      }
    });

    // Implement retry logic or grace period handling
  }

  private calculateProration(subscription: Subscription): number {
    const now = new Date();
    const end = new Date(subscription.currentPeriodEnd);
    const total = end.getTime() - now.getTime();
    const remaining = total / (1000 * 60 * 60 * 24); // Convert to days

    return (subscription.plan.price / 30) * remaining; // Assuming monthly billing
  }

  // Subscription monitoring and maintenance
  async monitorSubscriptions(): Promise<void> {
    // Check for subscriptions needing renewal
    const dueForRenewal = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lte: new Date()
        }
      }
    });

    for (const subscription of dueForRenewal) {
      await this.handleSubscriptionRenewal(subscription.id);
    }

    // Check for failed payments needing retry
    const failedPayments = await prisma.subscription.findMany({
      where: {
        status: 'past_due',
        failedPayments: {
          lt: 3 // Max retry attempts
        }
      }
    });

    for (const subscription of failedPayments) {
      await this.retryFailedPayment(subscription.id);
    }
  }

  private async retryFailedPayment(subscriptionId: string): Promise<void> {
    try {
      await this.paymentService.retryPayment(subscriptionId);
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'active',
          failedPayments: 0
        }
      });
    } catch (error) {
      // Handle failed retry
      console.error(`Failed payment retry for subscription ${subscriptionId}:`, error);
    }
  }
}
