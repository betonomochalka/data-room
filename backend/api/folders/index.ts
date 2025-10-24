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
      // Create a new folder
      const { name, dataRoomId, parentId } = req.body;

      if (!name || !dataRoomId) {
        res.status(400).json({ error: 'Name and dataRoomId are required' });
        return;
      }

      // Verify the user owns the data room
      const dataRoom = await prisma.dataRoom.findFirst({
        where: { 
          id: dataRoomId,
          ownerId: userId 
        }
      });

      if (!dataRoom) {
        res.status(404).json({ error: 'Data room not found' });
        return;
      }

      const folder = await prisma.folder.create({
        data: {
          name,
          dataRoomId,
          parentId: parentId || null,
        },
        include: {
          _count: {
            select: { 
              files: true,
              children: true 
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: folder,
        message: 'Folder created successfully'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Folders API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
