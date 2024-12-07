// core/backend/src/services/billing.service.ts

import Stripe from 'stripe';
import { Organization } from '../models/organization.model';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { config } from '../config';

export class BillingService {
  private stripe: Stripe;
  
  constructor(private auditService: AuditService) {
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2023-10-16'
    });
  }

  async getInvoices(organizationId: string, page: number, limit: number) {
    const organization = await this.getOrganizationWithStripeCustomer(organizationId);

    const invoices = await this.stripe.invoices.list({
      customer: organization.subscription.stripeCustomerId,
      limit,
      starting_after: ((page - 1) * limit).toString()
    });

    return {
      data: invoices.data,
      hasMore: invoices.has_more,
      total: invoices.data.length
    };
  }

  async getInvoice(organizationId: string, invoiceId: string) {
    const organization = await this.getOrganizationWithStripeCustomer(organizationId);

    const invoice = await this.stripe.invoices.retrieve(invoiceId);
    if (invoice.customer !== organization.subscription.stripeCustomerId) {
      throw new ApiError(403, 'Invoice does not belong to this organization');
    }

    return invoice;
  }

  async updateBillingInfo(organizationId: string, billingInfo: any) {
    const organization = await this.getOrganizationWithStripeCustomer(organizationId);

    // Update Stripe customer
    await this.stripe.customers.update(organization.subscription.stripeCustomerId, {
      name: billingInfo.name,
      email: billingInfo.email,
      address: billingInfo.address,
      tax_id: billingInfo.vatId
    });

    // Update organization billing info
    organization.billing = {
      ...organization.billing,
      ...billingInfo
    };
    await organization.save();

    // Audit log
    await this.auditService.log({
      action: 'billing.info_updated',
      resourceId: organizationId,
      resourceType: 'organization',
      metadata: {
        updatedFields: Object.keys(billingInfo)
      }
    });

    return organization.billing;
  }

  async addPaymentMethod(organizationId: string, paymentMethodId: string) {
    const organization = await this.getOrganizationWithStripeCustomer(organizationId);

    // Attach payment method to customer
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: organization.subscription.stripeCustomerId
    });

    // Set as default payment method
    await this.stripe.customers.update(organization.subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    // Get payment method details
    const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);

    // Update organization payment method info
    organization.billing.paymentMethod = {
      type: paymentMethod.type,
      last4: paymentMethod.card?.last4,
      expiryMonth: paymentMethod.card?.exp_month,
      expiryYear: paymentMethod.card?.exp_year,
      brand: paymentMethod.card?.brand
    };
    await organization.save();

    // Audit log
    await this.auditService.log({
      action: 'billing.payment_method_added',
      resourceId: organizationId,
      resourceType: 'organization',
      metadata: {
        paymentMethodId,
        type: paymentMethod.type
      }
    });

    return organization.billing.paymentMethod;
  }

  async removePaymentMethod(organizationId: string, paymentMethodId: string) {
    const organization = await this.getOrganizationWithStripeCustomer(organizationId);

    // Detach payment method
    await this.stripe.paymentMethods.detach(paymentMethodId);

    // Clear organization payment method info if it was the default
    if (organization.billing.paymentMethod?.last4) {
      organization.billing.paymentMethod = undefined;
      await organization.save();
    }

    // Audit log
    await this.auditService.log({
      action: 'billing.payment_method_removed',
      resourceId: organizationId,
      resourceType: 'organization',
      metadata: {
        paymentMethodId
      }
    });
  }

  async getUsage(organizationId: string) {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new ApiError(404, 'Organization not found');
    }

    return {
      current: organization.usage,
      limits: organization.subscription.limits
    };
  }

  async previewInvoice(organizationId: string, planId: string) {
    const organization = await this.getOrganizationWithStripeCustomer(organizationId);

    // Get plan price ID
    const priceId = await this.getPriceIdForPlan(planId);

    // Create invoice preview
    const preview = await this.stripe.invoices.retrieveUpcoming({
      customer: organization.subscription.stripeCustomerId,
      subscription_items: [{
        price: priceId
      }]
    });

    return preview;
  }

  async createCustomerPortalSession(organizationId: string, returnUrl: string) {
    const organization = await this.getOrganizationWithStripeCustomer(organizationId);

    const session = await this.stripe.billingPortal.sessions.create({
      customer: organization.subscription.stripeCustomerId,
      return_url: returnUrl
    });

    return session;
  }

  private async getOrganizationWithStripeCustomer(organizationId: string) {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new ApiError(404, 'Organization not found');
    }

    if (!organization.subscription.stripeCustomerId) {
      throw new ApiError(400, 'Organization has no associated Stripe customer');
    }

    return organization;
  }

  private async getPriceIdForPlan(planId: string): Promise<string> {
    // Implement plan to price ID mapping
    const planPriceMap: Record<string, string> = {
      'basic': 'price_basic_monthly',
      'pro': 'price_pro_monthly',
      'enterprise': 'price_enterprise_monthly'
    };

    const priceId = planPriceMap[planId];
    if (!priceId) {
      throw new ApiError(400, 'Invalid plan ID');
    }

    return priceId;
  }
}
