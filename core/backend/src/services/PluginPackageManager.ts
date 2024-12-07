// core/backend/src/services/PluginPackageManager.ts

import semver from 'semver';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { PluginPackage, VersionInfo } from '../types/plugin.types';
import { logger } from '../utils/logger';

export class PluginPackageManager {
  private readonly packageDir: string;
  private readonly tempDir: string;

  constructor() {
    this.packageDir = path.join(process.cwd(), 'plugins/packages');
    this.tempDir = path.join(process.cwd(), 'plugins/temp');
  }

  async downloadPackage(pluginId: string, version?: string): Promise<PluginPackage> {
    try {
      // 1. Get version info
      const versionInfo = await this.resolveVersion(pluginId, version);
      
      // 2. Check cache
      const cachedPackage = await this.checkCache(pluginId, versionInfo.version);
      if (cachedPackage) {
        return cachedPackage;
      }

      // 3. Download package
      const packageData = await this.fetchPackage(pluginId, versionInfo);

      // 4. Verify package
      await this.verifyPackage(packageData, versionInfo.checksum);

      // 5. Cache package
      await this.cachePackage(pluginId, versionInfo.version, packageData);

      return {
        id: pluginId,
        version: versionInfo.version,
        data: packageData,
        path: await this.extractPackage(packageData)
      };
    } catch (error) {
      logger.error(`Failed to download plugin package ${pluginId}:`, error);
      throw new Error(`Package download failed: ${error.message}`);
    }
  }

  private async resolveVersion(pluginId: string, requestedVersion?: string): Promise<VersionInfo> {
    const versions = await this.fetchAvailableVersions(pluginId);
    
    if (requestedVersion) {
      const matchingVersion = semver.maxSatisfying(
        versions.map(v => v.version),
        requestedVersion
      );
      if (!matchingVersion) {
        throw new Error(`No matching version found for ${requestedVersion}`);
      }
      return versions.find(v => v.version === matchingVersion)!;
    }

    // Get latest stable version
    return versions.reduce((latest, current) => {
      if (!latest || semver.gt(current.version, latest.version)) {
        return current;
      }
      return latest;
    });
  }

  private async fetchAvailableVersions(pluginId: string): Promise<VersionInfo[]> {
    // Implementation to fetch available versions from registry
  }

  private async checkCache(pluginId: string, version: string): Promise<PluginPackage | null> {
    const cachePath = path.join(this.packageDir, `${pluginId}-${version}.zip`);
    try {
      const stats = await fs.stat(cachePath);
      if (stats.isFile()) {
        const data = await fs.readFile(cachePath);
        return {
          id: pluginId,
          version,
          data,
          path: await this.extractPackage(data)
        };
      }
    } catch (error) {
      // Cache miss
    }
    return null;
  }

  private async fetchPackage(pluginId: string, versionInfo: VersionInfo): Promise<Buffer> {
    // Implementation to fetch package from registry
  }

  private async verifyPackage(data: Buffer, expectedChecksum: string): Promise<void> {
    const checksum = createHash('sha256').update(data).digest('hex');
    if (checksum !== expectedChecksum) {
      throw new Error('Package checksum verification failed');
    }
  }

  private async cachePackage(pluginId: string, version: string, data: Buffer): Promise<void> {
    const cachePath = path.join(this.packageDir, `${pluginId}-${version}.zip`);
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.writeFile(cachePath, data);
  }

  private async extractPackage(data: Buffer): Promise<string> {
    // Implementation to extract package to temp directory
  }

  async cleanupPackage(pluginId: string, version: string): Promise<void> {
    // Implementation to clean up temporary files
  }
}
