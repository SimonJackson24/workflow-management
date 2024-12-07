// core/frontend/src/mocks/handlers.ts

import { rest } from 'msw';

export const handlers = [
  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      })
    );
  }),

  rest.get('/api/organizations', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'Test Organization',
          // ... other organization fields
        },
      ])
    );
  }),

  // Add more API mocks as needed
];
