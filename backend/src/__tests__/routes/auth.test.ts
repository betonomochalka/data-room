import request from 'supertest';
import express from 'express';
import { authRoutes } from '../../routes/auth';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

const prisma = new PrismaClient();

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Clear test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'test@example.com' } },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should reject signup with existing email', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User 2',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should reject signup with invalid email', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should reject signup with short password', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: '12345',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/signin', () => {
    it('should sign in with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
    });

    it('should reject signin with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject signin with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });
  });
});

