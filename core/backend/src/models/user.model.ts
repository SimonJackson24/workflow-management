import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationId: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'manager' | 'member';
  permissions: string[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  profile: {
    avatar?: string;
    title?: string;
    department?: string;
    phoneNumber?: string;
    timezone: string;
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      slack?: boolean;
    };
  };
  security: {
    mfaEnabled: boolean;
    mfaSecret?: string;
    lastPasswordChange: Date;
    passwordHistory: string[];
    loginAttempts: number;
    lockUntil?: Date;
    lastLogin?: {
      date: Date;
      ip: string;
      userAgent: string;
    };
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    sidebar: boolean;
    emailDigest: 'daily' | 'weekly' | 'never';
    taskReminders: boolean;
  };
  metadata?: Record<string, any>;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  emailVerificationToken?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getResetPasswordToken(): string;
  getEmailVerificationToken(): string;
}

const UserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'member'],
    default: 'member'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_billing',
      'manage_subscriptions',
      'manage_plugins',
      'view_reports',
      'manage_workflows',
      'manage_integrations'
    ]
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  profile: {
    avatar: String,
    title: String,
    department: String,
    phoneNumber: String,
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      slack: Boolean
    }
  },
  security: {
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    mfaSecret: String,
    lastPasswordChange: {
      type: Date,
      default: Date.now
    },
    passwordHistory: [String],
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    lastLogin: {
      date: Date,
      ip: String,
      userAgent: String
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    sidebar: {
      type: Boolean,
      default: true
    },
    emailDigest: {
      type: String,
      enum: ['daily', 'weekly', 'never'],
      default: 'daily'
    },
    taskReminders: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default:
