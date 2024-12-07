// core/backend/src/utils/databaseMonitoring.ts

import mongoose from 'mongoose';
import { logger } from './logger';
import { metrics } from './metrics';

export class DatabaseMonitoring {
  private static instance: DatabaseMonitoring;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): DatabaseMonitoring {
    if (!DatabaseMonitoring.instance) {
      DatabaseMonitoring.instance = new DatabaseMonitoring();
    }
    return DatabaseMonitoring.instance;
  }

  public startMonitoring(intervalMs: number = 60000): void {
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
    }, intervalMs);
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private async collectMetrics(): Promise<void> {
    try {
      const db = mongoose.connection.db;
      
      // Collect server status
      const serverStatus = await db.command({ serverStatus: 1 });
      metrics.gauge('mongodb.connections.current', serverStatus.connections.current);
      metrics.gauge('mongodb.connections.available', serverStatus.connections.available);
      metrics.gauge('mongodb.opcounters.query', serverStatus.opcounters.query);
      metrics.gauge('mongodb.opcounters.insert', serverStatus.opcounters.insert);
      metrics.gauge('mongodb.opcounters.update', serverStatus.opcounters.update);
      metrics.gauge('mongodb.opcounters.delete', serverStatus.opcounters.delete);

      // Collect collection stats
      const collections = await db.collections();
      for (const collection of collections) {
        const stats = await collection.stats();
        metrics.gauge(`mongodb.collection.${collection.collectionName}.size`, stats.size);
        metrics.gauge(`mongodb.collection.${collection.collectionName}.count`, stats.count);
        metrics.gauge(`mongodb.collection.${collection.collectionName}.avgObjSize`, stats.avgObjSize);
      }

      // Log slow queries
      const slowQueries = await db.command({
        profile: -1,
        query: { millis: { $gt: 100 } }
      });
      if (slowQueries.length > 0) {
        logger.warn('Slow queries detected:', slowQueries);
      }

    } catch (error) {
      logger.error('Error collecting database metrics:', error);
    }
  }
}
