import { execSync } from 'child_process';
import path from 'path';

// Provide a smart fallback for DATABASE_URL if missing
if (!process.env.DATABASE_URL) {
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PUBLIC_DOMAIN;
  let dbPath = 'file:./dev.db';
  if (isRailway) {
    dbPath = 'file:/app/data/production.db';
  } else if (process.env.NODE_ENV === 'production') {
    dbPath = 'file:./production.db';
  }
  process.env.DATABASE_URL = dbPath;
  console.log(`[Auto-Config] Environment variable DATABASE_URL was missing. Automatically set to: ${dbPath}`);
}

try {
  console.log("[Setup] Running database migrations...");
  // Pass the updated environment variables to the child process
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
  
  console.log("[Setup] Running auto-seeding (safe mode)...");
  execSync('npm run db:seed', { stdio: 'inherit', env: process.env });
  execSync('node server/populate_rich_data.js', { stdio: 'inherit', env: process.env });
  
  console.log("[Setup] Starting application server...");
  // Dynamically import the main server entry
  await import('./index.js');
} catch (error) {
  console.error("[Setup] Fatal Error during startup:", error.message);
  process.exit(1);
}
