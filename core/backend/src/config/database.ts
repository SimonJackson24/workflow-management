// core/backend/src/config/database.ts

import mongoose from 'mongoose';
import { logger } from '../utils/logger';

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(config: DatabaseConfig): Promise<void> {
    if (this.isConnected) {
      logger.info('Database is already connected');
      return;
    }

    try {
      const defaultOptions: mongoose.ConnectOptions = {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      };

      await mongoose.connect(config.uri, {
        ...defaultOptions,
        ...config.options
      });

      this.isConnected = true;
      logger.info('Database connected successfully');

      mongoose.connection.on('error', (error) => {
        logger.error('Database error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Database disconnected');
        this.isConnected = false;
      });

      // Handle graceful shutdown
      process.on('SIGINT', this.closeConnection.bind(this));
      process.on('SIGTERM', this.closeConnection.bind(this));

    } catch (error) {
      logger.error('Database connection error:', error);
      throw error;
    }
  }

  private async closeConnection(): Promise<void> {
    try {
      await mongoose.connection.close();
      logger.info('Database connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error closing database connection:', error);
      process.exit(1);
    }
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }
}

export const database = Database.getInstance();
