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
    if (req.method === 'POST' && !id) {
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

      // Check for duplicate folder name in same parent
      const existingFolder = await prisma.folder.findFirst({
        where: {
          name,
          dataRoomId,
          parentId: parentId || null,
        }
      });

      if (existingFolder) {
        res.status(409).json({ error: 'A folder with this name already exists in this location' });
        return;
      }

      const folder = await prisma.folder.create({
        data: {
          name,
          dataRoomId,
          parentId: parentId || null,
          userId: userId,
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

    } else if (req.method === 'GET' && id && typeof id === 'string' && !action) {
      // Get specific folder with its contents
      const folder = await prisma.folder.findFirst({
        where: { 
          id,
          dataRoom: {
            ownerId: userId
          }
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true
            }
          },
          children: {
            include: {
              _count: {
                select: { 
                  files: true,
                  children: true 
                }
              }
            }
          },
          files: true
        }
      });

      if (!folder) {
        res.status(404).json({ error: 'Folder not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: folder
      });

    } else if (req.method === 'POST' && id && typeof id === 'string' && action === 'duplicate') {
      // Duplicate folder
      const folder = await prisma.folder.findFirst({
        where: { 
          id,
          dataRoom: {
            ownerId: userId
          }
        },
        include: {
          files: true,
          children: true
        }
      });

      if (!folder) {
        res.status(404).json({ error: 'Folder not found' });
        return;
      }

      // Create duplicate folder
      const duplicateFolder = await prisma.folder.create({
        data: {
          name: `${folder.name} (Copy)`,
          dataRoomId: folder.dataRoomId,
          parentId: folder.parentId,
          userId: userId,
        }
      });

      res.status(201).json({
        success: true,
        data: duplicateFolder,
        message: 'Folder duplicated successfully'
      });

    } else if (req.method === 'PATCH' && id && typeof id === 'string') {
      // Update folder
      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const folder = await prisma.folder.findFirst({
        where: { 
          id,
          dataRoom: {
            ownerId: userId
          }
        }
      });

      if (!folder) {
        res.status(404).json({ error: 'Folder not found' });
        return;
      }

      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: { name },
        include: {
          _count: {
            select: { 
              files: true,
              children: true 
            }
          }
        }
      });

      res.status(200).json({
        success: true,
        data: updatedFolder,
        message: 'Folder updated successfully'
      });

    } else if (req.method === 'DELETE' && id && typeof id === 'string') {
      // Delete folder
      const folder = await prisma.folder.findFirst({
        where: { 
          id,
          dataRoom: {
            ownerId: userId
          }
        }
      });

      if (!folder) {
        res.status(404).json({ error: 'Folder not found' });
        return;
      }

      await prisma.folder.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Folder deleted successfully'
      });

    } else if (action === 'files' && id && typeof id === 'string') {
      // Get files for a folder
      const files = await prisma.file.findMany({
        where: { 
          folderId: id,
          folder: {
            dataRoom: {
              ownerId: userId
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: files
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Folders API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
