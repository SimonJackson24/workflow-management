// core/frontend/src/tests/utils/dashboardTestUtils.ts

import { MetricData, Activity, Plugin, UsageDataPoint } from '../../types/dashboard.types';

export const createMockMetric = (overrides?: Partial<MetricData>): MetricData => ({
  id: `metric-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Metric',
  value: 100,
  change: 5.5,
  icon: 'TestIcon',
  color: '#1976d2',
  description: 'Test Description',
  format: 'number',
  ...overrides
});

export const createMockActivity = (overrides?: Partial<Activity>): Activity => ({
  id: `activity-${Math.random().toString(36).substr(2, 9)}`,
  type: 'user',
  action: 'Test Action',
  description: 'Test Description',
  timestamp: new Date(),
  user: {
    id: 'user-1',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg'
  },
  ...overrides
});

export const createMockPlugin = (overrides?: Partial<Plugin>): Plugin => ({
  id: `plugin-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Plugin',
  description: 'Test Description',
  version: '1.0.0',
  status: 'active',
  lastUpdated: new Date(),
  author: {
    id: 'author-1',
    name: 'Test Author',
    email: 'test@example.com'
  },
  category: 'test',
  ...overrides
});

export const createMockUsageData = (
  days: number = 7,
  overrides?: Partial<UsageDataPoint>
): UsageDataPoint[] => {
  return Array.from({ length: days }).map((_, index) => ({
    timestamp: new Date(Date.now() - (days - index) * 24 * 60 * 60 * 1000).toISOString(),
    users: Math.floor(Math.random() * 1000),
    storage: Math.floor(Math.random() * 100),
    apiCalls: Math.floor(Math.random() * 10000),
    ...overrides
  }));
};
