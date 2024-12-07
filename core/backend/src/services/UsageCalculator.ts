// core/backend/src/services/UsageCalculator.ts

import {
  Usage,
  UsageMetric,
  UsageTier,
  BillingPeriod,
  UsageCharge
} from '../types/billing.types';

export class UsageCalculator {
  private readonly metrics: Map<string, UsageMetric>;
  private readonly tiers: Map<string, UsageTier[]>;

  constructor() {
    this.metrics = new Map();
    this.tiers = new Map();
  }

  async calculateUsage(
    subscriptionId: string,
    period: BillingPeriod
  ): Promise<UsageCharge[]> {
    try {
      // Get all usage records for the period
      const usageRecords = await this.getUsageRecords(subscriptionId, period);
      
      // Calculate charges for each metric
      const charges: UsageCharge[] = [];
      
      for (const [metricId, records] of Object.groupBy(usageRecords, 'metricId')) {
        const metric = this.metrics.get(metricId);
        if (!metric) continue;

        const charge = await this.calculateMetricCharge(metric, records, period);
        charges.push(charge);
      }

      return charges;
    } catch (error) {
      throw new Error(`Failed to calculate usage: ${error.message}`);
    }
  }

  private async calculateMetricCharge(
    metric: UsageMetric,
    records: Usage[],
    period: BillingPeriod
  ): Promise<UsageCharge> {
    const totalUsage = this.aggregateUsage(records, metric.aggregationType);
    const tiers = this.tiers.get(metric.id) || [];
    
    let totalCharge = 0;
    let remainingUsage = totalUsage;

    // Calculate charges based on tiers
    for (const tier of tiers) {
      if (remainingUsage <= 0) break;

      const usageInTier = Math.min(
        remainingUsage,
        tier.max - tier.min
      );

      const tierCharge = this.calculateTierCharge(usageInTier, tier);
      totalCharge += tierCharge;
      remainingUsage -= usageInTier;
    }

    return {
      metricId: metric.id,
      usage: totalUsage,
      amount: totalCharge,
      details: this.generateChargeDetails(totalUsage, tiers),
      period
    };
  }

  private aggregateUsage(records: Usage[], type: string): number {
    switch (type) {
      case 'sum':
        return records.reduce((sum, record) => sum + record.value, 0);
      case 'max':
        return Math.max(...records.map(record => record.value));
      case 'average':
        return records.reduce((sum, record) => sum + record.value, 0) / records.length;
      case 'last':
        return records[records.length - 1]?.value || 0;
      default:
        return 0;
    }
  }

  private calculateTierCharge(usage: number, tier: UsageTier): number {
    switch (tier.type) {
      case 'unit':
        return usage * tier.unitPrice;
      case 'flat':
        return tier.flatPrice;
      case 'package':
        return Math.ceil(usage / tier.packageSize) * tier.packagePrice;
      default:
        return 0;
    }
  }

  private generateChargeDetails(
    totalUsage: number,
    tiers: UsageTier[]
  ): Record<string, any> {
    const details: Record<string, any> = {
      totalUsage,
      tiers: []
    };

    let remainingUsage = totalUsage;

    for (const tier of tiers) {
      if (remainingUsage <= 0) break;

      const usageInTier = Math.min(remainingUsage, tier.max - tier.min);
      const tierCharge = this.calculateTierCharge(usageInTier, tier);

      details.tiers.push({
        min: tier.min,
        max: tier.max,
        usage: usageInTier,
        rate: tier.type === 'unit' ? tier.unitPrice : tier.flatPrice,
        charge: tierCharge
      });

      remainingUsage -= usageInTier;
    }

    return details;
  }

  async getUsageRecords(
    subscriptionId: string,
    period: BillingPeriod
  ): Promise<Usage[]> {
    return await prisma.usage.findMany({
      where: {
        subscriptionId,
        timestamp: {
          gte: period.start,
          lte: period.end
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
  }

  async trackUsage(data: {
    subscriptionId: string;
    metricId: string;
    value: number;
    metadata?: Record<string, any>;
  }): Promise<Usage> {
    return await prisma.usage.create({
      data: {
        subscriptionId: data.subscriptionId,
        metricId: data.metricId,
        value: data.value,
        timestamp: new Date(),
        metadata: data.metadata
      }
    });
  }

  async getMetricSummary(
    subscriptionId: string,
    metricId: string,
    period: BillingPeriod
  ): Promise<any> {
    const records = await this.getUsageRecords(subscriptionId, period);
    const metric = this.metrics.get(metricId);

    if (!metric) {
      throw new Error('Metric not found');
    }

    const totalUsage = this.aggregateUsage(
      records.filter(r => r.metricId === metricId),
      metric.aggregationType
    );

    return {
      metric,
      totalUsage,
      records: records.length,
      firstRecord: records[0]?.timestamp,
      lastRecord: records[records.length - 1]?.timestamp
    };
  }
}
