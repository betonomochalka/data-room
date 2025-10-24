import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError('Access token required', 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError('JWT secret not configured', 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Note: password is intentionally excluded from the user object
      },
    });

    if (!user) {
      throw createError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(createError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw createError('JWT secret not configured', 500);
  }

  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
};
