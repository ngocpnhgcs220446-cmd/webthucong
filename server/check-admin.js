import './config.js'; // MUST be the first import
import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function checkAdmin() {
    console.log('[Admin Check] Running check-admin script...');
    try {
        const admins = await prisma.adminUser.findMany({
            select: {
                id: true,
                username: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        console.log('[Admin Check] Results:', {
            database: process.env.DATABASE_URL,
            count: admins.length,
            admins,
        });
    } catch (error) {
        console.error('[Admin Check] Fatal Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmin();