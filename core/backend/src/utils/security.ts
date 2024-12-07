import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { logger, logSecurity } from './logger';
import { ApiError } from './errors';

/**
 * Security Configuration Interface
 */
interface SecurityConfig {
  jwtSecret: string;
  jwtExpiry: string;
  bcryptRounds: number;
  rateLimitWindow: number;
  rateLimitMax: number;
  csrfSecret: string;
  corsOrigins: string[];
  ipWhitelist: string[];
  ipBlacklist: string[];
}

/**
 * Security Utility Class
 */
class SecurityUtil {
  private config: SecurityConfig;

  constructor() {
    this.config = {
      jwtSecret: process.env.JWT_SECRET!,
      jwtExpiry: process.env.JWT_EXPIRY || '24h',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900'),
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      csrfSecret: process.env.CSRF_SECRET!,
      corsOrigins: process.env.CORS_ORIGINS?.split(',') || [],
      ipWhitelist: process.env.IP_WHITELIST?.split(',') || [],
      ipBlacklist: process.env.IP_BLACKLIST?.split(',') || []
    };
  }

  /**
   * Hash Password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.bcryptRounds);
  }

  /**
   * Compare Password
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT Token
   */
  generateToken(payload: any, expiresIn?: string): string {
    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: expiresIn || this.config.jwtExpiry
    });
  }

  /**
   * Verify JWT Token
   */
  verifyToken(token: string): any {
    return jwt.verify(token, this.config.jwtSecret);
  }

  /**
   * Generate Random Token
   */
  generateRandomToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Hash Data (SHA-256)
   */
  hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Encrypt Data
   */
  encryptData(data: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'hex'),
      iv
    );
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  }

  /**
   * Decrypt Data
   */
  decryptData(encryptedData: string, key: string): string {
    const [ivHex, encrypted, authTagHex] = encryptedData.split(':');
    
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'hex'),
      Buffer.from(ivHex, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate CSRF Token
   */
  generateCSRFToken(sessionId: string): string {
    return this.hashData(`${sessionId}${this.config.csrfSecret}`);
  }

  /**
   * Validate CSRF Token
   */
  validateCSRFToken(token: string, sessionId: string): boolean {
    const expectedToken = this.generateCSRFToken(sessionId);
    return token === expectedToken;
  }

  /**
   * IP Address Validation
   */
  validateIPAddress(ip: string): boolean {
    // Check blacklist
    if (this.config.ipBlacklist.includes(ip)) {
      logSecurity('IP_BLOCKED', { ip });
      return false;
    }

    // Check whitelist (if configured)
    if (this.config.ipWhitelist.length > 0) {
      return this.config.ipWhitelist.includes(ip);
    }

    return true;
  }

  /**
   * Rate Limiting
   */
  async checkRateLimit(key: string): Promise<boolean> {
    const count = await redisClient.incr(`ratelimit:${key}`);
    
    if (count === 1) {
      await redisClient.expire(`ratelimit:${key}`, this.config.rateLimitWindow);
    }
    
    return count <= this.config.rateLimitMax;
  }

  /**
   * Security Headers Middleware
   */
  securityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      // HSTS
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );
      
      // Content Security Policy
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
      );
      
      // XSS Protection
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Frame Options
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      
      // Content Type Options
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Referrer Policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      next();
    };
  }

  /**
   * CORS Configuration
   */
  corsOptions() {
    return {
      origin: (origin: string, callback: Function) => {
        if (!origin || this.config.corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new ApiError(403, 'CORS not allowed'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
      exposedHeaders: ['X-Total-Count'],
      credentials: true,
      maxAge: 86400 // 24 hours
    };
  }

  /**
   * Password Validation
   */
  validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  /**
   * Sanitize Input
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      }[char] || char));
  }

  /**
   * Generate API Key
   */
  generateAPIKey(userId: string, scope: string[] = []): string {
    const payload = {
      userId,
      scope,
      type: 'apikey',
      created: Date.now()
    };
    
    const key = this.generateRandomToken(32);
    const encrypted = this.encryptData(JSON.stringify(payload), key);
    
    return `${key}.${encrypted}`;
  }
}

// Export singleton instance
export const security = new SecurityUtil();

export default security;
