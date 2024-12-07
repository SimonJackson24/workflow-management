// core/backend/src/services/BillingAdjustmentService.ts

import {
  AdjustmentType,
  AdjustmentTrigger,
  BillingRule,
  AdjustmentResult
} from '../types/billing.types';

export class BillingAdjustmentService {
  private rules: BillingRule[];

  constructor() {
    this.rules = this.loadBillingRules();
  }

  async processAutomaticAdjustments(
    subscriptionId: string,
    trigger: AdjustmentTrigger
  ): Promise<AdjustmentResult> {
    const subscription = await this.getSubscription(subscriptionId);
    const applicableRules = this.findApplicableRules(subscription, trigger);
    
    const adjustments = await Promise.all(
      applicableRules.map(rule => this.applyRule(subscription, rule))
    );

    return this.consolidateAdjustments(adjustments);
  }

  async handleUsageBasedAdjustments(
    subscriptionId: string,
    usageData: any
  ): Promise<void> {
    const thresholds = await this.getUsageThresholds(subscriptionId);
    
    for (const [metric, value] of Object.entries(usageData)) {
      if (this.shouldAdjustForUsage(value, thresholds[metric])) {
        await this.createUsageAdjustment(subscriptionId, metric, value);
      }
    }
  }

  async processProration(
    subscriptionId: string,
    changes: any
  ): Promise<ProratedCharges> {
    const subscription = await this.getSubscription(subscriptionId);
    const currentPeriod = this.getBillingPeriod(subscription);
    
    return {
      credits: await this.calculateCredits(subscription, changes, currentPeriod),
      charges: await this.calculateCharges(subscription, changes, currentPeriod)
    };
  }

  private async applyRule(
    subscription: any,
    rule: BillingRule
  ): Promise<AdjustmentResult> {
    const adjustment = await this.calculateAdjustment(subscription, rule);
    
    if (adjustment.amount !== 0) {
      await this.recordAdjustment(subscription.id, adjustment);
      await this.notifyAdjustment(subscription.id, adjustment);
    }
    
    return adjustment;
  }

  private async calculateAdjustment(
    subscription: any,
    rule: BillingRule
  ): Promise<Adjustment> {
    switch (rule.type) {
      case 'usage_threshold':
        return this.calculateUsageAdjustment(subscription, rule);
      case 'loyalty_discount':
        return this.calculateLoyaltyDiscount(subscription, rule);
      case 'volume_discount':
        return this.calculateVolumeDiscount(subscription, rule);
      case 'seasonal_adjustment':
        return this.calculateSeasonalAdjustment(subscription, rule);
      default:
        throw new Error(`Unknown rule type: ${rule.type}`);
    }
  }

  private async notifyAdjustment(
    subscriptionId: string,
    adjustment: Adjustment
  ): Promise<void> {
    // Notify relevant parties about the adjustment
    await this.notifyCustomer(subscriptionId, adjustment);
    await this.notifyInternal(subscriptionId, adjustment);
    await this.updateBillingSystem(subscriptionId, adjustment);
  }
}
