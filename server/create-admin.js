import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Admin User Setup ---');
  
  const username = process.env.INITIAL_ADMIN_USERNAME;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const name = process.env.INITIAL_ADMIN_NAME || 'Administrator';

  if (!username || !password) {
    console.error('Error: INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD environment variables are required.');
    process.exit(1);
  }

  if (password.length < 10) {
    console.error('Error: Password must be at least 10 characters long.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { username },
    update: {
      passwordHash,
      name,
      active: true,
      role: 'admin'
    },
    create: {
      username,
      passwordHash,
      name,
      active: true,
      role: 'admin'
    }
  });

  console.log(`Success: Admin user '${admin.username}' has been created/updated.`);
  console.log('You can now log in using this username.');
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
