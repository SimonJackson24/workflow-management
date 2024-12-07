/**
 * Custom API Error Class
 * Extends the built-in Error class with additional properties
 */
export class ApiError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: string;
  data?: any;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    data?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Subscription Error Types
 */
export const SubscriptionErrors = {
  PAYMENT_FAILED: 'payment_failed',
  INVALID_PLAN: 'invalid_plan',
  PLAN_NOT_FOUND: 'plan_not_found',
  SUBSCRIPTION_NOT_FOUND: 'subscription_not_found',
  SUBSCRIPTION_ALREADY_EXISTS: 'subscription_already_exists',
  INVALID_PAYMENT_METHOD: 'invalid_payment_method',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  CARD_DECLINED: 'card_declined',
  EXPIRED_CARD: 'expired_card',
  INVALID_CARD: 'invalid_card',
  PROCESSING_ERROR: 'processing_error',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_REQUEST: 'invalid_request',
  INTERNAL_ERROR: 'internal_error'
} as const;

/**
 * Authentication Error Types
 */
export const AuthErrors = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  TOKEN_EXPIRED: 'token_expired',
  TOKEN_INVALID: 'token_invalid',
  TOKEN_REQUIRED: 'token_required',
  USER_NOT_FOUND: 'user_not_found',
  USER_INACTIVE: 'user_inactive',
  PERMISSION_DENIED: 'permission_denied',
  ROLE_REQUIRED: 'role_required',
  MFA_REQUIRED: 'mfa_required',
  MFA_INVALID: 'mfa_invalid'
} as const;

/**
 * Validation Error Types
 */
export const ValidationErrors = {
  REQUIRED_FIELD: 'required_field',
  INVALID_FORMAT: 'invalid_format',
  INVALID_LENGTH: 'invalid_length',
  INVALID_VALUE: 'invalid_value',
  DUPLICATE_ENTRY: 'duplicate_entry',
  REFERENCE_ERROR: 'reference_error'
} as const;

/**
 * Error Handler Class
 * Centralizes error handling logic
 */
export class ErrorHandler {
  /**
   * Handle Operational Errors
   */
  public static handleOperationalError(error: ApiError) {
    return {
      status: error.status,
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
      data: error.data
    };
  }

  /**
   * Handle Mongoose Validation Errors
   */
  public static handleMongooseValidationError(error: any) {
    const errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
      code: ValidationErrors.INVALID_VALUE
    }));

    return new ApiError(400, 'Validation Error', ValidationErrors.INVALID_VALUE, errors);
  }

  /**
   * Handle Mongoose Duplicate Key Errors
   */
  public static handleMongooseDuplicateKeyError(error: any) {
    const field = Object.keys(error.keyValue)[0];
    const message = `Duplicate value entered for ${field} field`;
    
    return new ApiError(400, message, ValidationErrors.DUPLICATE_ENTRY, {
      field,
      value: error.keyValue[field]
    });
  }

  /**
   * Handle Stripe Errors
   */
  public static handleStripeError(error: any) {
    let message = 'Payment processing error';
    let code = SubscriptionErrors.PROCESSING_ERROR;
    let statusCode = 400;

    switch (error.type) {
      case 'StripeCardError':
        message = error.message;
        code = SubscriptionErrors.CARD_DECLINED;
        break;
      case 'StripeRateLimitError':
        message = 'Too many requests to payment processor';
        code = SubscriptionErrors.RATE_LIMIT_EXCEEDED;
        statusCode = 429;
        break;
      case 'StripeInvalidRequestError':
        message = error.message;
        code = SubscriptionErrors.INVALID_REQUEST;
        break;
      case 'StripeAPIError':
        message = 'Payment processor error';
        code = SubscriptionErrors.INTERNAL_ERROR;
        statusCode = 500;
        break;
      case 'StripeConnectionError':
        message = 'Failed to connect to payment processor';
        code = SubscriptionErrors.INTERNAL_ERROR;
        statusCode = 503;
        break;
      default:
        message = error.message;
        code = SubscriptionErrors.PROCESSING_ERROR;
        statusCode = 500;
    }

    return new ApiError(statusCode, message, code, {
      type: error.type,
      code: error.code
    });
  }

  /**
   * Handle JWT Errors
   */
  public static handleJWTError(error: any) {
    let message = 'Authentication error';
    let code = AuthErrors.TOKEN_INVALID;

    switch (error.name) {
      case 'JsonWebTokenError':
        message = 'Invalid token';
        code = AuthErrors.TOKEN_INVALID;
        break;
      case 'TokenExpiredError':
        message = 'Token expired';
        code = AuthErrors.TOKEN_EXPIRED;
        break;
      default:
        message = error.message;
    }

    return new ApiError(401, message, code);
  }

  /**
   * Create Validation Error
   */
  public static createValidationError(field: string, message: string) {
    return new ApiError(400, message, ValidationErrors.INVALID_VALUE, { field });
  }

  /**
   * Create Permission Error
   */
  public static createPermissionError(resource: string, action: string) {
    return new ApiError(
      403,
      `You don't have permission to ${action} this ${resource}`,
      AuthErrors.PERMISSION_DENIED,
      { resource, action }
    );
  }

  /**
   * Create Rate Limit Error
   */
  public static createRateLimitError(limit: number, windowMs: number) {
    return new ApiError(
      429,
      `Too many requests. Limit is ${limit} requests per ${windowMs/1000} seconds`,
      SubscriptionErrors.RATE_LIMIT_EXCEEDED,
      { limit, windowMs }
    );
  }
}

/**
 * Global Error Response Interface
 */
export interface ErrorResponse {
  status: string;
  statusCode: number;
  message: string;
  code?: string;
  data?: any;
  stack?: string;
}
