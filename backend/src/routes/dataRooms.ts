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
const validateCreateDataRoom = [
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
];

const validateUpdateDataRoom = [
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
];

const validateQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

// Get all data rooms for the authenticated user
router.get('/', validateQuery, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [dataRooms, total] = await Promise.all([
    prisma.dataRoom.findMany({
      where: { ownerId: req.user!.id },
      include: {
        _count: {
          select: {
            folders: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.dataRoom.count({
      where: { ownerId: req.user!.id },
    }),
  ]);

  res.json({
    success: true,
    data: dataRooms,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}));

// Get a specific data room
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const dataRoom = await prisma.dataRoom.findFirst({
    where: {
      id,
      ownerId: req.user!.id,
    },
    include: {
      folders: {
        where: { parentId: null }, // Only root folders
        include: {
          _count: {
            select: {
              children: true,
              files: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      },
      _count: {
        select: {
          folders: true,
        },
      },
    },
  });

  if (!dataRoom) {
    throw createError('Data room not found', 404);
  }

  res.json({
    success: true,
    data: dataRoom,
  });
}));

// Create a new data room
router.post('/', validateCreateDataRoom, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name } = req.body;

  // Check if data room with same name already exists for this user
  const existingDataRoom = await prisma.dataRoom.findFirst({
    where: {
      name,
      ownerId: req.user!.id,
    },
  });

  if (existingDataRoom) {
    throw createError('Data room with this name already exists', 409);
  }

  const dataRoom = await prisma.dataRoom.create({
    data: {
      name,
      ownerId: req.user!.id,
    },
    include: {
      _count: {
        select: {
          folders: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: dataRoom,
    message: 'Data room created successfully',
  });
}));

// Update a data room
router.put('/:id', validateUpdateDataRoom, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name } = req.body;

  // Check if data room exists and belongs to user
  const existingDataRoom = await prisma.dataRoom.findFirst({
    where: {
      id,
      ownerId: req.user!.id,
    },
  });

  if (!existingDataRoom) {
    throw createError('Data room not found', 404);
  }

  // Check if new name conflicts with existing data room
  if (name && name !== existingDataRoom.name) {
    const conflictingDataRoom = await prisma.dataRoom.findFirst({
      where: {
        name,
        ownerId: req.user!.id,
        id: { not: id },
      },
    });

    if (conflictingDataRoom) {
      throw createError('Data room with this name already exists', 409);
    }
  }

  const dataRoom = await prisma.dataRoom.update({
    where: { id },
    data: {
      ...(name && { name }),
    },
    include: {
      _count: {
        select: {
          folders: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: dataRoom,
    message: 'Data room updated successfully',
  });
}));

// Delete a data room
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if data room exists and belongs to user
  const dataRoom = await prisma.dataRoom.findFirst({
    where: {
      id,
      ownerId: req.user!.id,
    },
  });

  if (!dataRoom) {
    throw createError('Data room not found', 404);
  }

  // Delete data room (cascade will handle folders and files)
  await prisma.dataRoom.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Data room deleted successfully',
  });
}));

export { router as dataRoomRoutes };
