// core/backend/src/controllers/organization.controller.ts

import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { Organization } from '../models/organization.model';
import { OrganizationService } from '../services/organization.service';
import { validateOrganization } from '../validators/organization.validator';

export class OrganizationController extends BaseController {
  constructor(private organizationService: OrganizationService) {
    super();
  }

  public async createOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = await validateOrganization(req.body);
      const organization = await this.organizationService.create(validatedData);
      return this.created(res, organization);
    } catch (error) {
      next(error);
    }
  }

  public async getOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const organization = await this.organizationService.findById(req.params.orgId);
      if (!organization) {
        throw this.notFound('Organization not found');
      }
      return this.ok(res, organization);
    } catch (error) {
      next(error);
    }
  }

  public async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = await validateOrganization(req.body);
      const organization = await this.organizationService.update(
        req.params.orgId,
        validatedData
      );
      return this.ok(res, organization);
    } catch (error) {
      next(error);
    }
  }

  public async deleteOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      await this.organizationService.delete(req.params.orgId);
      return this.ok(res);
    } catch (error) {
      next(error);
    }
  }

  public async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await this.organizationService.getMembers(req.params.orgId);
      return this.ok(res, members);
    } catch (error) {
      next(error);
    }
  }

  public async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await this.organizationService.inviteMember(
        req.params.orgId,
        req.body
      );
      return this.created(res, member);
    } catch (error) {
      next(error);
    }
  }

  public async updateMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await this.organizationService.updateMember(
        req.params.orgId,
        req.params.memberId,
        req.body
      );
      return this.ok(res, member);
    } catch (error) {
      next(error);
    }
  }

  public async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      await this.organizationService.removeMember(
        req.params.orgId,
        req.params.memberId
      );
      return this.ok(res);
    } catch (error) {
      next(error);
    }
  }

  public async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await this.organizationService.getSettings(req.params.orgId);
      return this.ok(res, settings);
    } catch (error) {
      next(error);
    }
  }

  public async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await this.organizationService.updateSettings(
        req.params.orgId,
        req.body
      );
      return this.ok(res, settings);
    } catch (error) {
      next(error);
    }
  }

  public async getBillingInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const billingInfo = await this.organizationService.getBillingInfo(req.params.orgId);
      return this.ok(res, billingInfo);
    } catch (error) {
      next(error);
    }
  }

  public async updateBillingInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const billingInfo = await this.organizationService.updateBillingInfo(
        req.params.orgId,
        req.body
      );
      return this.ok(res, billingInfo);
    } catch (error) {
      next(error);
    }
  }
}

export const organizationController = new OrganizationController(
  new OrganizationService()
);
