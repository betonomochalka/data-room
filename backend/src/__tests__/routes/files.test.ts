import request from 'supertest';
import express from 'express';
import { fileRoutes } from '../../routes/files';
import { authenticateToken, generateToken } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use(authenticateToken);
app.use('/files', fileRoutes);

const prisma = new PrismaClient();
let testToken: string;
let testUserId: string;
let testDataRoomId: string;
let testFolderId: string;
let testFileId: string;

describe('File Routes', () => {
  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: 'file-test@example.com' },
      update: {},
      create: {
        email: 'file-test@example.com',
        name: 'File Test User',
      },
    });
    testUserId = user.id;
    testToken = generateToken(user.id);

    // Create a test data room
    const dataRoom = await prisma.dataRoom.create({
      data: {
        name: 'Test Data Room for Files',
        ownerId: testUserId,
      },
    });
    testDataRoomId = dataRoom.id;

    // Create a test folder
    const folder = await prisma.folder.create({
      data: {
        name: 'Test Folder',
        dataRoomId: testDataRoomId,
      },
    });
    testFolderId = folder.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.dataRoom.deleteMany({
      where: { ownerId: testUserId },
    });
    await prisma.$disconnect();
  });

  describe('POST /files/upload', () => {
    it('should reject non-PDF files', async () => {
      const response = await request(app)
        .post('/files/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .field('name', 'Test File')
        .field('folderId', testFolderId)
        .attach('file', Buffer.from('test content'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        });

      expect(response.status).toBe(500); // Multer rejects non-PDF
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/files/upload')
        .field('name', 'Test File')
        .field('folderId', testFolderId);

      expect(response.status).toBe(401);
    });

    it('should require file upload', async () => {
      const response = await request(app)
        .post('/files/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .field('name', 'Test File')
        .field('folderId', testFolderId);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /files', () => {
    it('should get files in a folder', async () => {
      const response = await request(app)
        .get('/files')
        .query({ folderId: testFolderId })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require folderId or dataRoomId', async () => {
      const response = await request(app)
        .get('/files')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(400);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/files')
        .query({ folderId: testFolderId, page: 1, limit: 10 })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });
  });

  describe('GET /files/search', () => {
    it('should search files by name', async () => {
      const response = await request(app)
        .get('/files/search')
        .query({ query: 'test', dataRoomId: testDataRoomId })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require search query', async () => {
      const response = await request(app)
        .get('/files/search')
        .query({ dataRoomId: testDataRoomId })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(400);
    });

    it('should support filtering by file type', async () => {
      const response = await request(app)
        .get('/files/search')
        .query({
          query: 'test',
          dataRoomId: testDataRoomId,
          fileType: 'application/pdf',
        })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
    });

    it('should support date range filtering', async () => {
      const dateFrom = new Date('2024-01-01').toISOString();
      const dateTo = new Date('2024-12-31').toISOString();

      const response = await request(app)
        .get('/files/search')
        .query({
          query: 'test',
          dataRoomId: testDataRoomId,
          dateFrom,
          dateTo,
        })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
    });
  });
});

