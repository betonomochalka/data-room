import { Request, Response, NextFunction } from 'express';
import { authenticateToken, generateToken } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Middleware', () => {
  let testUserId: string;
  let validToken: string;

  beforeAll(async () => {
    const user = await prisma.user.upsert({
      where: { email: 'middleware-test@example.com' },
      update: {},
      create: {
        email: 'middleware-test@example.com',
        name: 'Middleware Test User',
      },
    });
    testUserId = user.id;
    validToken = generateToken(user.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testUserId);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });
  });

  describe('authenticateToken', () => {
    it('should authenticate with valid token', async () => {
      const req = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      } as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).user).toBeTruthy();
      expect((req as any).user.id).toBe(testUserId);
    });

    it('should reject request without token', async () => {
      const req = {
        headers: {},
      } as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
      }));
    });

    it('should reject request with invalid token', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      } as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
      }));
    });
  });
});

