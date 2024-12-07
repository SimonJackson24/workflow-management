import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request } from 'express';
import path from 'path';

// Define severity levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define different colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that we want to link the colors
winston.addColors(colors);

// Define which logs to print based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Define log format
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Add errors stack trace
  winston.format.errors({ stack: true }),
  // Convert logs to JSON
  winston.format.json(),
  // Add padding
  winston.format.padding(),
  // Add colors
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Define which files to save
const transports = [
  // Save error logs in error.log
  new DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),
  // Save all logs in combined.log
  new DailyRotateFile({
    filename: path.join('logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  // Print all logs to console
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// Create the logger instance
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false
});

// Create a stream object with a write function that will be used by morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

/**
 * Log Request Details
 */
export const logRequest = (req: Request, responseTime?: number) => {
  const { method, originalUrl, ip, user } = req;
  
  logger.info('Request Details', {
    method,
    url: originalUrl,
    ip,
    userId: user?.id || 'anonymous',
    userAgent: req.get('user-agent'),
    responseTime: responseTime ? `${responseTime}ms` : undefined,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log Error Details
 */
export const logError = (error: any, req?: Request) => {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };

  if (req) {
    Object.assign(errorDetails, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
      userAgent: req.get('user-agent')
    });
  }

  logger.error('Error Details', errorDetails);
};

/**
 * Log Security Events
 */
export const logSecurity = (event: string, details: any) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log Performance Metrics
 */
export const logPerformance = (metric: string, value: number, tags: object = {}) => {
  logger.info('Performance Metric', {
    metric,
    value,
    ...tags,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log Audit Events
 */
export const logAudit = (action: string, userId: string, details: object = {}) => {
  logger.info('Audit Log', {
    action,
    userId,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Custom Log Levels
 */
export const customLevels = {
  audit: (message: string, metadata?: any) => logger.info(message, { type: 'AUDIT', ...metadata }),
  security: (message: string, metadata?: any)
