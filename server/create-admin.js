import './config.js'; // MUST be the first import
import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function createAdmin() {
  const username = process.env.INITIAL_ADMIN_USERNAME?.trim();
  const password = process.env.INITIAL_ADMIN_PASSWORD?.trim();
  const name = process.env.INITIAL_ADMIN_NAME?.trim() || 'Administrator';

  console.log('[Admin Setup] Running create-admin script...');
  console.log('[Database Runtime]', {
    databaseUrl: process.env.DATABASE_URL || null,
  });

  if (!username || !password) {
    console.error('[Admin Setup] Fatal: INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.adminUser.upsert({
      where: { username },
      update: { passwordHash, name, active: true },
      create: { username, passwordHash, name, role: 'admin', active: true },
    });

    console.log(`[Admin Setup] Successfully created or updated admin user: '${admin.username}'`);

    // Verification step
    const verifiedAdmin = await prisma.adminUser.findUnique({
      where: { username },
      select: { id: true, username: true, active: true },
    });

    if (!verifiedAdmin) {
      throw new Error('Admin verification failed immediately after upsert. The record was not saved.');
    }

    console.log('[Admin Setup] Verified:', {
      id: verifiedAdmin.id,
      username: verifiedAdmin.username,
      active: verifiedAdmin.active,
      database: process.env.DATABASE_URL,
    });

  } catch (error) {
    console.error('[Admin Setup] Fatal Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();