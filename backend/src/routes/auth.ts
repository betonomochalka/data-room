import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Simple test authentication
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  console.log('[Auth] Test login attempt for email:', email);

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  // Check password (for test user, we'll use a simple comparison)
  // In production, you'd use bcrypt to compare hashed passwords
  const isValidPassword = password === 'testest' && email === 'test';
  
  if (!isValidPassword) {
    throw createError('Invalid credentials', 401);
  }

  console.log('[Auth] Login successful for user:', user.email);

  // Generate JWT token
  const token = generateToken(user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    },
    message: 'Login successful',
  });
}));

// Get current user
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw createError('Access token required', 401);
  }

  // Verify token and get user
  const jwt = require('jsonwebtoken');
  const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user },
  });
}));

export { router as authRoutes };
