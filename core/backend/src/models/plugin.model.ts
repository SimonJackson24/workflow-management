// core/backend/src/models/plugin.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IPlugin extends Document {
  name: string;
  slug: string;
  version: string;
  description: string;
  author: {
    name: string;
    email: string;
    url?: string;
  };
  repository?: string;
  homepage?: string;
  license: string;
  keywords: string[];
  category: string;
  status: 'active' | 'inactive' | 'deprecated';
  pricing: {
    type: 'free' | 'paid' | 'subscription';
    price?: number;
    currency?: string;
    interval?: 'monthly' | 'yearly';
    trialDays?: number;
  };
  requirements: {
    node?: string;
    platform?: string[];
    dependencies?: Record<string, string>;
  };
  features: string[];
  screenshots?: string[];
  documentation: {
    setup?: string;
    usage?: string;
    api?: string;
  };
  configuration: {
    schema: Record<string, any>;
    defaultValues: Record<string, any>;
  };
  permissions: string[];
  hooks: string[];
  events: {
    emit: string[];
    listen: string[];
  };
  stats: {
    installations: number;
    activeInstallations: number;
    rating: number;
    ratingCount: number;
    downloads: number;
  };
  security: {
    verified: boolean;
    signature?: string;
    checksum?: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  deprecatedAt?: Date;
}

const PluginSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  version: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    url: String
  },
  repository: String,
  homepage: String,
  license: {
    type: String,
    required: true
  },
  keywords: [String],
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated'],
    default: 'active'
  },
  pricing: {
    type: {
      type: String,
      enum: ['free', 'paid', 'subscription'],
      default: 'free'
    },
    price: Number,
    currency: String,
    interval: {
      type: String,
      enum: ['monthly', 'yearly']
    },
    trialDays: Number
  },
  requirements: {
    node: String,
    platform: [String],
    dependencies: Schema.Types.Mixed
  },
  features: [String],
  screenshots: [String],
  documentation: {
    setup: String,
    usage: String,
    api: String
  },
  configuration: {
    schema: Schema.Types.Mixed,
    defaultValues: Schema.Types.Mixed
  },
  permissions: [String],
  hooks: [String],
  events: {
    emit: [String],
    listen: [String]
  },
  stats: {
    installations: {
      type: Number,
      default: 0
    },
    activeInstallations: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    }
  },
  security: {
    verified: {
      type: Boolean,
      default: false
    },
    signature: String,
    checksum: String
  },
  metadata: Schema.Types.Mixed,
  publishedAt: Date,
  deprecatedAt: Date
}, {
  timestamps: true
});

// Indexes
PluginSchema.index({ slug: 1 }, { unique: true });
PluginSchema.index({ category: 1 });
PluginSchema.index({ status: 1 });
PluginSchema.index({ 'pricing.type': 1 });
PluginSchema.index({ 'stats.rating': 1 });
PluginSchema.index({ 'stats.downloads': 1 });

// Pre-save hook to generate slug
PluginSchema.pre('save', function(next) {
  if (this.isNew && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model<IPlugin>('Plugin', PluginSchema);
