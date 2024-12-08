// src/utils/performance.ts

import { performanceMonitor } from './monitoring';

export const setupPerformanceMonitoring = (): void => {
  performanceMonitor.initialize();
};
