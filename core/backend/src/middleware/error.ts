import { Request, Response, NextFunction } from 'express';
import { MongoError } from 'mongodb';
import mongoose from 'mongoose';
import { ApiError, ErrorHandler } from '../utils/errors';
import { logger } from '../utils/logger';
import { Stripe } from 'stripe';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user ? req.user.id : 'anonymous'
  });

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Log error stack in development
  if (process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ApiError(404, message);
  }

  // Mongoose duplicate key
  if ((err as MongoError).code === 11000) {
    error = ErrorHandler.handleMongooseDuplicateKeyError(err as MongoError);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = ErrorHandler.handleMongooseValidationError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = ErrorHandler.handleJWTError(err);
  }

  // Stripe errors
  if (err instanceof Stripe.errors.StripeError) {
    error = ErrorHandler.handleStripeError(err);
  }

  // Rate limit exceeded
  if (err.name === 'RateLimitExceeded') {
    error = new ApiError(429, 'Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', {
      retryAfter: err.message
    });
  }

  // File upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size exceeds limit';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Invalid file type';
        break;
    }
    error = new ApiError(400, message, 'FILE_UPLOAD_ERROR');
  }

  // Handle operational errors
  if (error instanceof ApiError && error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        data: error.data
      }
    });
  }

  // Handle programming or other unknown errors
  if (process.env.NODE_ENV === 'production') {
    // Log error
    logger.error('Production Error:', error);

    // Send generic message
    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    });
  }

  // Send detailed error in development
  return res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      data: error.data,
      stack: error.stack
    }
  });
};

/**
 * Not Found Error Handler
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Not found - ${req.originalUrl}`);
  next(error);
};

/**
 * Async Error Wrapper
 */
export const asyncError = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Database Error Handler
 */
export const handleDatabaseError = (error: any) => {
  if (error instanceof mongoose.Error.ValidationError) {
    return ErrorHandler.handleMongooseValidationError(error);
  }

  if (error.code === 11000) {
    return ErrorHandler.handleMongooseDuplicateKeyError(error);
  }

  return new ApiError(500, 'Database error', 'DATABASE_ERROR');
};

/**
 * Validation Error Handler
 */
export const handleValidationError = (error: any) => {
  if (Array.isArray(error)) {
    const validationErrors = error.map(err => ({
      field: err.param,
      message: err.msg
    }));

    return new ApiError(400, 'Validation error', 'VALIDATION_ERROR', {
      errors: validationErrors
    });
  }

  return new ApiError(400, error.message, 'VALIDATION_ERROR');
};

/**
 * Authentication Error Handler
 */
export const handleAuthError = (error: any) => {
  if (error.name === 'JsonWebTokenError') {
    return new ApiError(401, 'Invalid token', 'INVALID_TOKEN');
  }

  if (error.name === 'TokenExpiredError') {
    return new ApiError(401, 'Token expired', 'TOKEN_EXPIRED');
  }

  return new ApiError(401, 'Authentication error', 'AUTH_ERROR');
};

/**
 * Permission Error Handler
 */
export const handlePermissionError = (resource: string, action: string) => {
  return new ApiError(
    403,
    `You don't have permission to ${action} this ${resource}`,
    'PERMISSION_DENIED',
    { resource, action }
  );
};

/**
 * Rate Limit Error Handler
 */
export const handleRateLimitError = (
  limit: number,
  windowMs: number,
  retryAfter: number
) => {
  return new ApiError(
    429,
    'Too many requests',
    'RATE_LIMIT_EXCEEDED',
    {
      limit,
      windowMs,
      retryAfter
    }
  );
};
