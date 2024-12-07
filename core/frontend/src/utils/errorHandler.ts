// core/frontend/src/utils/errorHandler.ts

import { AxiosError } from 'axios';
import { logger } from './logger';

interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  static handle(error: any): ErrorResponse {
    if (error instanceof AxiosError) {
      return this.handleApiError(error);
    }
    return this.handleGenericError(error);
  }

  private static handleApiError(error: AxiosError): ErrorResponse {
    logger.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    const response = error.response?.data as any;

    return {
      message: response?.message || 'An unexpected error occurred',
      code: response?.code || 'UNKNOWN_ERROR',
      details: response?.details,
    };
  }

  private static handleGenericError(error: any): ErrorResponse {
    logger.error('Generic Error:', error);

    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  static isNetworkError(error: any): boolean {
    return error instanceof AxiosError && !error.response;
  }

  static isAuthError(error: any): boolean {
    return error instanceof AxiosError && error.response?.status === 401;
  }

  static isForbiddenError(error: any): boolean {
    return error instanceof AxiosError && error.response?.status === 403;
  }

  static isValidationError(error: any): boolean {
    return error instanceof AxiosError && 
           error.response?.status === 400 && 
           error.response?.data?.code === 'VALIDATION_ERROR';
  }
}
