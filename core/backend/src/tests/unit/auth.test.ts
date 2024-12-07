// core/backend/src/tests/unit/auth.test.ts

import { AuthService } from '../../services/AuthService';
import { UserService } from '../../services/UserService';
import { mockUser, mockToken } from '../mocks/auth.mock';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    authService = new AuthService(userService);
  });

  describe('login', () => {
    it('should return user and token on successful login', async () => {
      const result = await authService.login('test@example.com', 'password123');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });

    it('should throw error on invalid credentials', async () => {
      await expect(
        authService.login('invalid@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});

// core/backend/src/tests/integration/api.test.ts

import request from 'supertest';
import { app } from '../../app';
import { setupTestDatabase } from '../utils/testDb';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  describe('Authentication Endpoints', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
    });
  });
});
