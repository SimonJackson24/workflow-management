// core/backend/src/services/AuthenticationService.ts

import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { emailService } from './EmailService';
import { config } from '../config';
import { AuthenticationError } from '../errors/AuthenticationError';

export class AuthenticationService {
  private readonly JWT_SECRET = config.jwt.secret;
  private readonly JWT_EXPIRES_IN = config.jwt.expiresIn;

  public async authenticateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
        permissions: true,
        securitySettings: true
      }
    });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if 2FA is required
    if (user.securitySettings?.twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        userId: user.id
      };
    }

    return this.generateAuthResponse(user);
  }

  public async verifyTwoFactorCode(userId: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        securitySettings: true
      }
    });

    if (!user || !user.securitySettings?.twoFactorSecret) {
      throw new AuthenticationError('Invalid user or 2FA not setup');
    }

    const isCodeValid = this.verifyTOTP(code, user.securitySettings.twoFactorSecret);
    if (!isCodeValid) {
      throw new AuthenticationError('Invalid 2FA code');
    }

    return this.generateAuthResponse(user);
  }

  private async generateAuthResponse(user: User) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions
      }
    };
  }

  private generateAccessToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles: user.roles.map(role => role.name),
        permissions: user.permissions.map(perm => perm.name)
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign(
      { userId: user.id },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  public async refreshAccessToken(refreshToken: string) {
    const savedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!savedToken || savedToken.expiresAt < new Date()) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const newAccessToken = this.generateAccessToken(savedToken.user);
    return { accessToken: newAccessToken };
  }

  public async logout(refreshToken: string) {
    await prisma.refreshToken.delete({
      where: { token: refreshToken }
    });
  }

  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId }
    });
  }

  public async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const resetToken = jwt.sign(
      { userId: user.id },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await prisma.passwordReset.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }
    });

    await emailService.sendPasswordResetEmail(email, resetToken);
  }

  public async resetPassword(token: string, newPassword: string) {
    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetRequest || resetRequest.expiresAt < new Date()) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: resetRequest.userId },
      data: { password: hashedPassword }
    });

    // Cleanup
    await prisma.passwordReset.delete({
      where: { token }
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: resetRequest.userId }
    });
  }

  private verifyTOTP(token: string, secret: string): boolean {
    // Implement TOTP verification logic
    return true; // Placeholder
  }
}

export const authenticationService = new AuthenticationService();
