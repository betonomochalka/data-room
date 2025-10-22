import request from 'supertest';
import express from 'express';
import { dataRoomRoutes } from '../../routes/dataRooms';
import { authenticateToken, generateToken } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.json());
app.use(authenticateToken);
app.use('/data-rooms', dataRoomRoutes);

const prisma = new PrismaClient();
let testToken: string;
let testUserId: string;
let testDataRoomId: string;

describe('Data Room Routes', () => {
  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: 'dataroom-test@example.com' },
      update: {},
      create: {
        email: 'dataroom-test@example.com',
        name: 'Data Room Test User',
      },
    });
    testUserId = user.id;
    testToken = generateToken(user.id);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.dataRoom.deleteMany({
      where: { ownerId: testUserId },
    });
    await prisma.$disconnect();
  });

  describe('POST /data-rooms', () => {
    it('should create a new data room', async () => {
      const response = await request(app)
        .post('/data-rooms')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Test Data Room' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Test Data Room');
      testDataRoomId = response.body.data.id;
    });

    it('should reject creation with duplicate name', async () => {
      const response = await request(app)
        .post('/data-rooms')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Test Data Room' });

      expect(response.status).toBe(409);
    });

    it('should reject creation without name', async () => {
      const response = await request(app)
        .post('/data-rooms')
        .set('Authorization', `Bearer ${testToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject creation without auth token', async () => {
      const response = await request(app)
        .post('/data-rooms')
        .send({ name: 'Unauthorized Data Room' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /data-rooms', () => {
    it('should get all data rooms for user', async () => {
      const response = await request(app)
        .get('/data-rooms')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/data-rooms?page=1&limit=10')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });
  });

  describe('GET /data-rooms/:id', () => {
    it('should get a specific data room', async () => {
      const response = await request(app)
        .get(`/data-rooms/${testDataRoomId}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testDataRoomId);
    });

    it('should return 404 for non-existent data room', async () => {
      const response = await request(app)
        .get('/data-rooms/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /data-rooms/:id', () => {
    it('should update data room name', async () => {
      const response = await request(app)
        .put(`/data-rooms/${testDataRoomId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Updated Data Room' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('name', 'Updated Data Room');
    });
  });

  describe('DELETE /data-rooms/:id', () => {
    it('should delete a data room', async () => {
      // Create a data room to delete
      const createResponse = await request(app)
        .post('/data-rooms')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'To Be Deleted' });

      const deleteResponse = await request(app)
        .delete(`/data-rooms/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });
  });
});

