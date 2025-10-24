import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

// Inline CORS headers function
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  setCorsHeaders(res);

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🌱 Seeding database...');

    // Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test' },
      update: {},
      create: {
        email: 'test',
        name: 'Test User',
        password: 'testest', // In production, this would be hashed
      },
    });

    console.log('✅ Test user created:', {
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
    });

    return res.status(200).json({
      success: true,
      message: 'Database seeded successfully!',
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
      },
    });

  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    return res.status(500).json({ 
      error: 'Error seeding database',
      message: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}
