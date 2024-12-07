// core/backend/src/migrations/migrationRunner.ts

import { logger } from '../utils/logger';
import { database } from '../config/database';

interface MigrationRecord {
  version: string;
  appliedAt: Date;
}

export class MigrationRunner {
  private migrations: Migration[] = [];

  constructor(private collection: string = 'migrations') {}

  register(migration: Migration): void {
    this.migrations.push(migration);
  }

  async run(): Promise<void> {
    const db = database.getConnection();
    const appliedMigrations = await db.collection(this.collection)
      .find()
      .toArray();

    const pendingMigrations = this.migrations.filter(migration => 
      !appliedMigrations.find(m => m.version === migration.version)
    );

    for (const migration of pendingMigrations) {
      try {
        await migration.execute('up');
        await db.collection(this.collection).insertOne({
          version: migration.version,
          appliedAt: new Date()
        });
      } catch (error) {
        logger.error(`Migration ${migration.version} failed:`, error);
        throw error;
      }
    }
  }

  async rollback(steps: number = 1): Promise<void> {
    const db = database.getConnection();
    const appliedMigrations = await db.collection(this.collection)
      .find()
      .sort({ appliedAt: -1 })
      .limit(steps)
      .toArray();

    for (const record of appliedMigrations) {
      const migration = this.migrations.find(m => m.version === record.version);
      if (migration) {
        try {
          await migration.execute('down');
          await db.collection(this.collection).deleteOne({
            version: migration.version
          });
        } catch (error) {
          logger.error(`Rollback ${migration.version} failed:`, error);
          throw error;
        }
      }
    }
  }
}
