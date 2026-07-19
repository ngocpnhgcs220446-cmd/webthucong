import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Provide a smart fallback for DATABASE_URL if missing
if (!process.env.DATABASE_URL) {
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PUBLIC_DOMAIN;
  let dbPath = 'file:./dev.db';
  if (isRailway) {
    if (!fs.existsSync('/app/data')) {
      try {
        fs.mkdirSync('/app/data', { recursive: true });
        console.log('[Setup] Created persistent directory at /app/data');
      } catch (err) {
        console.warn('[WARNING] Failed to create /app/data. Using ephemeral database.');
      }
    }
    
    if (fs.existsSync('/app/data')) {
      dbPath = 'file:/app/data/production.db';
    } else {
      console.warn('[WARNING] Persistent volume at /app/data not found! Using ephemeral database ./production.db. Data will be lost on redeploy.');
      dbPath = 'file:./production.db';
    }
  } else if (process.env.NODE_ENV === 'production') {
    dbPath = 'file:./production.db';
  }
  process.env.DATABASE_URL = dbPath;
  console.log(`[Auto-Config] DATABASE_URL set to: ${dbPath}`);
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
