// core/frontend/src/services/UserAnalyticsService.ts

import { 
  UserAnalytics,
  UserSegment,
  UserBehavior,
  UserMetrics,
  TimeRange 
} from '../types/analytics.types';

export class UserAnalyticsService {
  async getUserAnalytics(timeRange: TimeRange): Promise<UserAnalytics> {
    const [
      metrics,
      segments,
      behavior,
      retention
    ] = await Promise.all([
      this.getUserMetrics(timeRange),
      this.getUserSegments(timeRange),
      this.getUserBehavior(timeRange),
      this.getRetentionData(timeRange)
    ]);

    return {
      metrics,
      segments,
      behavior,
      retention
    };
  }

  private async getUserMetrics(timeRange: TimeRange): Promise<UserMetrics> {
    const response = await api.get('/api/analytics/users/metrics', {
      params: {
        startDate: timeRange.start,
        endDate: timeRange.end
      }
    });

    return {
      totalUsers: response.data.totalUsers,
      activeUsers: response.data.activeUsers,
      newUsers: response.data.newUsers,
      churnedUsers: response.data.churnedUsers,
      growth: this.calculateGrowthRate(response.data),
      engagementScore: this.calculateEngagementScore(response.data)
    };
  }

  private async getUserSegments(timeRange: TimeRange): Promise<UserSegment[]> {
    const response = await api.get('/api/analytics/users/segments', {
      params: {
        startDate: timeRange.start,
        endDate: timeRange.end
      }
    });

    return response.data.map((segment: any) => ({
      id: segment.id,
      name: segment.name,
      size: segment.size,
      characteristics: segment.characteristics,
      behavior: this.analyzeBehavior(segment.behavior),
      value: this.calculateSegmentValue(segment)
    }));
  }

  private async getUserBehavior(timeRange: TimeRange): Promise<UserBehavior> {
    const response = await api.get('/api/analytics/users/behavior', {
      params: {
        startDate: timeRange.start,
        endDate: timeRange.end
      }
    });

    return {
      sessionMetrics: this.processSessionMetrics(response.data.sessions),
      featureUsage: this.processFeatureUsage(response.data.features),
      userFlow: this.processUserFlow(response.data.flow),
      interactions: this.processInteractions(response.data.interactions)
    };
  }

  private async getRetentionData(timeRange: TimeRange): Promise<any> {
    const response = await api.get('/api/analytics/users/retention', {
      params: {
        startDate: timeRange.start,
        endDate: timeRange.end
      }
    });

    return {
      retentionCurve: this.calculateRetentionCurve(response.data),
      cohortAnalysis: this.analyzeCohorts(response.data),
      churnPrediction: this.predictChurn(response.data)
    };
  }

  private calculateGrowthRate(data: any): number {
    const previousUsers = data.historicalUsers[data.historicalUsers.length - 2];
    const currentUsers = data.historicalUsers[data.historicalUsers.length - 1];
    return ((currentUsers - previousUsers) / previousUsers) * 100;
  }

  private calculateEngagementScore(data: any): number {
    const weights = {
      sessionLength: 0.3,
      actionsPerSession: 0.3,
      returnRate: 0.4
    };

    return (
      data.avgSessionLength * weights.sessionLength +
      data.avgActionsPerSession * weights.actionsPerSession +
      data.returnRate * weights.returnRate
    );
  }

  private analyzeBehavior(behaviorData: any): any {
    return {
      frequency: this.calculateFrequency(behaviorData),
      recency: this.calculateRecency(behaviorData),
      intensity: this.calculateIntensity(behaviorData)
    };
  }

  private calculateSegmentValue(segment: any): number {
    return (
      segment.averageRevenue *
      segment.size *
      segment.retentionRate
    );
  }

  private processSessionMetrics(sessions: any): any {
    return {
      averageDuration: this.calculateAverageDuration(sessions),
      bounceRate: this.calculateBounceRate(sessions),
      pageViews: this.aggregatePageViews(sessions)
    };
  }

  private processFeatureUsage(features: any): any {
    return {
      popularFeatures: this.rankFeatures(features),
      featureAdoption: this.calculateAdoptionRates(features),
      featureCorrelation: this.analyzeFeatureCorrelation(features)
    };
  }

  private processUserFlow(flow: any): any {
    return {
      pathAnalysis: this.analyzePaths(flow),
      dropoffPoints: this.identifyDropoffPoints(flow),
      conversions: this.trackConversions(flow)
    };
  }

  private processInteractions(interactions: any): any {
    return {
      clickPatterns: this.analyzeClickPatterns(interactions),
      timeOnPage: this.calculateTimeOnPage(interactions),
      scrollDepth: this.analyzeScrollDepth(interactions)
    };
  }

  private calculateRetentionCurve(data: any): any {
    return {
      daily: this.calculateDailyRetention(data),
      weekly: this.calculateWeeklyRetention(data),
      monthly: this.calculateMonthlyRetention(data)
    };
  }

  private analyzeCohorts(data: any): any {
    return {
      retentionMatrix: this.createRetentionMatrix(data),
      behaviorPatterns: this.analyzeCohortBehavior(data),
      valueMetrics: this.calculateCohortValue(data)
    };
  }

  private predictChurn(data: any): any {
    return {
      riskScores: this.calculateChurnRisk(data),
      indicators: this.identifyChurnIndicators(data),
      prevention: this.generateChurnPreventionStrategies(data)
    };
  }
}
