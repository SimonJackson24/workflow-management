import nodemailer, { Transporter } from 'nodemailer';
import aws from '@aws-sdk/client-ses';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger';
import { redisClient } from '../config/redis';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  data?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  cc?: string | string[];
  bcc?: string | string[];
  priority?: 'high' | 'normal' | 'low';
  replyTo?: string;
}

class EmailService {
  private transporter: Transporter;
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private readonly defaultFrom: string;
  private readonly templateDir: string;

  constructor() {
    this.defaultFrom = process.env.EMAIL_FROM || 'no-reply@yourdomain.com';
    this.templateDir = path.join(process.cwd(), 'src/templates/email');
    this.initializeTransporter();
  }

  /**
   * Initialize Email Transporter
   */
  private initializeTransporter(): void {
    if (process.env.EMAIL_PROVIDER === 'ses') {
      // AWS SES Configuration
      const ses = new aws.SES({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
      });

      this.transporter = nodemailer.createTransport({
        SES: { ses, aws }
      });
    } else {
      // SMTP Configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
    }
  }

  /**
   * Load and Cache Email Template
   */
  private async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    // Check cache first
    const cached = this.templateCache.get(templateName);
    if (cached) return cached;

    try {
      // Load template file
      const templatePath = path.join(this.templateDir, `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      // Compile and cache template
      const template = handlebars.compile(templateContent);
      this.templateCache.set(templateName, template);

      return template;
    } catch (error) {
      logger.error(`Failed to load email template: ${templateName}`, error);
      throw new Error(`Email template not found: ${templateName}`);
    }
  }

  /**
   * Send Email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Rate limiting check
      const rateLimitKey = `email:ratelimit:${options.to}`;
      const sentCount = await redisClient.incr(rateLimitKey);
      
      if (sentCount === 1) {
        await redisClient.expire(rateLimitKey, 3600); // 1 hour window
      }
      
      if (sentCount > parseInt(process.env.EMAIL_RATE_LIMIT || '10')) {
        throw new Error('Email rate limit exceeded');
      }

      // Load and compile template
      const template = await this.loadTemplate(options.template);
      const html = template(options.data || {});

      // Prepare email options
      const mailOptions = {
        from: this.defaultFrom,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html,
        attachments: options.attachments,
        priority: options.priority,
        replyTo: options.replyTo,
        headers: {
          'X-Application': 'Workflow Management System',
          'X-Template': options.template
        }
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      // Log success
      logger.info('Email sent successfully', {
        messageId: info.messageId,
        template: options.template,
        recipient: options.to
      });

      // Store email record
      await this.storeEmailRecord({
        to: options.to,
        subject: options.subject,
        template: options.template,
        messageId: info.messageId,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email', {
        error,
        template: options.template,
        recipient: options.to
      });
      
      // Store failed attempt
      await this.storeEmailFailure({
        to: options.to,
        subject: options.subject,
        template: options.template,
        error: error.message,
        timestamp: new Date()
      });

      throw error;
    }
  }

  /**
   * Send Bulk Emails
   */
  async sendBulkEmails(options: EmailOptions[]): Promise<boolean[]> {
    return Promise.all(options.map(opt => this.sendEmail(opt).catch(() => false)));
  }

  /**
   * Store Email Record
   */
  private async storeEmailRecord(record: any): Promise<void> {
    const key = `email:sent:${record.messageId}`;
    await redisClient.setex(key, 86400 * 30, JSON.stringify(record)); // Store for 30 days
  }

  /**
   * Store Email Failure
   */
  private async storeEmailFailure(record: any): Promise<void> {
    const key = `email:failed:${Date.now()}`;
    await redisClient.setex(key, 86400 * 7, JSON.stringify(record)); // Store for 7 days
  }

  /**
   * Verify Email Configuration
   */
  async verifyConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email configuration verification failed', error);
      return false;
    }
  }

  /**
   * Get Email Templates
   */
  async getTemplates(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.templateDir);
      return files
        .filter(file => file.endsWith('.hbs'))
        .map(file => file.replace('.hbs', ''));
    } catch (error) {
      logger.error('Failed to get email templates', error);
      return [];
    }
  }

  /**
   * Clear Template Cache
   */
  clearTemplateCache(): void {
    this.templateCache.clear();
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export helper functions
export const sendEmail = (options: EmailOptions) => emailService.sendEmail(options);
export const sendBulkEmails = (options: EmailOptions[]) => emailService.sendBulkEmails(options);
export const verifyEmailConfig = () => emailService.verifyConfiguration();
export const getEmailTemplates = () => emailService.getTemplates();

export default {
  emailService,
  sendEmail,
  sendBulkEmails,
  verifyEmailConfig,
  getEmailTemplates
};
