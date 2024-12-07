// core/frontend/src/tests/mocks/dashboardServiceMocks.ts

import { rest } from 'msw';
import {
  createMockMetric,
  createMockActivity,
  createMockPlugin,
  createMockUsageData
} from '../utils/dashboardTestUtils';

export const dashboardHandlers = [
  rest.get('/api/dashboard/metrics', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        createMockMetric({ title: 'Active Users' }),
        createMockMetric({ title: 'Storage Used' }),
        createMockMetric({ title: 'API Calls' })
      ])
    );
  }),

  rest.get('/api/dashboard/activities', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(Array.from({ length: 5 }).map(() => createMockActivity()))
    );
  }),

  rest.get('/api/dashboard/plugins', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(Array.from({ length: 3 }).map(() => createMockPlugin()))
    );
  }),

  rest.get('/api/dashboard/usage', (req, res, ctx) => {
    const timeRange = req.url.searchParams.get('timeRange') || '7d';
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1;
    
    return res(
      ctx.status(200),
      ctx.json(createMockUsageData(days))
    );
  })
];
