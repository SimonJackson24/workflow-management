// core/backend/src/controllers/base.controller.ts

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

export class BaseController {
  protected async executeImpl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.execute(req, res, next);
    } catch (error) {
      logger.error('Controller Error:', error);
      next(error);
    }
  }

  protected abstract execute(req: Request, res: Response, next: NextFunction): Promise<void>;

  protected ok<T>(res: Response, dto?: T) {
    if (dto) {
      return res.status(200).json(dto);
    }
    return res.sendStatus(200);
  }

  protected created<T>(res: Response, dto?: T) {
    if (dto) {
      return res.status(201).json(dto);
    }
    return res.sendStatus(201);
  }

  protected clientError(message?: string) {
    return new ApiError(400, message || 'Bad request');
  }

  protected unauthorized(message?: string) {
    return new ApiError(401, message || 'Unauthorized');
  }

  protected forbidden(message?: string) {
    return new ApiError(403, message || 'Forbidden');
  }

  protected notFound(message?: string) {
    return new ApiError(404, message || 'Not found');
  }

  protected fail(error: Error | string) {
    logger.error(error);
    return new ApiError(500, 'Internal server error');
  }
}
