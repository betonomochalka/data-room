import request from 'supertest';
import express from 'express';
import { folderRoutes } from '../../routes/folders';
import { authenticateToken, generateToken } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(express.json());
app.use(authenticateToken);
app.use('/folders', folderRoutes);

const prisma = new PrismaClient();
let testToken: string;
let testUserId: string;
let testDataRoomId: string;
let testFolderId: string;

describe('Folder Routes', () => {
  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: 'folder-test@example.com' },
      update: {},
      create: {
        email: 'folder-test@example.com',
        name: 'Folder Test User',
      },
    });
    testUserId = user.id;
    testToken = generateToken(user.id);

    // Create a test data room
    const dataRoom = await prisma.dataRoom.create({
      data: {
        name: 'Test Data Room for Folders',
        ownerId: testUserId,
      },
    });
    testDataRoomId = dataRoom.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.dataRoom.deleteMany({
      where: { ownerId: testUserId },
    });
    await prisma.$disconnect();
  });

  describe('POST /folders', () => {
    it('should create a root folder', async () => {
      const response = await request(app)
        .post('/folders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Root Folder',
          dataRoomId: testDataRoomId,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Root Folder');
      expect(response.body.data).toHaveProperty('parentId', null);
      testFolderId = response.body.data.id;
    });

    it('should create a nested folder', async () => {
      const response = await request(app)
        .post('/folders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Nested Folder',
          dataRoomId: testDataRoomId,
          parentId: testFolderId,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('parentId', testFolderId);
    });

    it('should reject duplicate folder names in same location', async () => {
      const response = await request(app)
        .post('/folders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Root Folder',
          dataRoomId: testDataRoomId,
        });

      expect(response.status).toBe(409);
    });

    it('should reject folder creation without auth', async () => {
      const response = await request(app)
        .post('/folders')
        .send({
          name: 'Unauthorized Folder',
          dataRoomId: testDataRoomId,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /folders/:id/contents', () => {
    it('should get folder contents', async () => {
      const response = await request(app)
        .get(`/folders/${testFolderId}/contents`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('folder');
      expect(response.body.data).toHaveProperty('children');
      expect(response.body.data).toHaveProperty('files');
    });

    it('should return 404 for non-existent folder', async () => {
      const response = await request(app)
        .get('/folders/00000000-0000-0000-0000-000000000000/contents')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /folders/:id/tree', () => {
    it('should get folder breadcrumb', async () => {
      const response = await request(app)
        .get(`/folders/${testFolderId}/tree`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentFolder');
      expect(response.body.data).toHaveProperty('breadcrumb');
      expect(Array.isArray(response.body.data.breadcrumb)).toBe(true);
    });
  });

  describe('PUT /folders/:id', () => {
    it('should update folder name', async () => {
      const response = await request(app)
        .put(`/folders/${testFolderId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Updated Folder Name' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('name', 'Updated Folder Name');
    });
  });

  describe('DELETE /folders/:id', () => {
    it('should delete a folder', async () => {
      // Create a folder to delete
      const createResponse = await request(app)
        .post('/folders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'To Be Deleted',
          dataRoomId: testDataRoomId,
        });

      const deleteResponse = await request(app)
        .delete(`/folders/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });
  });
});

