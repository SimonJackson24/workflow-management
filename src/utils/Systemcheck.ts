import os from 'os';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';
import { testConnection } from './database';

const execAsync = promisify(exec);

export interface SystemRequirements {
  node: RequirementCheck;
  memory: RequirementCheck;
  disk: RequirementCheck;
  permissions: RequirementCheck;
  dependencies: RequirementCheck;
  network: RequirementCheck;
}

interface RequirementCheck {
  passed: boolean;
  current: string | number;
  required: string | number;
  message?: string;
}

export const systemCheck = async (): Promise<SystemRequirements> => {
  const requirements: SystemRequirements = {
    node: await checkNodeVersion(),
    memory: await checkMemory(),
    disk: await checkDiskSpace(),
    permissions: await checkPermissions(),
    dependencies: await checkDependencies(),
    network: await checkNetwork()
  };

  return requirements;
};

const checkNodeVersion = async (): Promise<RequirementCheck> => {
  const required = '14.0.0';
  const current = process.version.slice(1);
  
  return {
    passed: compareVersions(current, required) >= 0,
    current,
    required,
    message: `Node.js ${required} or higher is required`
  };
};

const checkMemory = async (): Promise<RequirementCheck> => {
  const totalMem = os.totalmem();
  const requiredMem = 1024 * 1024 * 1024; // 1GB

  return {
    passed: totalMem >= requiredMem,
    current: Math.floor(totalMem / 1024 / 1024),
    required: Math.floor(requiredMem / 1024 / 1024),
    message: 'Minimum 1GB of RAM required'
  };
};

// Add more utility functions for system checks...
