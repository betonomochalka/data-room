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

  try {
    if (req.method === 'POST') {
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
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('File upload API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
