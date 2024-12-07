// core/backend/src/services/TwoFactorAuthService.ts

import { authenticator } from 'otplib';
import { generateSecret } from 'otplib/authenticator';
import QRCode from 'qrcode';
import crypto from 'crypto';

export class TwoFactorAuthService {
  // Generate new secret and QR code for user setup
  async setupTwoFactor(userId: string, email: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  }> {
    try {
      // Generate secret key
      const secret = generateSecret();

      // Generate QR code
      const serviceName = 'YourApp';
      const otpauth = authenticator.keyuri(email, serviceName, secret);
      const qrCodeUrl = await QRCode.toDataURL(otpauth);

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Store secret and backup codes in database
      await this.storeTwoFactorData(userId, {
        secret,
        backupCodes: backupCodes.map(code => ({
          code: this.hashCode(code),
          used: false
        }))
      });

      return {
        secret,
        qrCodeUrl,
        backupCodes
      };
    } catch (error) {
      throw new Error('Failed to setup 2FA');
    }
  }

  // Verify 2FA code
  async verifyCode(
    userId: string,
    code: string,
    isBackupCode: boolean = false
  ): Promise<boolean> {
    try {
      const twoFactorData = await this.getTwoFactorData(userId);

      if (isBackupCode) {
        return this.verifyBackupCode(userId, code, twoFactorData.backupCodes);
      }

      return authenticator.verify({
        token: code,
        secret: twoFactorData.secret
      });
    } catch (error) {
      throw new Error('Failed to verify 2FA code');
    }
  }

  // Generate backup codes
  private generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Hash backup codes for storage
  private hashCode(code: string): string {
    return crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
  }

  // Store 2FA data in database
  private async storeTwoFactorData(
    userId: string,
    data: {
      secret: string;
      backupCodes: Array<{ code: string; used: boolean }>;
    }
  ): Promise<void> {
    await prisma.twoFactorAuth.upsert({
      where: { userId },
      update: {
        secret: data.secret,
        backupCodes: data.backupCodes
      },
      create: {
        userId,
        secret: data.secret,
        backupCodes: data.backupCodes,
        enabled: false
      }
    });
  }

  // Verify backup code
  private async verifyBackupCode(
    userId: string,
    code: string,
    backupCodes: Array<{ code: string; used: boolean }>
  ): Promise<boolean> {
    const hashedCode = this.hashCode(code);
    const backupCode = backupCodes.find(
      bc => bc.code === hashedCode && !bc.used
    );

    if (backupCode) {
      // Mark backup code as used
      await this.markBackupCodeAsUsed(userId, hashedCode);
      return true;
    }

    return false;
  }

  // Mark backup code as used
  private async markBackupCodeAsUsed(
    userId: string,
    hashedCode: string
  ): Promise<void> {
    await prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        backupCodes: {
          updateMany: {
            where: { code: hashedCode },
            data: { used: true }
          }
        }
      }
    });
  }
}
