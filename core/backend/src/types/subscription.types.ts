/**
 * Subscription Status Enum
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired'
}

/**
 * Subscription Plan Interface
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripeId: string;
  features: string[];
  maxUsers: number;
  plugins: string[];
  limits?: {
    storage?: number;
    apiCalls?: number;
    customIntegrations?: number;
  };
}

/**
 * Subscription Details Interface
 */
export interface SubscriptionDetails {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plugins: string[];
  features: string[];
  maxUsers: number;
  usage?: {
    currentUsers: number;
    storageUsed?: number;
    apiCallsUsed?: number;
  };
}

/**
 * Subscription Creation Input
 */
export interface CreateSubscriptionInput {
  organizationId: string;
  planId: string;
  paymentMethodId?: string;
  trialDays?: number;
}

/**
 * Subscription Update Input
 */
export interface UpdateSubscriptionInput {
  planId?: string;
  cancelAtPeriodEnd?: boolean;
  paymentMethodId?: string;
}

/**
 * Subscription Invoice Interface
 */
export interface SubscriptionInvoice {
  id: string;
  subscriptionId: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  invoiceDate: Date;
  dueDate: Date;
  paidAt?: Date;
  lineItems: {
    description: string;
    amount: number;
    quantity?: number;
  }[];
}

/**
 * Usage Record Interface
 */
export interface UsageRecord {
  subscriptionId: string;
  metric: 'users' | 'storage' | 'api_calls';
  value: number;
  timestamp: Date;
}

/**
 * Subscription Event Interface
 */
export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  organizationId: string;
  type: 'created' | 'updated' | 'canceled' | 'payment_failed' | 'payment_succeeded';
  data: any;
  timestamp: Date;
}

/**
 * Subscription Notification Interface
 */
export interface SubscriptionNotification {
  id: string;
  subscriptionId: string;
  organizationId: string;
  type: 'payment_reminder' | 'payment_failed' | 'subscription_canceled' | 'trial_ending';
  message: string;
  read: boolean;
  createdAt: Date;
}

/**
 * Subscription Analytics Interface
 */
export interface SubscriptionAnalytics {
  subscriptionId: string;
  organizationId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    activeUsers: number;
    storageUsed?: number;
    apiCalls?: number;
    uptime?: number;
  };
  costs: {
    base: number;
    overage?: number;
    total: number;
  };
}

/**
 * Feature Flag Interface
 */
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  constraints?: {
    planIds?: string[];
    minUsers?: number;
    maxUsers?: number;
    requiresIntegration?: string[];
  };
}

/**
 * Subscription Error Types
 */
export enum SubscriptionErrorType {
  PAYMENT_FAILED = 'payment_failed',
  PLAN_NOT_FOUND = 'plan_not_found',
  INVALID_PAYMENT_METHOD = 'invalid_payment_method',
  USAGE_LIMIT_EXCEEDED = 'usage_limit_exceeded',
  SUBSCRIPTION_NOT_FOUND = 'subscription_not_found',
  INVALID_UPDATE = 'invalid_update',
  STRIPE_ERROR = 'stripe_error'
}

/**
 * Subscription Error Interface
 */
export interface SubscriptionError {
  type: SubscriptionErrorType;
  message: string;
  code: string;
  details?: any;
}
