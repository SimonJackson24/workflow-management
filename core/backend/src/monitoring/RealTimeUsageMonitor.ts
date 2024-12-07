// core/backend/src/monitoring/RealTimeUsageMonitor.ts

import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import {
  UsageMetric,
  UsageThreshold,
  MonitoringAlert,
  MetricSnapshot
} from '../types/monitoring.types';

export class RealTimeUsageMonitor {
  private readonly eventEmitter: EventEmitter;
  private readonly metrics: Map<string, MetricSnapshot>;
  private readonly thresholds: Map<string, UsageThreshold>;
  private readonly websocketClients: Set<WebSocket>;
  private monitoringInterval: NodeJS.Timer | null;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.metrics = new Map();
    this.thresholds = new Map();
    this.websocketClients = new Set();
    this.monitoringInterval = null;
  }

  async startMonitoring(): Promise<void> {
    this.monitoringInterval = setInterval(
      () => this.checkMetrics(),
      config.monitoring.checkInterval
    );

    await this.initializeWebSocket();
  }

  async trackMetric(
    metricName: string,
    value: number,
    metadata: any = {}
  ): Promise<void> {
    const snapshot: MetricSnapshot = {
      value,
      timestamp: new Date(),
      metadata,
      trend: await this.calculateTrend(metricName, value)
    };

    this.metrics.set(metricName, snapshot);
    await this.checkThresholds(metricName, snapshot);
    this.broadcastMetricUpdate(metricName, snapshot);
  }

  setThreshold(
    metricName: string,
    threshold: UsageThreshold
  ): void {
    this.thresholds.set(metricName, threshold);
  }

  private async checkMetrics(): Promise<void> {
    for (const [metricName, snapshot] of this.metrics) {
      if (this.isStale(snapshot)) {
        await this.handleStaleMetric(metricName, snapshot);
      }

      if (this.isAnomaly(snapshot)) {
        await this.handleAnomaly(metricName, snapshot);
      }
    }
  }

  private async checkThresholds(
    metricName: string,
    snapshot: MetricSnapshot
  ): Promise<void> {
    const threshold = this.thresholds.get(metricName);
    if (!threshold) return;

    if (snapshot.value >= threshold.warning) {
      await this.emitAlert({
        type: 'warning',
        metricName,
        value: snapshot.value,
        threshold: threshold.warning,
        timestamp: new Date()
      });
    }

    if (snapshot.value >= threshold.critical) {
      await this.emitAlert({
        type: 'critical',
        metricName,
        value: snapshot.value,
        threshold: threshold.critical,
        timestamp: new Date()
      });
    }
  }

  private async calculateTrend(
    metricName: string,
    currentValue: number
  ): Promise<number> {
    const history = await this.getMetricHistory(metricName);
    if (history.length < 2) return 0;

    const previousValue = history[history.length - 1].value;
    return ((currentValue - previousValue) / previousValue) * 100;
  }

  private broadcastMetricUpdate(
    metricName: string,
    snapshot: MetricSnapshot
  ): void {
    const update = {
      type: 'metric_update',
      metricName,
      ...snapshot
    };

    this.websocketClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(update));
      }
    });
  }

  private async handleStaleMetric(
    metricName: string,
    snapshot: MetricSnapshot
  ): Promise<void> {
    await this.emitAlert({
      type: 'stale_metric',
      metricName,
      lastUpdate: snapshot.timestamp,
      timestamp: new Date()
    });
  }

  private async handleAnomaly(
    metricName: string,
    snapshot: MetricSnapshot
  ): Promise<void> {
    await this.emitAlert({
      type: 'anomaly',
      metricName,
      value: snapshot.value,
      expectedRange: await this.getExpectedRange(metricName),
      timestamp: new Date()
    });
  }

  private async initializeWebSocket(): Promise<void> {
    const wss = new WebSocket.Server({ port: config.monitoring.wsPort });

    wss.on('connection', (ws) => {
      this.websocketClients.add(ws);

      ws.on('close', () => {
        this.websocketClients.delete(ws);
      });

      // Send initial state
      ws.send(JSON.stringify({
        type: 'initial_state',
        metrics: Array.from(this.metrics.entries())
      }));
    });
  }

  private async emitAlert(alert: MonitoringAlert): Promise<void> {
    this.eventEmitter.emit('alert', alert);
    await this.storeAlert(alert);
    await this.notifyAlert(alert);
  }

  onAlert(handler: (alert: MonitoringAlert) => void): void {
    this.eventEmitter.on('alert', handler);
  }

  async getMetrics(): Promise<Map<string, MetricSnapshot>> {
    return new Map(this.metrics);
  }

  async getThresholds(): Promise<Map<string, UsageThreshold>> {
    return new Map(this.thresholds);
  }

  private isStale(snapshot: MetricSnapshot): boolean {
    const staleThreshold = config.monitoring.staleThreshold;
    const now = new Date();
    return now.getTime() - snapshot.timestamp.getTime() > staleThreshold;
  }

  private isAnomaly(snapshot: MetricSnapshot): boolean {
    // Implement anomaly detection logic
    return false;
  }

  private async getExpectedRange(metricName: string): Promise<[number, number]> {
    // Implement expected range calculation
    return [0, 0];
  }

  private async storeAlert(alert: MonitoringAlert): Promise<void> {
    await prisma.monitoringAlert.create({
      data: alert
    });
  }

  private async notifyAlert(alert: MonitoringAlert): Promise<void> {
    // Implement notification logic (email, Slack, etc.)
  }

  async cleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.websocketClients.forEach(client => {
      client.close();
    });
  }
}
