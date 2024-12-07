import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  organizationId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: Date;
  plugins: string[];
  maxUsers: number;
  features: string[];
}

const SubscriptionSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, required: true, ref: 'Organization' },
  planId: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['active', 'canceled', 'past_due', 'trialing'],
    default: 'trialing'
  },
  stripeCustomerId: { type: String, required: true },
  stripeSubscriptionId: { type: String, required: true },
  currentPeriodEnd: { type: Date, required: true },
  plugins: [{ type: String }],
  maxUsers: { type: Number, required: true },
  features: [{ type: String }]
}, {
  timestamps: true
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
