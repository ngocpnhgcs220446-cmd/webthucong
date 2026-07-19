import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Admin User Check ---');
  console.log('[Admin Check] Database:', {
    databaseUrl: process.env.DATABASE_URL,
  });

  const admins = await prisma.adminUser.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      active: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log('[Admin Check] Results:', {
    count: admins.length,
    admins,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
