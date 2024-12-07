// core/backend/src/services/user.service.ts

import { User, IUser } from '../models/user.model';
import { ApiError } from '../utils/errors';
import { hashPassword, comparePassword } from '../utils/security';
import { sendEmail } from '../utils/email';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';

export class UserService {
  constructor(private auditService: AuditService) {}

  async findById(id: string): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    // Check if email already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    // Create user
    const user = new User({
      ...userData,
      email: userData.email.toLowerCase(),
      password: await hashPassword(userData.password)
    });

    await user.save();

    // Send welcome email
    await sendEmail({
      to: user.email,
      template: 'welcome',
      data: {
        name: user.firstName
      }
    });

    // Audit log
    await this.auditService.log({
      action: 'user.created',
      resourceId: user.id,
      resourceType: 'user',
      userId: user.id
    });

    return user;
  }

  async update(id: string, userData: Partial<IUser>): Promise<IUser> {
    const user = await this.findById(id);

    // If email is being changed, check if new email is available
    if (userData.email && userData.email !== user.email) {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ApiError(400, 'Email already in use');
      }
    }

    // Update user
    Object.assign(user, userData);
    await user.save();

    // Audit log
    await this.auditService.log({
      action: 'user.updated',
      resourceId: user.id,
      resourceType: 'user',
      userId: user.id,
      metadata: {
        updatedFields: Object.keys(userData)
      }
    });

    return user;
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(id).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = await hashPassword(newPassword);
    await user.save();

    // Audit log
    await this.auditService.log({
      action: 'user.password_changed',
      resourceId: user.id,
      resourceType: 'user',
      userId: user.id
    });
  }

  async updatePreferences(id: string, preferences: any): Promise<IUser> {
    const user = await this.findById(id);
    user.preferences = {
      ...user.preferences,
      ...preferences
    };
    await user.save();
    return user;
  }

  async getActivity(userId: string, page: number, limit: number) {
    return this.auditService.findByUser(userId, page, limit);
  }

  async deleteAccount(id: string, password: string): Promise<void> {
    const user = await User.findById(id).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Password is incorrect');
    }

    // Delete user
    await user.remove();

    // Audit log
    await this.auditService.log({
      action: 'user.deleted',
      resourceId: user.id,
      resourceType: 'user',
      userId: user.id
    });
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const query: any = {};

    if (options.search) {
      query.$or = [
        { firstName: new RegExp(options.search, 'i') },
        { lastName: new RegExp(options.search, 'i') },
        { email: new RegExp(options.search, 'i') }
      ];
    }

    if (options.role) {
      query.role = options.role;
    }

    if (options.status) {
      query.status = options.status;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort({ createdAt: -1 });

    return {
      users,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit)
      }
    };
  }
}
