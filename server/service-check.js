import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Service DB Check ---');
  console.log('[Service Check] Database:', {
    databaseUrl: process.env.DATABASE_URL,
  });

  const services = await prisma.service.findMany({
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log('[Service Check] Results:', {
    count: services.length,
    services,
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
