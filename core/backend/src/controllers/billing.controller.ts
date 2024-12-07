// core/backend/src/controllers/billing.controller.ts

import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { BillingService } from '../services/billing.service';
import { validateBilling } from '../validators/billing.validator';
import { cache } from '../middleware/cache';

export class BillingController extends BaseController {
  constructor(private billingService: BillingService) {
    super();
  }

  public async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const invoices = await this.billingService.getInvoices(
        req.organization.id,
        Number(page),
        Number(limit)
      );
      return this.ok(res, invoices);
    } catch (error) {
      next(error);
    }
  }

  public async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await this.billingService.getInvoice(
        req.organization.id,
        req.params.invoiceId
      );
      return this.ok(res, invoice);
    } catch (error) {
      next(error);
    }
  }

  public async updateBillingInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = await validateBilling(req.body);
      const billingInfo = await this.billingService.updateBillingInfo(
        req.organization.id,
        validatedData
      );
      return this.ok(res, billingInfo);
    } catch (error) {
      next(error);
    }
  }

  public async addPaymentMethod(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentMethodId } = req.body;
      const paymentMethod = await this.billingService.addPaymentMethod(
        req.organization.id,
        paymentMethodId
      );
      return this.ok(res, paymentMethod);
    } catch (error) {
      next(error);
    }
  }

  public async removePaymentMethod(req: Request, res: Response, next: NextFunction) {
    try {
      await this.billingService.removePaymentMethod(
        req.organization.id,
        req.params.paymentMethodId
      );
      return this.ok(res);
    } catch (error) {
      next(error);
    }
  }

  public async getUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const usage = await this.billingService.getUsage(req.organization.id);
      return this.ok(res, usage);
    } catch (error) {
      next(error);
    }
  }

  public async previewInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { planId } = req.query;
      const preview = await this.billingService.previewInvoice(
        req.organization.id,
        String(planId)
      );
      return this.ok(res, preview);
    } catch (error) {
      next(error);
    }
  }

  public async createCustomerPortalSession(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await this.billingService.createCustomerPortalSession(
        req.organization.id,
        req.body.returnUrl
      );
      return this.ok(res, session);
    } catch (error) {
      next(error);
    }
  }
}

export const billingController = new BillingController(new BillingService());
