import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { setCorsHeaders, handlePreflight } from '../src/config/cors';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, req.headers.origin);

  if (req.method === 'OPTIONS') {
    handlePreflight(req, res);
    return;
  }

  const userId = authenticateToken(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id, action } = req.query;

  try {
    if (req.method === 'POST' && action === 'upload') {
      // Handle file upload
      const { name, folderId } = req.body;

      if (!name || !folderId) {
        res.status(400).json({ error: 'Name and folderId are required' });
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

      // For now, create a placeholder file record
      // In a real implementation, you would handle the actual file upload here
      const file = await prisma.file.create({
        data: {
          name,
          fileType: 'application/pdf', // Default to PDF for now
          size: 0, // Placeholder size
          blobUrl: '', // Placeholder URL
          folderId,
        }
      });

      res.status(201).json({
        success: true,
        data: file,
        message: 'File uploaded successfully'
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
    res.status(500).json({ error: 'Internal server error' });
  }
}
