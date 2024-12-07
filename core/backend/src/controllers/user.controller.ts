// core/backend/src/controllers/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { BaseController } from './base.controller';
import { UserService } from '../services/user.service';
import { validateUser } from '../validators/user.validator';
import { cache } from '../middleware/cache';

export class UserController extends BaseController {
  constructor(private userService: UserService) {
    super();
  }

  @cache({ duration: 300 }) // 5 minutes cache
  public async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.user.id);
      return this.ok(res, user);
    } catch (error) {
      next(error);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = await validateUser(req.body);
      const user = await this.userService.update(req.user.id, validatedData);
      return this.ok(res, user);
    } catch (error) {
      next(error);
    }
  }

  public async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await this.userService.updatePassword(req.user.id, currentPassword, newPassword);
      return this.ok(res);
    } catch (error) {
      next(error);
    }
  }

  public async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const preferences = await this.userService.updatePreferences(req.user.id, req.body);
      return this.ok(res, preferences);
    } catch (error) {
      next(error);
    }
  }

  @cache({ duration: 60 }) // 1 minute cache
  public async getActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const activity = await this.userService.getActivity(
        req.user.id,
        Number(page),
        Number(limit)
      );
      return this.ok(res, activity);
    } catch (error) {
      next(error);
    }
  }

  public async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;
      await this.userService.deleteAccount(req.user.id, password);
      return this.ok(res);
    } catch (error) {
      next(error);
    }
  }

  // Admin only methods
  @cache({ duration: 60 })
  public async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search, role, status } = req.query;
      const users = await this.userService.findAll({
        page: Number(page),
        limit: Number(limit),
        search: String(search),
        role: String(role),
        status: String(status)
      });
      return this.ok(res, users);
    } catch (error) {
      next(error);
    }
  }

  public async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = await validateUser(req.body);
      const user = await this.userService.create(validatedData);
      return this.created(res, user);
    } catch (error) {
      next(error);
    }
  }

  @cache({ duration: 300 })
  public async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.params.userId);
      return this.ok(res, user);
    } catch (error) {
      next(error);
    }
  }

  public async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = await validateUser(req.body);
      const user = await this.userService.update(req.params.userId, validatedData);
      return this.ok(res, user);
    } catch (error) {
      next(error);
    }
  }

  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.delete(req.params.userId);
      return this.ok(res);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController(new UserService());
