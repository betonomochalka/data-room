import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { supabaseAnon } from '../utils/supabase';
import { generateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Google OAuth - Primary authentication method
router.post('/google', asyncHandler(async (req: Request, res: Response) => {
  const { supabaseUser } = req.body;

  if (!supabaseUser || !supabaseUser.id || !supabaseUser.email) {
    throw createError('Invalid user data from Supabase', 400);
  }

  console.log('[Auth] Google OAuth - Processing user:', {
    id: supabaseUser.id,
    email: supabaseUser.email,
    provider: supabaseUser.app_metadata?.provider,
  });

  // Check if user exists in our database
  let user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });

  // Create user if doesn't exist (first-time login)
  if (!user) {
    console.log('[Auth] Creating new user in database');
    user = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || 
              supabaseUser.user_metadata?.name || 
              supabaseUser.email?.split('@')[0] || 
              null,
      },
    });
    console.log('[Auth] User created successfully');
  } else {
    console.log('[Auth] Existing user found');
  }

  // Generate our JWT token
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
    message: 'Google sign in successful',
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
