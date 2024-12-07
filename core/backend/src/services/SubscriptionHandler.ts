// core/backend/src/services/SubscriptionHandler.ts

import { StripeIntegration } from '../integrations/StripeIntegration';
import { 
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  BillingCycle,
  ProratedChanges
} from '../types/billing.types';

export class SubscriptionHandler {
  private stripeIntegration: StripeIntegration;

  constructor(stripeIntegration: StripeIntegration) {
    this.stripeIntegration = stripeIntegration;
  }

  async createSubscription(data: {
    userId: string;
    planId: string;
    paymentMethodId: string;
    metadata?: Record<string, string>;
  }): Promise<Subscription> {
    try {
      // Get user's Stripe customer ID
      const customer = await this.getOrCreateCustomer(data.userId);

      // Create Stripe subscription
      const stripeSubscription = await this.stripeIntegration.createSubscription({
        customerId: customer.id,
        priceId: await this.getPriceIdForPlan(data.planId),
        paymentMethodId: data.paymentMethodId,
        metadata: data.metadata
      });

      // Create local subscription record
      const subscription = await prisma.subscription.create({
        data: {
          userId: data.userId,
          planId: data.planId,
          stripeSubscriptionId: stripeSubscription.id,
          status: this.mapStripeStatus(stripeSubscription.status),
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          metadata: data.metadata
        }
      });

      // Initialize usage tracking
      await this.initializeUsageTracking(subscription.id);

      return subscription;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    try {
      // Update Stripe subscription if necessary
      if (updates.planId) {
        await this.stripeIntegration.updateSubscription(
          subscription.stripeSubscriptionId,
          {
            priceId: await this.getPriceIdForPlan(updates.planId)
          }
        );
      }

      // Update local subscription record
      return await prisma.subscription.update({
        where: { id: subscriptionId },
        data: updates
      });
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    options: {
      immediate?: boolean;
      reason?: string;
    } = {}
  ): Promise<Subscription> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    try {
      // Cancel Stripe subscription
      await this.stripeIntegration.cancelSubscription(
        subscription.stripeSubscriptionId,
        options
      );

      // Update local subscription record
      return await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: options.immediate ? 'cancelled' : 'cancelling',
          cancelledAt: new Date(),
          cancellationReason: options.reason
        }
      });
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  async handleSubscriptionWebhook(event: any): Promise<void> {
    const subscription = event.data.object;

    switch (event.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(subscription);
        break;
      case 'customer.subscription.trial_will_end':
        await this.handleTrialEnding(subscription);
        break;
      // Add more webhook handlers as needed
    }
  }

  private async handleSubscriptionUpdated(stripeSubscription: any): Promise<void> {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: this.mapStripeStatus(stripeSubscription.status),
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
        }
      });
    }
  }

  private async handleSubscriptionDeleted(stripeSubscription: any): Promise<void> {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date()
        }
      });
    }
  }

  private async handleTrialEnding(stripeSubscription: any): Promise<void> {
    // Implement trial ending logic
  }

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      'active': 'active',
      'past_due': 'past_due',
      'unpaid': 'unpaid',
      'canceled': 'cancelled',
      'incomplete': 'incomplete',
      'incomplete_expired': 'expired',
      'trialing': 'trialing'
    };

    return statusMap[stripeStatus] || 'unknown';
  }

  private async getOrCreateCustomer(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.stripeCustomerId) {
      return await this.stripeIntegration.getCustomer(user.stripeCustomerId);
    }

    const customer = await this.stripeIntegration.createCustomer({
      email: user.email,
      name: user.name
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id }
    });

    return customer;
  }

  private async getPriceIdForPlan(planId: string): Promise<string> {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    return plan.stripePriceId;
  }

  private async initializeUsageTracking(subscriptionId: string): Promise<void> {
    // Initialize usage tracking for the subscription
  }
}
