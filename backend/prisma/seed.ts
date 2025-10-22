import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Example: Create a test user
  // Uncomment if you want to seed test data
  /*
  const user = await prisma.user.upsert({
    where: { email: 'demo@dataroom.com' },
    update: {},
    create: {
      email: 'demo@dataroom.com',
      name: 'Demo User',
    },
  });

  console.log('Created demo user:', user);

  // Create a sample data room
  const dataRoom = await prisma.dataRoom.upsert({
    where: { id: 'demo-data-room-id' },
    update: {},
    create: {
      id: 'demo-data-room-id',
      name: 'Demo Data Room',
      ownerId: user.id,
    },
  });

  console.log('Created demo data room:', dataRoom);

  // Create a sample folder
  const folder = await prisma.folder.create({
    data: {
      name: 'Documents',
      dataRoomId: dataRoom.id,
    },
  });

  console.log('Created demo folder:', folder);
  */

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

