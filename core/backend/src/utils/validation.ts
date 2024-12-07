import { Request } from 'express';
import { Schema, ValidationError } from 'joi';
import { ApiError } from './errors';
import { logger } from './logger';

interface ValidationOptions {
  abortEarly?: boolean;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
}

interface ValidationRule {
  schema: Schema;
  options?: ValidationOptions;
}

interface ValidationRules {
  body?: ValidationRule;
  query?: ValidationRule;
  params?: ValidationRule;
}

/**
 * Validation Helper Class
 */
class ValidationHelper {
  /**
   * Validate request data against schema
   */
  static async validate(
    req: Request,
    rules: ValidationRules,
    options: ValidationOptions = {}
  ): Promise<void> {
    const defaultOptions: ValidationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
      ...options
    };

    try {
      // Validate request body
      if (rules.body) {
        const { error, value } = rules.body.schema.validate(
          req.body,
          rules.body.options || defaultOptions
        );
        if (error) {
          throw this.formatValidationError(error, 'body');
        }
        req.body = value;
      }

      // Validate query parameters
      if (rules.query) {
        const { error, value } = rules.query.schema.validate(
          req.query,
          rules.query.options || defaultOptions
        );
        if (error) {
          throw this.formatValidationError(error, 'query');
        }
        req.query = value;
      }

      // Validate route parameters
      if (rules.params) {
        const { error, value } = rules.params.schema.validate(
          req.params,
          rules.params.options || defaultOptions
        );
        if (error) {
          throw this.formatValidationError(error, 'params');
        }
        req.params = value;
      }
    } catch (error) {
      logger.error('Validation error:', error);
      throw error;
    }
  }

  /**
   * Format validation error
   */
  private static formatValidationError(error: ValidationError, source: string): ApiError {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type,
      source
    }));

    return new ApiError(400, 'Validation Error', 'VALIDATION_ERROR', details);
  }

  /**
   * Common validation rules
   */
  static rules = {
    // String rules
    string: {
      email: (field: string) => ({
        [field]: this.joi.string()
          .email()
          .required()
          .messages({
            'string.email': `${field} must be a valid email`,
            'any.required': `${field} is required`
          })
      }),

      password: (field: string) => ({
        [field]: this.joi.string()
          .min(8)
          .max(72)
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
          .required()
          .messages({
            'string.pattern.base': `${field} must contain at least one uppercase letter, one lowercase letter, one number and one special character`,
            'string.min': `${field} must be at least 8 characters`,
            'string.max': `${field} must be less than 72 characters`,
            'any.required': `${field} is required`
          })
      }),

      phone: (field: string) => ({
        [field]: this.joi.string()
          .pattern(/^\+?[1-9]\d{1,14}$/)
          .messages({
            'string.pattern.base': `${field} must be a valid phone number`
          })
      })
    },

    // Number rules
    number: {
      positive: (field: string) => ({
        [field]: this.joi.number()
          .positive()
          .messages({
            'number.positive': `${field} must be a positive number`
          })
      }),

      integer: (field: string) => ({
        [field]: this.joi.number()
          .integer()
          .messages({
            'number.integer': `${field} must be an integer`
          })
      })
    },

    // Date rules
    date: {
      future: (field: string) => ({
        [field]: this.joi.date()
          .greater('now')
          .messages({
            'date.greater': `${field} must be in the future`
          })
      }),

      past: (field: string) => ({
        [field]: this.joi.date()
          .less('now')
          .messages({
            'date.less': `${field} must be in the past`
          })
      })
    },

    // Array rules
    array: {
      unique: (field: string) => ({
        [field]: this.joi.array()
          .unique()
          .messages({
            'array.unique': `${field} must contain unique values`
          })
      }),

      min: (field: string, min: number) => ({
        [field]: this.joi.array()
          .min(min)
          .messages({
            'array.min': `${field} must contain at least ${min} items`
          })
      })
    },

    // Object rules
    object: {
      required: (fields: string[]) => {
        const schema: any = {};
        fields.forEach(field => {
          schema[field] = this.joi.required().messages({
            'any.required': `${field} is required`
          });
        });
        return schema;
      }
    }
  };

  /**
   * Custom validation functions
   */
  static custom = {
    isMongoId: (value: string): boolean => {
      return /^[0-9a-fA-F]{24}$/.test(value);
    },

    isSlug: (value: string): boolean => {
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
    },

    isURL: (value: string): boolean => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },

    isJSON: (value: string): boolean => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    }
  };

  /**
   * Sanitization functions
   */
  static sanitize = {
    trim: (value: string): string => value.trim(),
    
    toLowerCase: (value: string): string => value.toLowerCase(),
    
    toUpperCase: (value: string): string => value.toUpperCase(),
    
    removeSpaces: (value: string): string => value.replace(/\s/g, ''),
    
    escapeHTML: (value: string): string => {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };
}

export const validate = ValidationHelper.validate;
export const rules = ValidationHelper.rules;
export const custom = ValidationHelper.custom;
export const sanitize = ValidationHelper.sanitize;

export default {
  validate,
  rules,
  custom,
  sanitize
};
