// core/backend/src/utils/database.ts

import mongoose from 'mongoose';
import { logger } from './logger';

export class DatabaseUtils {
  /**
   * Create database indexes
   */
  static async createIndexes(): Promise<void> {
    try {
      const models = mongoose.modelNames();
      for (const modelName of models) {
        const model = mongoose.model(modelName);
        await model.createIndexes();
        logger.info(`Created indexes for model: ${modelName}`);
      }
    } catch (error) {
      logger.error('Error creating indexes:', error);
      throw error;
    }
  }

  /**
   * Validate database connection
   */
  static async validateConnection(): Promise<boolean> {
    try {
      const state = mongoose.connection.readyState;
      if (state !== 1) {
        throw new Error(`Database not connected. State: ${state}`);
      }
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      logger.error('Database validation failed:', error);
      return false;
    }
  }

  /**
   * Backup database
   */
  static async backup(path: string): Promise<void> {
    try {
      const collections = await mongoose.connection.db.collections();
      const backup: Record<string, any[]> = {};

      for (const collection of collections) {
        const documents = await collection.find({}).toArray();
        backup[collection.collectionName] = documents;
      }

      await fs.writeFile(path, JSON.stringify(backup, null, 2));
      logger.info(`Database backup created at: ${path}`);
    } catch (error) {
      logger.error('Backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore database
   */
  static async restore(path: string): Promise<void> {
    try {
      const backup = JSON.parse(await fs.readFile(path, 'utf-8'));

      for (const [collectionName, documents] of Object.entries(backup)) {
        const collection = mongoose.connection.collection(collectionName);
        await collection.deleteMany({});
        if (documents.length > 0) {
          await collection.insertMany(documents);
        }
      }

      logger.info('Database restored successfully');
    } catch (error) {
      logger.error('Restore failed:', error);
      throw error;
    }
  }
}
