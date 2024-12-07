// core/backend/src/services/plugins/PluginValidator.ts

import { promises as fs } from 'fs';
import path from 'path';
import {
  PluginMetadata,
  ValidationResult,
  SecurityScan
} from '../../types/plugin.types';

export class PluginValidator {
  async validatePlugin(
    pluginDir: string,
    metadata: PluginMetadata
  ): Promise<ValidationResult> {
    const results: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    try {
      // Validate metadata
      await this.validateMetadata(metadata, results);

      // Validate structure
      await this.validateStructure(pluginDir, metadata, results);

      // Validate dependencies
      await this.validateDependencies(metadata, results);

      // Security scan
      const securityResults = await this.performSecurityScan(pluginDir);
      results.security = securityResults;

      // Set final validation status
      results.valid = results.errors.length === 0;

    } catch (error) {
      results.valid = false;
      results.errors.push(`Validation failed: ${error.message}`);
    }

    return results;
  }

  private async validateMetadata(
    metadata: PluginMetadata,
    results: ValidationResult
  ): Promise<void> {
    // Required fields
    if (!metadata.id) {
      results.errors.push('Plugin ID is required');
    }
    if (!metadata.name) {
      results.errors.push('Plugin name is required');
    }
    if (!metadata.version) {
      results.errors.push('Plugin version is required');
    }
    if (!metadata.main) {
      results.errors.push('Plugin main file is required');
    }

    // Version format
    if (!this.isValidVersion(metadata.version)) {
      results.errors.push('Invalid version format');
    }
  }

  private async validateStructure(
    pluginDir: string,
    metadata: PluginMetadata,
    results: ValidationResult
  ): Promise<void> {
    // Check main file exists
    const mainPath = path.join(pluginDir, metadata.main);
    try {
      await fs.access(mainPath);
    } catch {
      results.errors.push(`Main file ${metadata.main} not found`);
    }

    // Check required directories
    const requiredDirs = ['lib', 'config'];
    for (const dir of requiredDirs) {
      try {
        await fs.access(path.join(pluginDir, dir));
      } catch {
        results.warnings.push(`Directory ${dir} not found`);
      }
    }
  }

  private async validateDependencies(
    metadata: PluginMetadata,
    results: ValidationResult
  ): Promise<void> {
    if (!metadata.dependencies) {
      return;
    }

    for (const dep of metadata.dependencies) {
      if (!dep.id) {
        results.errors.push(`Dependency ID is required`);
      }
      if (!dep.version) {
        results.errors.push(`Version is required for dependency ${dep.id}`);
      }
      if (!this.isValidVersion(dep.version)) {
        results.errors.push(`Invalid version format for dependency ${dep.id}`);
      }
    }
  }

  private async performSecurityScan(pluginDir: string): Promise<SecurityScan> {
    // Implement security scanning logic
    return {
      vulnerabilities: [],
      score: 100,
      timestamp: new Date()
    };
  }

  private isValidVersion(version: string): boolean {
    // Implement semver validation
    return /^\d+\.\d+\.\d+$/.test(version);
  }
}
