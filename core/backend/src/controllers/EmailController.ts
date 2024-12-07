// core/backend/src/controllers/EmailController.ts

import { Request, Response } from 'express';
import { emailService } from '../services/EmailService';
import { logger } from '../utils/logger';

export class EmailController {
  public async sendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, token } = req.body;
      await emailService.sendVerificationEmail(email, token);
      res.status(200).json({ message: 'Verification email sent successfully' });
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  }

  public async sendPasswordResetEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, token } = req.body;
      await emailService.sendPasswordResetEmail(email, token);
      res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      res.status(500).json({ error: 'Failed to send password reset email' });
    }
  }

  public async sendWelcomeEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;
      await emailService.sendWelcomeEmail(email, { name });
      res.status(200).json({ message: 'Welcome email sent successfully' });
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      res.status(500).json({ error: 'Failed to send welcome email' });
    }
  }
}

export const emailController = new EmailController();
