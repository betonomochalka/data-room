import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Inline CORS headers function
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

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
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const userId = authenticateToken(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'File ID is required' });
    return;
  }

  try {
    if (req.method === 'PATCH') {
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
    } else if (req.method === 'DELETE') {
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
    console.error('File API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
