// core/backend/src/migrations/Migration.ts

import { logger } from '../utils/logger';

export abstract class Migration {
  abstract version: string;
  abstract description: string;

  abstract up(): Promise<void>;
  abstract down(): Promise<void>;

  async execute(direction: 'up' | 'down'): Promise<void> {
    try {
      logger.info(`Running migration ${this.version} ${direction}: ${this.description}`);
      
      if (direction === 'up') {
        await this.up();
      } else {
        await this.down();
      }

      logger.info(`Migration ${this.version} ${direction} completed successfully`);
    } catch (error) {
      logger.error(`Migration ${this.version} ${direction} failed:`, error);
      throw error;
    }
  }
}

// Example migration:
export class AddUserRolesMigration extends Migration {
  version = '2024.1.1';
  description = 'Add roles field to users collection';

  async up(): Promise<void> {
    const users = await mongoose.model('User').find({});
    
    for (const user of users) {
      user.roles = user.roles || ['user'];
      await user.save();
    }
  }

  async down(): Promise<void> {
    await mongoose.model('User').updateMany({}, { $unset: { roles: 1 } });
  }
}
