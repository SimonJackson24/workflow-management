import Stripe from 'stripe';
import { Document } from 'mongoose';
import Subscription from '../models/subscription.model';
import Organization from '../models/organization.model';
import { SubscriptionPlan, SubscriptionStatus } from '../types/subscription.types';

export class SubscriptionService {
  private stripe: Stripe;
  private readonly PLANS = {
    basic: {
      id: 'basic',
      stripeId: process.env.STRIPE_BASIC_PLAN_ID,
      maxUsers: 5,
      plugins: ['calendar', 'employee-management'],
      features: ['basic-support']
    },
    professional: {
      id: 'professional',
      stripeId: process.env.STRIPE_PRO_PLAN_ID,
      maxUsers: 20,
      plugins: ['calendar', 'employee-management', 'task-management', 'workflow'],
      features: ['priority-support', 'api-access']
    },
    enterprise: {
      id: 'enterprise',
      stripeId: process.env.STRIPE_ENTERPRISE_PLAN_ID,
      maxUsers: 100,
      plugins: ['calendar', 'employee-management', 'task-management', 'workflow', 'custom-plugins'],
      features: ['dedicated-support', 'api-access', 'custom-development']
    }
  };

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }

  async createSubscription(organizationId: string, planId: string): Promise<{
    subscriptionId: string;
    clientSecret: string;
  }> {
    try {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      const plan = this.PLANS[planId as keyof typeof this.PLANS];
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Create or get Stripe customer
      let stripeCustomer;
      if (organization.stripeCustomerId) {
        stripeCustomer = await this.stripe.customers.retrieve(organization.stripeCustomerId);
      } else {
        stripeCustomer = await this.stripe.customers.create({
          email: organization.email,
          metadata: {
            organizationId: organization.id
          }
        });
        organization.stripeCustomerId = stripeCustomer.id;
        await organization.save();
      }

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: plan.stripeId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          organizationId: organization.id,
          planId: plan.id
        }
      });

      // Save subscription details
      const newSubscription = new Subscription({
        organizationId,
        planId: plan.id,
        stripeCustomerId: stripeCustomer.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        plugins: plan.plugins,
        maxUsers: plan.maxUsers,
        features: plan.features
      });

      await newSubscription.save();

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      return {
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret!
      };
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    }
  }

  async updateSubscription(organizationId: string, planId: string): Promise<boolean> {
    try {
      const subscription = await Subscription.findOne({ organizationId });
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const plan = this.PLANS[planId as keyof typeof this.PLANS];
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Update Stripe subscription
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{ price: plan.stripeId }],
        metadata: {
          planId: plan.id
        }
      });

      // Update local subscription
      subscription.planId = plan.id;
      subscription.plugins = plan.plugins;
      subscription.maxUsers = plan.maxUsers;
      subscription.features = plan.features;

      await subscription.save();
      return true;
    } catch (error) {
      console.error('Subscription update failed:', error);
      return false;
    }
  }

  async cancelSubscription(organizationId: string): Promise<boolean> {
    try {
      const subscription = await Subscription.findOne({ organizationId });
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Cancel Stripe subscription
      await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

      // Update local subscription
      subscription.status = SubscriptionStatus.CANCELED;
      await subscription.save();

      return true;
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      return false;
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await this.updateSubscriptionStatus(subscription);
          break;
        
        case 'invoice.payment_failed':
          const invoice = event.data.object as Stripe.Invoice;
          await this.handleFailedPayment(invoice);
          break;
      }
    } catch (error) {
      console.error('Webhook handling failed:', error);
      throw error;
    }
  }

  private async updateSubscriptionStatus(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id
    });

    if (subscription) {
      subscription.status = stripeSubscription.status;
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      await subscription.save();
    }
  }

  private async handleFailedPayment(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      const subscription = await Subscription.findOne({
        stripeSubscriptionId: invoice.subscription as string
      });

      if (subscription) {
        subscription.status = SubscriptionStatus.PAST_DUE;
        await subscription.save();
        
        // Here you might want to:
        // 1. Send notification to organization admin
        // 2. Disable certain features
        // 3. Start grace period countdown
      }
    }
  }
}

export default new SubscriptionService();
