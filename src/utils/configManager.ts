import fs from 'fs-extra';
import path from 'path';
import { encrypt, decrypt } from './encryption';

export class ConfigManager {
  private configPath: string;
  private encryptionKey: string;

  constructor() {
    this.configPath = path.join(__dirname, '../../config');
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key';
  }

  async saveConfig(config: Record<string, any>): Promise<void> {
    // Encrypt sensitive data
    const sensitiveData = ['emailSettings', 'secretKey'];
    const processedConfig = { ...config };

    for (const key of sensitiveData) {
      if (processedConfig[key]) {
        processedConfig[key] = encrypt(
          JSON.stringify(processedConfig[key]),
          this.encryptionKey
        );
      }
    }

    await fs.ensureDir(this.configPath);
    await fs.writeJSON(
      path.join(this.configPath, 'config.json'),
      processedConfig,
      { spaces: 2 }
    );
  }

  // Add more configuration management methods...
}
