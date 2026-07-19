import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PUBLIC_DOMAIN;
const isProduction = process.env.NODE_ENV === 'production' || isRailway;

// Provide a strict fallback for DATABASE_URL if missing
if (!process.env.DATABASE_URL) {
  if (isProduction) {
    console.warn('[WARNING] DATABASE_URL is missing in production!');
    if (isRailway) {
      if (!fs.existsSync('/app/data')) {
        try {
          fs.mkdirSync('/app/data', { recursive: true });
          console.log('[Setup] Created persistent directory at /app/data');
        } catch (err) {
          console.error('[Config] Fatal: Failed to create /app/data volume directory.', err.message);
          process.exit(1);
        }
      }
      process.env.DATABASE_URL = 'file:/app/data/production.db';
    } else {
      process.env.DATABASE_URL = 'file:./production.db';
    }
    console.log(`[Auto-Config] Production DATABASE_URL forced to: ${process.env.DATABASE_URL}`);
  } else {
    process.env.DATABASE_URL = 'file:./dev.db';
    console.log(`[Auto-Config] Development DATABASE_URL set to: ${process.env.DATABASE_URL}`);
  }
} else if (isProduction && (!process.env.DATABASE_URL.includes('/app/data/') || process.env.DATABASE_URL.includes('dev.db'))) {
  console.error(`[Config] Fatal: DATABASE_URL in production must point to /app/data/production.db. It is currently: ${process.env.DATABASE_URL}`);
  process.exit(1);
}

try {
  console.log("[Setup] Running database migrations...");
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });

  // Only run seed if explicitly requested via AUTO_SEED=true
  const autoSeedEnabled = process.env.AUTO_SEED === 'true';
  
  if (autoSeedEnabled) {
    console.log("[Setup] AUTO_SEED=true — running seed...");
    execSync('npm run db:seed', { stdio: 'inherit', env: process.env });
    execSync('node server/populate_rich_data.js', { stdio: 'inherit', env: process.env });
  } else {
    console.log("[Setup] Skipping auto-seed (set AUTO_SEED=true to enable).");
  }

  console.log("[Setup] Starting application server...");
  await import('./index.js');
} catch (error) {
  console.error("[Setup] Fatal Error during startup:", error.message);
  process.exit(1);
}
