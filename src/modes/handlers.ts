import { rest } from 'msw';

export const handlers = [
  rest.get('/api/workflows', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          title: 'Sample Workflow',
          description: 'This is a sample workflow',
          status: 'pending',
          assignedTo: 'user1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
    );
  }),
]; 
