// core/backend/src/services/PaymentService.ts

import Stripe from 'stripe';
import { prisma } from '../prisma';
import { 
  PaymentMethod, 
  PaymentStatus, 
  Transaction,
  RefundReason 
} from '../types/billing.types';
import { config } from '../config';

export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2023-10-16'
    });
  }

  async createPaymentMethod(userId: string, paymentDetails: any): Promise<PaymentMethod> {
    try {
      // Create payment method in Stripe
      const stripePaymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: paymentDetails.card
      });

      // Save payment method in database
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          userId,
          stripePaymentMethodId: stripePaymentMethod.id,
          type: paymentDetails.type,
          last4: paymentDetails.card.last4,
          expiryMonth: paymentDetails.card.exp_month,
          expiryYear: paymentDetails.card.exp_year,
          isDefault: paymentDetails.isDefault
        }
      });

      return paymentMethod;
    } catch (error) {
      console.error('Payment method creation failed:', error);
      throw new Error('Failed to create payment method');
    }
  }

  async processSubscriptionPayment(subscriptionId: string): Promise<Transaction> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: true,
        plan: true,
        paymentMethod: true
      }
    });

    if (!subscription) throw new Error('Subscription not found');

    try {
      // Create payment intent in Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: subscription.plan.price * 100, // Convert to cents
        currency: 'usd',
        customer: subscription.user.stripeCustomerId,
        payment_method: subscription.paymentMethod.stripePaymentMethodId,
        confirm: true,
        off_session: true
      });

      // Record transaction
      const transaction = await prisma.transaction.create({
        data: {
          subscriptionId,
          userId: subscription.userId,
          amount: subscription.plan.price,
          status: this.mapStripeStatus(paymentIntent.status),
          stripePaymentIntentId: paymentIntent.id,
          type: 'subscription_charge'
        }
      });

      return transaction;
    } catch (error) {
      await this.handleFailedPayment(subscriptionId, error);
      throw error;
    }
  }

  async processRefund(
    transactionId: string, 
    amount: number, 
    reason: RefundReason
  ): Promise<Transaction> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) throw new Error('Transaction not found');

    try {
      // Process refund in Stripe
      const refund = await this.stripe.refunds.create({
        payment_intent: transaction.stripePaymentIntentId,
        amount: amount * 100 // Convert to cents
      });

      // Record refund transaction
      const refundTransaction = await prisma.transaction.create({
        data: {
          userId: transaction.userId,
          amount: amount * -1, // Negative amount for refunds
          status: 'completed',
          stripeRefundId: refund.id,
          type: 'refund',
          relatedTransactionId: transactionId,
          reason
        }
      });

      return refundTransaction;
    } catch (error) {
      console.error('Refund processing failed:', error);
      throw new Error('Failed to process refund');
    }
  }

  async updatePaymentMethod(paymentMethodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId }
    });

    if (!paymentMethod) throw new Error('Payment method not found');

    try {
      // Update in Stripe if necessary
      if (updates.card) {
        await this.stripe.paymentMethods.update(
          paymentMethod.stripePaymentMethodId,
          { card: updates.card }
        );
      }

      // Update in database
      return await prisma.paymentMethod.update({
        where: { id: paymentMethodId },
        data: updates
      });
    } catch (error) {
      console.error('Payment method update failed:', error);
      throw new Error('Failed to update payment method');
    }
  }

  async handleFailedPayment(subscriptionId: string, error: any): Promise<void> {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'past_due',
        failedPayments: {
          increment: 1
        }
      }
    });

    // Send notification
    // Implement retry logic
  }

  private mapStripeStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'succeeded': 'completed',
      'processing': 'pending',
      'requires_payment_method': 'failed',
      'requires_action': 'pending',
      'canceled': 'failed'
    };

    return statusMap[stripeStatus] || 'failed';
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return await prisma.paymentMethod.findMany({
      where: { userId }
    });
  }

  async getTransactionHistory(userId: string): Promise<Transaction[]> {
    return await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
