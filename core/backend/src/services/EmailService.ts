// core/backend/src/services/EmailService.ts

import nodemailer, { Transporter } from 'nodemailer';
import { readFileSync } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { EmailTemplate, EmailOptions } from '../types/email.types';
import { config } from '../config';
import { logger } from '../utils/logger';

export class EmailService {
  private transporter: Transporter;
  private templates: Map<string, HandlebarsTemplateDelegate>;

  constructor() {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      }
    });

    // Initialize templates
    this.templates = new Map();
    this.loadTemplates();
  }

  private loadTemplates(): void {
    const templateDir = path.join(__dirname, '../templates/email');
    const templates: EmailTemplate[] = [
      {
        name: 'welcome',
        subject: 'Welcome to {{appName}}',
        path: path.join(templateDir, 'welcome.hbs')
      },
      {
        name: 'verification',
        subject: 'Verify your email address',
        path: path.join(templateDir, 'verification.hbs')
      },
      {
        name: 'password-reset',
        subject: 'Reset your password',
        path: path.join(templateDir, 'password-reset.hbs')
      },
      {
        name: 'notification',
        subject: '{{notificationTitle}}',
        path: path.join(templateDir, 'notification.hbs')
      }
    ];

    templates.forEach(template => {
      const templateContent = readFileSync(template.path, 'utf-8');
      this.templates.set(template.name, Handlebars.compile(templateContent));
    });
  }

  public async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const template = this.templates.get(options.template);
      if (!template) {
        throw new Error(`Template ${options.template} not found`);
      }

      const html = template(options.data);
      const subject = Handlebars.compile(
        this.getTemplateSubject(options.template)
      )(options.data);

      await this.transporter.sendMail({
        from: config.email.from,
        to: options.to,
        subject,
        html,
        text: options.text || this.stripHtml(html)
      });

      logger.info(`Email sent successfully to ${options.to}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  private getTemplateSubject(templateName: string): string {
    const templates = Array.from(this.templates.entries());
    const template = templates.find(([name]) => name === templateName);
    return template?.[1].subject || 'No Subject';
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  // Specific email sending methods
  public async sendWelcomeEmail(to: string, data: any): Promise<void> {
    await this.sendEmail({
      template: 'welcome',
      to,
      data: {
        ...data,
        appName: config.appName
      }
    });
  }

  public async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${config.appUrl}/verify-email?token=${token}`;
    await this.sendEmail({
      template: 'verification',
      to,
      data: {
        verificationUrl,
        appName: config.appName
      }
    });
  }

  public async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${config.appUrl}/reset-password?token=${token}`;
    await this.sendEmail({
      template: 'password-reset',
      to,
      data: {
        resetUrl,
        appName: config.appName
      }
    });
  }

  public async sendNotification(to: string, notification: any): Promise<void> {
    await this.sendEmail({
      template: 'notification',
      to,
      data: {
        notificationTitle: notification.title,
        ...notification
      }
    });
  }
}

export const emailService = new EmailService();
