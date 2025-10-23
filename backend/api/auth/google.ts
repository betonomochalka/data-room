import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../../src/middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { supabaseUser } = req.body;

    if (!supabaseUser || !supabaseUser.id || !supabaseUser.email) {
      return res.status(400).json({ error: 'Invalid user data from Supabase' });
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

    return res.status(200).json({
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

  } catch (error: any) {
    console.error('[Auth] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}
