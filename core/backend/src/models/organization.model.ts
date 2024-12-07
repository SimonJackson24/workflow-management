import mongoose, { Schema, Document } from 'mongoose';
import { SubscriptionStatus } from '../types/subscription.types';

export interface IOrganization extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  website?: string;
  industry?: string;
  size?: number;
  timezone: string;
  settings: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: {
      email: boolean;
      slack?: boolean;
      webhook?: boolean;
    };
    security?: {
      mfa: boolean;
      ipWhitelist?: string[];
      passwordPolicy?: {
        minLength: number;
        requireSpecialChars: boolean;
        requireNumbers: boolean;
        expiryDays?: number;
      };
    };
  };
  subscription: {
    planId: string;
    status: SubscriptionStatus;
    stripeCustomerId?: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    features: string[];
    limits: {
      users: number;
      storage: number;
      apiCalls: number;
    };
  };
  billing: {
    contactEmail: string;
    contactName?: string;
    vatId?: string;
    paymentMethod?: {
      type: 'card' | 'bank' | 'other';
      last4?: string;
      expiryMonth?: number;
      expiryYear?: number;
      brand?: string;
    };
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  integrations: {
    google?: {
      enabled: boolean;
      config?: {
        clientId: string;
        clientSecret: string;
        refreshToken?: string;
        scope?: string[];
      };
    };
    slack?: {
      enabled: boolean;
      config?: {
        webhookUrl?: string;
        botToken?: string;
        channelId?: string;
      };
    };
    custom?: {
      [key: string]: {
        enabled: boolean;
        config?: Record<string, any>;
      };
    };
  };
  members: [{
    userId: Schema.Types.ObjectId;
    role: 'owner' | 'admin' | 'manager' | 'member';
    permissions: string[];
    addedAt: Date;
    invitedBy: Schema.Types.ObjectId;
  }];
  plugins: [{
    id: string;
    enabled: boolean;
    config?: Record<string, any>;
    installedAt: Date;
    installedBy: Schema.Types.ObjectId;
  }];
  usage: {
    activeUsers: number;
    storageUsed: number;
    apiCalls: {
      current: number;
      lastReset: Date;
    };
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const OrganizationSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true 
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  website: String,
  industry: String,
  size: Number,
  timezone: {
    type: String,
    default: 'UTC'
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
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
      slack: Boolean,
      webhook: Boolean
    },
    security: {
      mfa: {
        type: Boolean,
        default: false
      },
      ipWhitelist: [String],
      passwordPolicy: {
        minLength: {
          type: Number,
          default: 8
        },
        requireSpecialChars: {
          type: Boolean,
          default: true
        },
        requireNumbers: {
          type: Boolean,
          default: true
        },
        expiryDays: Number
      }
    }
  },
  subscription: {
    planId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.TRIALING
    },
    stripeCustomerId: String,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    features: [String],
    limits: {
      users: {
        type: Number,
        required: true
      },
      storage: {
        type: Number,
        required: true
      },
      apiCalls: {
        type: Number,
        required: true
      }
    }
  },
  billing: {
    contactEmail: {
      type: String,
      required: true
    },
    contactName: String,
    vatId: String,
    paymentMethod: {
      type: {
        type: String,
        enum: ['card', 'bank', 'other']
      },
      last4: String,
      expiryMonth: Number,
      expiryYear: Number,
      brand: String
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  integrations: {
    google: {
      enabled: {
        type: Boolean,
        default: false
      },
      config: {
        clientId: String,
        clientSecret: String,
        refreshToken: String,
        scope: [String]
      }
    },
    slack: {
      enabled: {
        type: Boolean,
        default: false
      },
      config: {
        webhookUrl: String,
        botToken: String,
        channelId: String
      }
    },
    custom: Schema.Types.Mixed
  },
  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'manager', 'member'],
      required: true
