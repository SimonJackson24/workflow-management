// core/backend/src/services/PluginInstallationTracker.ts

import { EventEmitter } from 'events';
import { InstallationStatus, InstallationStep } from '../types/plugin.types';

export class PluginInstallationTracker extends EventEmitter {
  private status: Map<string, InstallationStatus>;
  private progress: Map<string, number>;
  private steps: InstallationStep[];

  constructor() {
    super();
    this.status = new Map();
    this.progress = new Map();
    this.steps = [
      { id: 'download', weight: 20 },
      { id: 'validate', weight: 10 },
      { id: 'extract', weight: 10 },
      { id: 'dependencies', weight: 20 },
      { id: 'configure', weight: 10 },
      { id: 'install', weight: 20 },
      { id: 'initialize', weight: 10 }
    ];
  }

  startInstallation(pluginId: string): void {
    this.status.set(pluginId, {
      status: 'in_progress',
      currentStep: this.steps[0].id,
      progress: 0,
      startTime: Date.now(),
      error: null
    });
    this.progress.set(pluginId, 0);
    this.emitUpdate(pluginId);
  }

  updateProgress(pluginId: string, step: string, stepProgress: number): void {
    const currentStepIndex = this.steps.findIndex(s => s.id === step);
    if (currentStepIndex === -1) return;

    const previousStepsWeight = this.steps
      .slice(0, currentStepIndex)
      .reduce((sum, s) => sum + s.weight, 0);

    const currentStepWeight = this.steps[currentStepIndex].weight;
    const totalProgress = previousStepsWeight + (currentStepWeight * stepProgress);

    const status = this.status.get(pluginId);
    if (status) {
      status.currentStep = step;
      status.progress = totalProgress;
      this.progress.set(pluginId, totalProgress);
      this.emitUpdate(pluginId);
    }
  }

  completeInstallation(pluginId: string): void {
    const status = this.status.get(pluginId);
    if (status) {
      status.status = 'completed';
      status.progress = 100;
      status.completionTime = Date.now();
      this.emitUpdate(pluginId);
    }
  }

  failInstallation(pluginId: string, error: Error): void {
    const status = this.status.get(pluginId);
    if (status) {
      status.status = 'failed';
      status.error = error.message;
      status.completionTime = Date.now();
      this.emitUpdate(pluginId);
    }
  }

  private emitUpdate(pluginId: string): void {
    const status = this.status.get(pluginId);
    if (status) {
      this.emit('progress', {
        pluginId,
        ...status
      });
    }
  }

  getStatus(pluginId: string): InstallationStatus | null {
    return this.status.get(pluginId) || null;
  }

  clearStatus(pluginId: string): void {
    this.status.delete(pluginId);
    this.progress.delete(pluginId);
  }
}
