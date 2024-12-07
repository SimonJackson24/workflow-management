// core/backend/src/integrations/StripeIntegration.ts

import Stripe from 'stripe';
import { 
  StripeConfig, 
  StripeCustomer, 
  StripeSubscription,
  StripeProduct,
  StripePrice 
} from '../types/billing.types';

export class StripeIntegration {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2023-10-16'
    });
    this.webhookSecret = config.webhookSecret;
  }

  // Customer Management
  async createCustomer(data: {
    email: string;
    name: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCustomer> {
    try {
      return await this.stripe.customers.create({
        email: data.email,
        name: data.name,
        metadata: data.metadata
      });
    } catch (error) {
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  // Subscription Management
  async createSubscription(data: {
    customerId: string;
    priceId: string;
    paymentMethodId: string;
    metadata?: Record<string, string>;
  }): Promise<StripeSubscription> {
    try {
      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(data.paymentMethodId, {
        customer: data.customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(data.customerId, {
        invoice_settings: {
          default_payment_method: data.paymentMethodId,
        },
      });

      // Create subscription
      return await this.stripe.subscriptions.create({
        customer: data.customerId,
        items: [{ price: data.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: data.metadata
      });
    } catch (error) {
      throw new Error(`Failed to create Stripe subscription: ${error.message}`);
    }
  }

  // Product Management
  async createProduct(data: {
    name: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<StripeProduct> {
    try {
      return await this.stripe.products.create({
        name: data.name,
        description: data.description,
        metadata: data.metadata
      });
    } catch (error) {
      throw new Error(`Failed to create Stripe product: ${error.message}`);
    }
  }

  // Price Management
  async createPrice(data: {
    productId: string;
    unitAmount: number;
    currency: string;
    recurring?: {
      interval: 'month' | 'year';
      interval_count?: number;
    };
    metadata?: Record<string, string>;
  }): Promise<StripePrice> {
    try {
      return await this.stripe.prices.create({
        product: data.productId,
        unit_amount: data.unitAmount,
        currency: data.currency,
        recurring: data.recurring,
        metadata: data.metadata
      });
    } catch (error) {
      throw new Error(`Failed to create Stripe price: ${error.message}`);
    }
  }

  // Payment Method Management
  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      throw new Error(`Failed to attach payment method: ${error.message}`);
    }
  }

  // Invoice Management
  async createInvoice(data: {
    customerId: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Invoice> {
    try {
      return await this.stripe.invoices.create({
        customer: data.customerId,
        description: data.description,
        metadata: data.metadata,
        auto_advance: true
      });
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  // Usage Record Management
  async createUsageRecord(data: {
    subscriptionItemId: string;
    quantity: number;
    timestamp?: number;
    action?: 'increment' | 'set';
  }): Promise<Stripe.UsageRecord> {
    try {
      return await this.stripe.subscriptionItems.createUsageRecord(
        data.subscriptionItemId,
        {
          quantity: data.quantity,
          timestamp: data.timestamp,
          action: data.action
        }
      );
    } catch (error) {
      throw new Error(`Failed to create usage record: ${error.message}`);
    }
  }

  // Webhook Handling
  async handleWebhook(
    body: string | Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.webhookSecret
      );
    } catch (error) {
      throw new Error(`Webhook error: ${error.message}`);
    }
  }

  // Error Handling
  private handleStripeError(error: Stripe.StripeError): never {
    let message: string;

    switch (error.type) {
      case 'StripeCardError':
        message = `Card error: ${error.message}`;
        break;
      case 'StripeRateLimitError':
        message = 'Rate limit exceeded, please try again later';
        break;
      case 'StripeInvalidRequestError':
        message = `Invalid parameters: ${error.message}`;
        break;
      case 'StripeAPIError':
        message = 'Internal Stripe API error';
        break;
      case 'StripeConnectionError':
        message = 'Failed to connect to Stripe';
        break;
      case 'StripeAuthenticationError':
        message = 'Authentication with Stripe failed';
        break;
      default:
        message = 'An unknown error occurred';
    }

    throw new Error(message);
  }
}
