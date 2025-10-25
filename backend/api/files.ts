import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { setCorsHeaders, handlePreflight } from '../src/config/cors';
import formidable from 'formidable';
import { uploadFile } from '../src/utils/supabase';
import { promises as fs } from 'fs';

// Inline authentication middleware
const authenticateToken = (req: VercelRequest): string | null => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

const prisma = new PrismaClient();

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, req.headers.origin);

  if (req.method === 'OPTIONS') {
    handlePreflight(req, res);
    return;
  }

  const { id, action } = req.query;

  const userId = authenticateToken(req);
  console.log('🔐 Auth check:', { 
    userId, 
    hasAuthHeader: !!req.headers.authorization,
    action,
    method: req.method 
  });
  
  if (!userId) {
    console.error('❌ Unauthorized - no valid token');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    if (req.method === 'POST' && action === 'upload') {
      // Handle file upload with formidable
      const form = formidable({
        maxFileSize: 100 * 1024 * 1024, // 100MB for Vercel Pro
      });

      const [fields, files] = await form.parse(req as any);
      
      const name = fields.name?.[0];
      const folderId = fields.folderId?.[0];
      const uploadedFile = files.file?.[0];

      if (!name || !folderId || !uploadedFile) {
        res.status(400).json({ error: 'Name, folderId, and file are required' });
        return;
      }

      // Verify the user has access to the folder
      const folder = await prisma.folder.findFirst({
        where: { 
          id: folderId,
          dataRoom: {
            ownerId: userId
          }
        }
      });

      if (!folder) {
        res.status(404).json({ error: 'Folder not found' });
        return;
      }

      // Check for duplicate file name in same folder
      const existingFile = await prisma.file.findFirst({
        where: {
          name,
          folderId,
        }
      });

      if (existingFile) {
        res.status(409).json({ error: 'A file with this name already exists in this folder' });
        return;
      }

      // Read the file buffer
      const fileBuffer = await fs.readFile(uploadedFile.filepath);
      
      // Upload to Supabase Storage
      const filePath = await uploadFile(fileBuffer, uploadedFile.originalFilename || name);

      // Create file record in database
      const file = await prisma.file.create({
        data: {
          name,
          mimeType: uploadedFile.mimetype || 'application/octet-stream',
          fileSize: BigInt(uploadedFile.size),
          filePath,
          folderId,
          dataRoomId: folder.dataRoomId,
          userId: userId,
        }
      });

      res.status(201).json({
        success: true,
        data: file,
        message: 'File uploaded successfully'
      });

    } else if (req.method === 'POST' && id && typeof id === 'string' && action === 'duplicate') {
      // Duplicate file
      const file = await prisma.file.findFirst({
        where: { 
          id,
          folder: {
            dataRoom: {
              ownerId: userId
            }
          }
        }
      });

      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      // Create duplicate file record
      const duplicateFile = await prisma.file.create({
        data: {
          name: `${file.name} (Copy)`,
          mimeType: file.mimeType,
          fileSize: file.fileSize,
          filePath: file.filePath, // Same file in storage
          folderId: file.folderId,
          dataRoomId: file.dataRoomId,
          userId: userId,
        }
      });

      res.status(201).json({
        success: true,
        data: duplicateFile,
        message: 'File duplicated successfully'
      });

    } else if (req.method === 'PATCH' && id && typeof id === 'string') {
      // Update file
      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const file = await prisma.file.findFirst({
        where: { 
          id,
          folder: {
            dataRoom: {
              ownerId: userId
            }
          }
        }
      });

      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const updatedFile = await prisma.file.update({
        where: { id },
        data: { name }
      });

      res.status(200).json({
        success: true,
        data: updatedFile,
        message: 'File updated successfully'
      });

    } else if (req.method === 'DELETE' && id && typeof id === 'string') {
      // Delete file
      const file = await prisma.file.findFirst({
        where: { 
          id,
          folder: {
            dataRoom: {
              ownerId: userId
            }
          }
        }
      });

      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      await prisma.file.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Files API error:', error);
    setCorsHeaders(res, req.headers.origin);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}
