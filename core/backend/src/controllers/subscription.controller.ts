import { Request, Response } from 'express';
import SubscriptionService from '../services/subscription.service';
import Organization from '../models/organization.model';
import { 
  CreateSubscriptionInput, 
  UpdateSubscriptionInput,
  SubscriptionErrorType 
} from '../types/subscription.types';
import { validateSubscriptionInput } from '../utils/validators';
import { ApiError } from '../utils/errors';
import { asyncHandler } from '../middleware/async';

class SubscriptionController {
  /**
   * Create a new subscription
   * @route POST /api/subscriptions
   * @access Private
   */
  createSubscription = asyncHandler(async (req: Request, res: Response) => {
    const input: CreateSubscriptionInput = req.body;
    
    // Validate input
    const validationError = validateSubscriptionInput(input);
    if (validationError) {
      throw new ApiError(400, validationError);
    }

    // Check organization exists and user has permission
    const organization = await Organization.findById(input.organizationId);
    if (!organization) {
      throw new ApiError(404, 'Organization not found', SubscriptionErrorType.SUBSCRIPTION_NOT_FOUND);
    }

    // Check if user has permission to manage subscriptions
    if (!req.user.canManageSubscriptions(organization.id)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    // Create subscription
    const result = await SubscriptionService.createSubscription(
      input.organizationId,
      input.planId,
      input.paymentMethodId
    );

    res.status(201).json({
      success: true,
      data: result
    });
  });

  /**
   * Update subscription
   * @route PUT /api/subscriptions/:id
   * @access Private
   */
  updateSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input: UpdateSubscriptionInput = req.body;

    const organization = await Organization.findOne({ 'subscription.stripeSubscriptionId': id });
    if (!organization) {
      throw new ApiError(404, 'Subscription not found', SubscriptionErrorType.SUBSCRIPTION_NOT_FOUND);
    }

    // Check permissions
    if (!req.user.canManageSubscriptions(organization.id)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    const result = await SubscriptionService.updateSubscription(
      organization.id,
      input.planId!
    );

    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Cancel subscription
   * @route DELETE /api/subscriptions/:id
   * @access Private
   */
  cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const organization = await Organization.findOne({ 'subscription.stripeSubscriptionId': id });
    if (!organization) {
      throw new ApiError(404, 'Subscription not found', SubscriptionErrorType.SUBSCRIPTION_NOT_FOUND);
    }

    // Check permissions
    if (!req.user.canManageSubscriptions(organization.id)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    const result = await SubscriptionService.cancelSubscription(organization.id);

    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Get subscription details
   * @route GET /api/subscriptions/:id
   * @access Private
   */
  getSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const organization = await Organization.findOne({ 'subscription.stripeSubscriptionId': id })
      .select('subscription billing usage');
      
    if (!organization) {
      throw new ApiError(404, 'Subscription not found', SubscriptionErrorType.SUBSCRIPTION_NOT_FOUND);
    }

    // Check permissions
    if (!req.user.canViewSubscription(organization.id)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    res.json({
      success: true,
      data: {
        subscription: organization.subscription,
        billing: organization.billing,
        usage: organization.usage
      }
    });
  });

  /**
   * Get subscription invoices
   * @route GET /api/subscriptions/:id/invoices
   * @access Private
   */
  getInvoices = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { limit = 10, starting_after } = req.query;

    const organization = await Organization.findOne({ 'subscription.stripeSubscriptionId': id });
    if (!organization) {
      throw new ApiError(404, 'Subscription not found', SubscriptionErrorType.SUBSCRIPTION_NOT_FOUND);
    }

    // Check permissions
    if (!req.user.canViewBilling(organization.id)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    const invoices = await SubscriptionService.getInvoices(
      organization.subscription.stripeCustomerId!,
      Number(limit),
      starting_after as string
    );

    res.json({
      success: true,
      data: invoices
    });
  });

  /**
   * Update payment method
   * @route PUT /api/subscriptions/:id/payment-method
   * @access Private
   */
  updatePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { paymentMethodId } = req.body;

    const organization = await Organization.findOne({ 'subscription.stripeSubscriptionId': id });
    if (!organization) {
      throw new ApiError(404, 'Subscription not found', SubscriptionErrorType.SUBSCRIPTION_NOT_FOUND);
    }

    // Check permissions
    if (!req.user.canManageBilling(organization.id)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    const result = await SubscriptionService.updatePaymentMethod(
      organization.subscription.stripeCustomerId!,
      paymentMethodId
    );

    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Handle Stripe webhook
   * @route POST /api/subscriptions/webhook
   * @access Public
   */
  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      throw new ApiError(400, 'Missing stripe signature');
    }

    await SubscriptionService.handleWebhook(req.body, sig);

    res.json({ received: true });
  });
}

export default new SubscriptionController();
