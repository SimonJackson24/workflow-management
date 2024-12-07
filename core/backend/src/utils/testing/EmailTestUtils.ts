// core/backend/src/utils/testing/EmailTestUtils.ts

import { createTransport } from 'nodemailer';
import { EmailOptions } from '../../types/email.types';
import { emailService } from '../../services/EmailService';
import { emailQueueService } from '../../services/EmailQueueService';

export class EmailTestUtils {
  private static testAccount: any;

  public static async createTestAccount(): Promise<void> {
    this.testAccount = await createTransport.createTestAccount();
  }

  public static async getTestTransporter() {
    if (!this.testAccount) {
      await this.createTestAccount();
    }

    return createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: this.testAccount.user,
        pass: this.testAccount.pass
      }
    });
  }

  public static async sendTestEmail(options: EmailOptions): Promise<string> {
    const transporter = await this.getTestTransporter();
    const info = await transporter.sendMail({
      from: 'test@example.com',
      ...options
    });

    return createTransport.getTestMessageUrl(info);
  }

  public static async clearEmailQueue(): Promise<void> {
    await emailQueueService.clearQueue();
  }

  public static async waitForEmails(count: number, timeout: number = 5000): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const status = await emailQueueService.getQueueStatus();
      if (status.completed >= count) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Timeout waiting for emails');
  }
}
