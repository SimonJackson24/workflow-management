import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ApiError } from '../utils/errors';
import { SubscriptionPlan } from '../types/subscription.types';

/**
 * Validation Result Handler
 */
const handleValidationResult = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', 'VALIDATION_ERROR', {
      errors: errors.array()
    });
  }
  next();
};

/**
 * Subscription Validation Rules
 */
export const validateSubscription = (method: string) => {
  switch (method) {
    case 'create': {
      return [
        body('organizationId')
          .exists()
          .withMessage('Organization ID is required')
          .isMongoId()
          .withMessage('Invalid organization ID format'),
        
        body('planId')
          .exists()
          .withMessage('Plan ID is required')
          .isString()
          .withMessage('Plan ID must be a string')
          .custom((value) => {
            const validPlans = ['basic', 'professional', 'enterprise'];
            if (!validPlans.includes(value)) {
              throw new Error('Invalid plan ID');
            }
            return true;
          }),
        
        body('paymentMethodId')
          .optional()
          .isString()
          .withMessage('Payment method ID must be a string'),
        
        body('trialDays')
          .optional()
          .isInt({ min: 0, max: 30 })
          .withMessage('Trial days must be between 0 and 30'),
        
        handleValidationResult
      ];
    }
    
    case 'update': {
      return [
        param('id')
          .exists()
          .withMessage('Subscription ID is required')
          .isString()
          .withMessage('Invalid subscription ID format'),
        
        body('planId')
          .optional()
          .isString()
          .withMessage('Plan ID must be a string')
          .custom((value) => {
            const validPlans = ['basic', 'professional', 'enterprise'];
            if (!validPlans.includes(value)) {
              throw new Error('Invalid plan ID');
            }
            return true;
          }),
        
        body('cancelAtPeriodEnd')
          .optional()
          .isBoolean()
          .withMessage('cancelAtPeriodEnd must be a boolean'),
        
        handleValidationResult
      ];
    }
    
    case 'payment-method': {
      return [
        param('id')
          .exists()
          .withMessage('Subscription ID is required')
          .isString()
          .withMessage('Invalid subscription ID format'),
        
        body('paymentMethodId')
          .exists()
          .withMessage('Payment method ID is required')
          .isString()
          .withMessage('Payment method ID must be a string'),
        
        handleValidationResult
      ];
    }
    
    case 'get-invoices': {
      return [
        param('id')
          .exists()
          .withMessage('Subscription ID is required')
          .isString()
          .withMessage('Invalid subscription ID format'),
        
        query('limit')
          .optional()
          .isInt({ min: 1, max: 100 })
          .withMessage('Limit must be between 1 and 100'),
        
        query('starting_after')
          .optional()
          .isString()
          .withMessage('starting_after must be a string'),
        
        handleValidationResult
      ];
    }
  }
};

/**
 * Organization Validation Rules
 */
export const validateOrganization = (method: string) => {
  switch (method) {
    case 'create': {
      return [
        body('name')
          .exists()
          .withMessage('Organization name is required')
          .isString()
          .withMessage('Organization name must be a string')
          .trim()
          .isLength({ min: 2, max: 100 })
          .withMessage('Organization name must be between 2 and 100 characters'),
        
        body('email')
          .exists()
          .withMessage('Email is required')
          .isEmail()
          .withMessage('Invalid email format')
          .normalizeEmail(),
        
        body('phone')
          .optional()
          .isMobilePhone('any')
          .withMessage('Invalid phone number format'),
        
        body('address')
          .optional()
          .isObject()
          .withMessage('Address must be an object'),
        
        body('address.country')
          .optional()
          .isISO31661Alpha2()
          .withMessage('Invalid country code'),
        
        handleValidationResult
      ];
    }
    
    case 'update': {
      return [
        param('id')
          .exists()
          .withMessage('Organization ID is required')
          .isMongoId()
          .withMessage('Invalid organization ID format'),
        
        body('name')
          .optional()
          .isString()
          .trim()
          .isLength({ min: 2, max: 100 })
          .withMessage('Organization name must be between 2 and 100 characters'),
        
        body('settings')
          .optional()
          .isObject()
          .withMessage('Settings must be an object'),
        
        handleValidationResult
      ];
    }
  }
};

/**
 * Custom Validation Rules
 */
export const customValidationRules = {
  isValidPlan: (value: string) => {
    return Object.values(SubscriptionPlan).includes(value as SubscriptionPlan);
  },
  
  isValidDateRange: (start: Date, end: Date) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate < endDate;
  },
  
  isValidCurrency: (value: string) => {
    const validCurrencies = ['USD', 'EUR', 'GBP'];
    return validCurrencies.includes(value.toUpperCase());
  },
  
  isValidInterval: (value: string) => {
    const validIntervals = ['month', 'year'];
    return validIntervals.includes(value.toLowerCase());
  }
};

/**
 * Validation Error Messages
 */
export const ValidationMessages = {
  required: (field: string) => `${field} is required`,
  invalid: (field: string) => `Invalid ${field}`,
  length: (field: string, min: number, max: number) => 
    `${field} must be between ${min} and ${max} characters`,
  min: (field: string, min: number) => `${field} must be at least ${min}`,
  max: (field: string, max: number) => `${field} must be at most ${max}`,
  unique: (field: string) => `${field} already exists`,
  enum: (field: string, values: string[]) => 
    `${field} must be one of: ${values.join(', ')}`,
  date: (field: string) => `${field} must be a valid date`,
  future: (field: string) => `${field} must be in the future`,
  past: (field: string) => `${field} must be in the past`
};
