// core/backend/src/migrations/examples/AddPluginConfigurationMigration.ts

import { Migration } from '../Migration';
import { Plugin } from '../../models/plugin.model';

export class AddPluginConfigurationMigration extends Migration {
  version = '2024.1.2';
  description = 'Add configuration field to plugins collection';

  async up(): Promise<void> {
    const plugins = await Plugin.find({});
    
    for (const plugin of plugins) {
      plugin.configuration = {
        settings: {},
        schema: this.getDefaultSchema(plugin.type)
      };
      await plugin.save();
    }
  }

  async down(): Promise<void> {
    await Plugin.updateMany({}, { $unset: { configuration: 1 } });
  }

  private getDefaultSchema(pluginType: string): object {
    switch (pluginType) {
      case 'authentication':
        return {
          enabled: { type: 'boolean', default: true },
          providers: { type: 'array', items: { type: 'string' } },
          sessionTimeout: { type: 'number', default: 3600 }
        };
      case 'storage':
        return {
          provider: { type: 'string', enum: ['local', 's3', 'gcs'] },
          bucket: { type: 'string' },
          path: { type: 'string' }
        };
      default:
        return {};
    }
  }
}

// core/backend/src/migrations/examples/UpdateUserPermissionsMigration.ts

export class UpdateUserPermissionsMigration extends Migration {
  version = '2024.1.3';
  description = 'Update user permissions structure';

  async up(): Promise<void> {
    const users = await User.find({});
    
    for (const user of users) {
      // Convert old permissions array to new structure
      const newPermissions = user.permissions.reduce((acc, perm) => {
        const [resource, action] = perm.split(':');
        if (!acc[resource]) acc[resource] = [];
        acc[resource].push(action);
        return acc;
      }, {});

      user.permissions = newPermissions;
      await user.save();
    }
  }

  async down(): Promise<void> {
    const users = await User.find({});
    
    for (const user of users) {
      // Convert back to flat array
      const oldPermissions = Object.entries(user.permissions)
        .reduce((acc, [resource, actions]) => {
          return acc.concat(actions.map(action => `${resource}:${action}`));
        }, []);

      user.permissions = oldPermissions;
      await user.save();
    }
  }
}

// core/backend/src/migrations/examples/AddAuditLogsMigration.ts

export class AddAuditLogsMigration extends Migration {
  version = '2024.1.4';
  description = 'Add audit logs collection and backfill data';

  async up(): Promise<void> {
    // Create audit logs collection with TTL index
    const db = mongoose.connection.db;
    await db.createCollection('auditLogs');
    await db.collection('auditLogs').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days
    );

    // Backfill audit logs from existing data
    const users = await User.find({});
    const auditLogs = [];

    for (const user of users) {
      auditLogs.push({
        action: 'user.created',
        resourceType: 'user',
        resourceId: user._id,
        userId: user._id,
        metadata: {
          email: user.email,
          createdAt: user.createdAt
        },
        createdAt: user.createdAt
      });
    }

    if (auditLogs.length > 0) {
      await db.collection('auditLogs').insertMany(auditLogs);
    }
  }

  async down(): Promise<void> {
    const db = mongoose.connection.db;
    await db.dropCollection('auditLogs');
  }
}
