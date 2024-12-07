// core/backend/src/services/InvoiceGenerator.ts

import {
  Invoice,
  InvoiceItem,
  InvoiceTemplate,
  InvoiceMetadata
} from '../types/billing.types';
import { UsageCalculator } from './UsageCalculator';
import { StripeIntegration } from '../integrations/StripeIntegration';

export class InvoiceGenerator {
  private usageCalculator: UsageCalculator;
  private stripeIntegration: StripeIntegration;

  constructor(
    usageCalculator: UsageCalculator,
    stripeIntegration: StripeIntegration
  ) {
    this.usageCalculator = usageCalculator;
    this.stripeIntegration = stripeIntegration;
  }

  async generateInvoice(
    subscriptionId: string,
    period: BillingPeriod
  ): Promise<Invoice> {
    try {
      // Get subscription details
      const subscription = await this.getSubscription(subscriptionId);
      
      // Calculate usage charges
      const usageCharges = await this.usageCalculator.calculateUsage(
        subscriptionId,
        period
      );

      // Generate invoice items
      const items = await this.generateInvoiceItems(subscription, usageCharges);

      // Calculate totals
      const totals = this.calculateTotals(items);

      // Create Stripe invoice
      const stripeInvoice = await this.createStripeInvoice(
        subscription,
        items,
        totals
      );

      // Create local invoice record
      const invoice = await this.createLocalInvoice(
        subscription,
        items,
        totals,
        stripeInvoice.id
      );

      // Generate PDF
      await this.generateInvoicePDF(invoice);

      return invoice;
    } catch (error) {
      throw new Error(`Failed to generate invoice: ${error.message}`);
    }
  }

  private async generateInvoiceItems(
    subscription: any,
    usageCharges: any[]
  ): Promise<InvoiceItem[]> {
    const items: InvoiceItem[] = [];

    // Add subscription base charge
    items.push({
      type: 'subscription',
      description: `${subscription.plan.name} Plan`,
      amount: subscription.plan.price,
      metadata: { planId: subscription.plan.id }
    });

    // Add usage charges
    for (const charge of usageCharges) {
      items.push({
        type: 'usage',
        description: `${charge.metric.name} Usage`,
        amount: charge.amount,
        metadata: {
          metricId: charge.metric.id,
          usage: charge.usage,
          details: charge.details
        }
      });
    }

    // Add any one-time charges
    const oneTimeCharges = await this.getOneTimeCharges(subscription.id);
    items.push(...oneTimeCharges);

    return items;
  }

  private calculateTotals(items: InvoiceItem[]): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = this.calculateTax(subtotal);

    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  }

  private async createStripeInvoice(
    subscription: any,
    items: InvoiceItem[],
    totals: any
  ): Promise<any> {
    return await this.stripeIntegration.createInvoice({
      customerId: subscription.customer.stripeCustomerId,
      items: items.map(item => ({
        amount: item.amount,
        currency: 'usd',
        description: item.description
      })),
      metadata: {
        subscriptionId: subscription.id,
        period: `${subscription.currentPeriodStart}-${subscription.currentPeriodEnd}`
      }
    });
  }

  private async createLocalInvoice(
    subscription: any,
    items: InvoiceItem[],
    totals: any,
    stripeInvoiceId: string
  ): Promise<Invoice> {
    return await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        stripeInvoiceId,
        items,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        status: 'draft',
        dueDate: this.calculateDueDate(),
        metadata: this.generateInvoiceMetadata(subscription)
      }
    });
  }

  private async generateInvoicePDF(invoice: Invoice): Promise<void> {
    const template = await this.getInvoiceTemplate(invoice);
    const pdf = await this.renderInvoicePDF(invoice, template);
    await this.storeInvoicePDF(invoice.id, pdf);
  }

  private calculateTax(amount: number): number {
    // Implement tax calculation logic
    return 0;
  }

  private calculateDueDate(): Date {
    // Implement due date calculation logic
    return new Date();
  }

  private generateInvoiceMetadata(subscription: any): InvoiceMetadata {
    return {
      customerName: subscription.customer.name,
      customerEmail: subscription.customer.email,
      planName: subscription.plan.name,
      billingPeriod: `${subscription.currentPeriodStart}-${subscription.currentPeriodEnd}`
    };
  }
}
