import { Request, Response, NextFunction } from 'express';

/**
 * Async Handler Wrapper
 * 
 * Eliminates the need for try-catch blocks in async route handlers
 * Automatically catches errors and forwards them to Express error handler
 * 
 * @param fn The async route handler function to wrap
 * @returns Promise<void>
 * 
 * @example
 * // Instead of:
 * router.get('/route', async (req, res, next) => {
 *   try {
 *     // ... async code
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 * 
 * // You can write:
 * router.get('/route', asyncHandler(async (req, res) => {
 *   // ... async code
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Async Handler with Validation
 * 
 * Extended version of asyncHandler that includes input validation
 * 
 * @param fn The async route handler function to wrap
 * @param validator Optional validation function
 * @returns Promise<void>
 * 
 * @example
 * router.post('/route', asyncHandlerWithValidation(
 *   async (req, res) => {
 *     // ... async code
 *   },
 *   validateInput
 * ));
 */
export const asyncHandlerWithValidation = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  validator?: (req: Request) => Promise<boolean>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Run validation if provided
      if (validator) {
        const isValid = await validator(req);
        if (!isValid) {
          throw new Error('Validation failed');
        }
      }

      // Execute handler
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Async Handler with Timeout
 * 
 * Version of asyncHandler that includes a timeout
 * 
 * @param fn The async route handler function to wrap
 * @param timeout Timeout in milliseconds (default: 30000)
 * @returns Promise<void>
 * 
 * @example
 * router.get('/route', asyncHandlerWithTimeout(
 *   async (req, res) => {
 *     // ... async code
 *   },
 *   5000 // 5 second timeout
 * ));
 */
export const asyncHandlerWithTimeout = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  timeout: number = 30000
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    });

    try {
      await Promise.race([
        fn(req, res, next),
        timeoutPromise
      ]);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Async Handler with Retry
 * 
 * Version of asyncHandler that includes automatic retry logic
 * 
 * @param fn The async route handler function to wrap
 * @param retries Number of retries (default: 3)
 * @param delay Delay between retries in milliseconds (default: 1000)
 * @returns Promise<void>
 * 
 * @example
 * router.get('/route', asyncHandlerWithRetry(
 *   async (req, res) => {
 *     // ... async code
 *   },
 *   3, // 3 retries
 *   1000 // 1 second delay between retries
 * ));
 */
export const asyncHandlerWithRetry = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  retries: number = 3,
  delay: number = 1000
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let lastError: any;

    for (let i = 0; i <= retries; i++) {
      try {
        await fn(req, res, next);
        return;
      } catch (error) {
        lastError = error;
        
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    next(lastError);
  };
};

/**
 * Async Handler with Circuit Breaker
 * 
 * Version of asyncHandler that implements the Circuit Breaker pattern
 * 
 * @param fn The async route handler function to wrap
 * @param options Circuit breaker options
 * @returns Promise<void>
 * 
 * @example
 * router.get('/route', asyncHandlerWithCircuitBreaker(
 *   async (req, res) => {
 *     // ... async code
