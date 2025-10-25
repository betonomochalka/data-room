import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateCreateFolder = [
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
  body('dataRoomId').isUUID(),
  body('parentId').optional({ nullable: true }).isUUID(),
];

const validateUpdateFolder = [
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
];

// Get folder contents
router.get('/:id/contents', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { includeFiles = 'true' } = req.query;

  // Verify folder exists and user has access
  const folder = await prisma.folder.findFirst({
    where: {
      id,
      dataRoom: {
        ownerId: req.user!.id,
      },
    },
    include: {
      dataRoom: {
        select: { id: true, name: true },
      },
    },
  });

  if (!folder) {
    throw createError('Folder not found', 404);
  }

  // Get folder contents
  const [children, files] = await Promise.all([
    prisma.folder.findMany({
      where: { parentId: id },
      include: {
        _count: {
          select: {
            children: true,
            files: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    includeFiles === 'true' ? prisma.file.findMany({
      where: { folderId: id },
      orderBy: { name: 'asc' },
    }) : [],
  ]);

  res.json({
    success: true,
    data: {
      folder: {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        dataRoomId: folder.dataRoomId,
        dataRoom: folder.dataRoom,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      },
      children,
      files,
    },
  });
}));

// Get folder tree (for navigation)
router.get('/:id/tree', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Verify folder exists and user has access
  const folder = await prisma.folder.findFirst({
    where: {
      id,
      dataRoom: {
        ownerId: req.user!.id,
      },
    },
    include: {
      dataRoom: {
        select: { id: true, name: true },
      },
    },
  });

  if (!folder) {
    throw createError('Folder not found', 404);
  }

  // Build breadcrumb path
  const buildBreadcrumb = async (folderId: string): Promise<any[]> => {
    const currentFolder = await prisma.folder.findUnique({
      where: { id: folderId },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    if (!currentFolder) return [];

    const breadcrumb = [currentFolder];
    
    if (currentFolder.parentId) {
      const parentBreadcrumb = await buildBreadcrumb(currentFolder.parentId);
      breadcrumb.unshift(...parentBreadcrumb);
    }

    return breadcrumb;
  };

  const breadcrumb = await buildBreadcrumb(id);

  res.json({
    success: true,
    data: {
      currentFolder: {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        dataRoomId: folder.dataRoomId,
        dataRoom: folder.dataRoom,
      },
      breadcrumb,
    },
  });
}));

// Create a new folder
router.post('/', validateCreateFolder, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('[CreateFolder] Validation errors:', errors.array());
    console.error('[CreateFolder] Request body:', req.body);
    throw createError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400);
  }

  const { name, dataRoomId, parentId } = req.body;
  console.log('[CreateFolder] Request:', { name, dataRoomId, parentId, userId: req.user?.id });

  // Verify data room exists and belongs to user
  const dataRoom = await prisma.dataRoom.findFirst({
    where: {
      id: dataRoomId,
      ownerId: req.user!.id,
    },
  });

  if (!dataRoom) {
    throw createError('Data room not found', 404);
  }

  // If parentId is provided, verify parent folder exists and belongs to same data room
  if (parentId) {
    const parentFolder = await prisma.folder.findFirst({
      where: {
        id: parentId,
        dataRoomId,
      },
    });

    if (!parentFolder) {
      throw createError('Parent folder not found', 404);
    }
  }

  // Check if folder with same name already exists in the same location
  const existingFolder = await prisma.folder.findFirst({
    where: {
      name,
      parentId: parentId || null,
      dataRoomId,
    },
  });

  if (existingFolder) {
    throw createError('Folder with this name already exists in this location', 409);
  }

  const folder = await prisma.folder.create({
    data: {
      name,
      parentId: parentId || null,
      dataRoomId,
      userId: req.user!.id,
    },
    include: {
      _count: {
        select: {
          children: true,
          files: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: folder,
    message: 'Folder created successfully',
  });
}));

// Update a folder
router.put('/:id', validateUpdateFolder, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name } = req.body;

  // Verify folder exists and user has access
  const existingFolder = await prisma.folder.findFirst({
    where: {
      id,
      dataRoom: {
        ownerId: req.user!.id,
      },
    },
  });

  if (!existingFolder) {
    throw createError('Folder not found', 404);
  }

  // Check if new name conflicts with existing folder in same location
  if (name && name !== existingFolder.name) {
    const conflictingFolder = await prisma.folder.findFirst({
      where: {
        name,
        parentId: existingFolder.parentId,
        dataRoomId: existingFolder.dataRoomId,
        id: { not: id },
      },
    });

    if (conflictingFolder) {
      throw createError('Folder with this name already exists in this location', 409);
    }
  }

  const folder = await prisma.folder.update({
    where: { id },
    data: {
      ...(name && { name }),
    },
    include: {
      _count: {
        select: {
          children: true,
          files: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: folder,
    message: 'Folder updated successfully',
  });
}));

// Delete a folder
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Verify folder exists and user has access
  const folder = await prisma.folder.findFirst({
    where: {
      id,
      dataRoom: {
        ownerId: req.user!.id,
      },
    },
  });

  if (!folder) {
    throw createError('Folder not found', 404);
  }

  // Delete folder (cascade will handle children and files)
  await prisma.folder.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Folder deleted successfully',
  });
}));

export { router as folderRoutes };
