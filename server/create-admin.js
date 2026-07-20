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
    const existing = await prisma.adminUser.findUnique({ where: { username } });

    if (existing) {
      console.log(`[Admin Setup] Admin user '${username}' already exists – skipping creation.`);
      console.log('[Admin Setup] Verified:', {
        id: existing.id,
        username: existing.username,
        active: existing.active,
        database: process.env.DATABASE_URL,
      });
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      const admin = await prisma.adminUser.create({
        data: { username, passwordHash, name, role: 'admin', active: true },
      });
      console.log(`[Admin Setup] Admin user '${admin.username}' created successfully.`);
      console.log('[Admin Setup] Verified:', {
        id: admin.id,
        username: admin.username,
        active: admin.active,
        database: process.env.DATABASE_URL,
      });
    }
  } catch (error) {
    console.error('[Admin Setup] Fatal Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();