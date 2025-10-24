import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
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

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });