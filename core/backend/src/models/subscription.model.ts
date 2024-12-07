import mongoose, { Schema, Document } from 'mongoose';
import { SubscriptionPlan, SubscriptionStatus } from '../types/subscription.types';

export interface ISubscription extends Document {
  organizationId: mongoose.Types.ObjectId;
  planId: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  endedAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  payment: {
    provider: 'stripe' | 'paypal';
    customerId: string;
    subscriptionId: string;
    paymentMethodId?: string;
    lastPaymentDate?: Date;
    lastPaymentAmount?: number;
    nextPaymentDate?: Date;
    currency: string;
  };
  billing: {
    email: string;
    name: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    vatNumber?: string;
    taxRate?: number;
  };
  features: {
    [key: string]: {
      enabled: boolean;
      limit?: number;
      usage?: number;
    };
  };
  usage: {
    apiCalls: {
      limit: number;
      current: number;
      lastReset: Date;
    };
    storage: {
      limit: number;
      current: number;
    };
    users: {
      limit: number;
      current: number;
    };
    [key: string]: {
      limit: number;
      current: number;
      lastReset?: Date;
    };
  };
  history: Array<{
    action: 'created' | 'updated' | 'canceled' | 'resumed' | 'trial_ended' | 'payment_failed';
    date: Date;
    planId?: SubscriptionPlan;
    reason?: string;
    metadata?: Record<string, any>;
  }>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  planId: {
    type: String,
    enum: Object.values(SubscriptionPlan),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SubscriptionStatus),
    default: SubscriptionStatus.ACTIVE
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: Date,
  endedAt: Date,
  trialStart: Date,
  trialEnd: Date,
  payment: {
    provider: {
      type: String,
      enum: ['stripe', 'paypal'],
      required: true
    },
    customerId: {
      type: String,
      required: true
    },
    subscriptionId: {
      type: String,
      required: true
    },
    paymentMethodId: String,
    lastPaymentDate: Date,
    lastPaymentAmount: Number,
    nextPaymentDate: Date,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  billing: {
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String
    },
    vatNumber: String,
    taxRate: Number
  },
  features: {
    type: Map,
    of: {
      enabled: Boolean,
      limit: Number,
      usage: Number
    }
  },
  usage: {
    apiCalls: {
      limit: {
        type: Number,
        required: true
      },
      current: {
        type: Number,
        default: 0
      },
      lastReset: {
        type: Date,
        default: Date.now
      }
    },
    storage: {
      limit: {
        type: Number,
        required: true
      },
      current: {
        type: Number,
        default: 0
      }
    },
    users: {
      limit: {
        type: Number,
        required: true
      },
      current: {
        type: Number,
        default: 0
      }
    }
  },
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'canceled', 'resumed', 'trial_ended', 'payment_failed'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    planId: String,
    reason: String,
    metadata: Schema.Types.Mixed
  }],
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
SubscriptionSchema.index({ organizationId: 1 }, { unique: true });
SubscriptionSchema.index({ 'payment.customerId': 1 });
SubscriptionSchema.index({ 'payment.subscriptionId': 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });

// Methods

/**
 * Check if subscription is active
 */
SubscriptionSchema.methods.isActive = function(): boolean {
  return this.status === SubscriptionStatus.ACTIVE;
};

/**
 * Check if subscription is in trial
 */
SubscriptionSchema.methods.isInTrial = function(): boolean {
  if (!this.trialEnd) return false;
  return this.status === SubscriptionStatus.TRIALING && 
         new Date() < this.trialEnd;
};

/**
 * Check if feature is enabled
 */
SubscriptionSchema.methods.hasFeature = function(featureKey: string): boolean {
  return this.features.get(featureKey)?.enabled || false;
};

/**
 * Check if usage is within limits
 */
SubscriptionSchema.methods.checkUsageLimit = function(
  usageKey: string,
  increment: number = 1
): boolean {
  const usage = this.usage[usageKey];
  if (!usage) return false;
  return (usage.current + increment) <= usage.limit;
};

/**
 * Increment usage
 */
SubscriptionSchema.methods.incrementUsage = async function(
  usageKey: string,
  increment: number = 1
): Promise<boolean> {
  if (!this.checkUsageLimit(usageKey, increment)) {
    return false;
  }

  this.usage[usageKey].current += increment;
  await this.save();
  return true;
};

/**
 * Add history entry
 */
SubscriptionSchema.methods.addHistoryEntry = async function(
  action: string,
  reason?: string,
  metadata?: Record<string, any>
): Promise<void> {
  this.history.push({
    action,
    date: new Date(),
    planId: this.planId,
    reason,
    metadata
  });
  await this.save();
};

/**
 * Reset usage counters
 */
SubscriptionSchema.methods.resetUsage = async function(
  usageKey?: string
): Promise<void> {
  if (usageKey) {
    if (this.usage[usageKey]) {
      this.usage[usageKey].current = 0;
      this.usage[usageKey].lastReset = new Date();
    }
  } else {
    Object.keys(this.usage).forEach(key => {
      this.usage[key].current = 0;
      this.usage[key].lastReset = new Date();
    });
  }
  await this.save();
};

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
