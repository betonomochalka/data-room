import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { setCorsHeaders, handlePreflight } from '../src/config/cors';

// Inline authentication middleware
const authenticateToken = (req: VercelRequest): string | null => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔍 Auth header:', authHeader);
  console.log('🔍 Token:', token ? token.substring(0, 20) + '...' : 'null');
  console.log('🔍 JWT_SECRET exists:', !!process.env.JWT_SECRET);

  if (!token) {
    console.log('❌ No token found');
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log('✅ Token valid, userId:', decoded.userId);
    return decoded.userId;
  } catch (error) {
    console.log('❌ Token validation failed:', error);
    return null;
  }
};

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ALWAYS set CORS headers first, no matter what
  try {
    setCorsHeaders(res, req.headers.origin);
  } catch (e) {
    console.error('Failed to set CORS headers:', e);
  }

  // Handle preflight immediately
  if (req.method === 'OPTIONS') {
    return handlePreflight(req, res);
  }

  try {
    const userId = authenticateToken(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id, action } = req.query;

    if (req.method === 'GET' && !id) {
      // Get all data rooms for the user
      const dataRooms = await prisma.dataRoom.findMany({
        where: { ownerId: userId },
        include: {
          _count: {
            select: { folders: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: dataRooms,
        pagination: {
          page: 1,
          limit: 10,
          total: dataRooms.length,
          totalPages: 1
        }
      });

    } else if (req.method === 'POST' && !id) {
      // Create a new data room
      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const dataRoom = await prisma.dataRoom.create({
        data: {
          name,
          ownerId: userId,
        },
        include: {
          _count: {
            select: { folders: true }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: dataRoom,
        message: 'Data room created successfully'
      });

    } else if (req.method === 'GET' && id && typeof id === 'string') {
      // Get specific data room
      const dataRoom = await prisma.dataRoom.findFirst({
        where: { 
          id,
          ownerId: userId 
        },
        include: {
          folders: {
            where: { parentId: null }, // Only root folders
            include: {
              _count: {
                select: { 
                  files: true,
                  children: true 
                }
              }
            }
          }
        }
      });

      if (!dataRoom) {
        res.status(404).json({ error: 'Data room not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: dataRoom
      });

    } else if (req.method === 'DELETE' && id && typeof id === 'string') {
      // Delete data room
      const dataRoom = await prisma.dataRoom.findFirst({
        where: { 
          id,
          ownerId: userId 
        }
      });

      if (!dataRoom) {
        res.status(404).json({ error: 'Data room not found' });
        return;
      }

      await prisma.dataRoom.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Data room deleted successfully'
      });

    } else if (action === 'folders' && id && typeof id === 'string') {
      // Get folders for a data room
      const folders = await prisma.folder.findMany({
        where: { 
          dataRoomId: id,
          dataRoom: {
            ownerId: userId
          }
        },
        include: {
          _count: {
            select: { 
              files: true,
              children: true 
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: folders
      });

    } else if (action === 'files' && id && typeof id === 'string') {
      // Get files for a data room (root level files)
      const files = await prisma.file.findMany({
        where: { 
          folder: {
            dataRoomId: id,
            dataRoom: {
              ownerId: userId
            },
            parentId: null // Only root level files
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: files
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Data rooms API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Ensure CORS headers are set even on error
    try {
      setCorsHeaders(res, req.headers.origin);
    } catch (e) {
      // Ignore
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
