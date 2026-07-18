import { execSync } from 'child_process';
import path from 'path';

// Provide a smart fallback for DATABASE_URL if missing on deployment platforms
if (!process.env.DATABASE_URL) {
  const dbPath = process.env.NODE_ENV === 'production' 
    ? 'file:/app/data/production.db' 
    : 'file:./dev.db';
  process.env.DATABASE_URL = dbPath;
  console.log(`[Auto-Config] Environment variable DATABASE_URL was missing. Automatically set to: ${dbPath}`);
}

try {
  console.log("[Setup] Running database migrations...");
  // Pass the updated environment variables to the child process
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
  
  console.log("[Setup] Starting application server...");
  // Dynamically import the main server entry
  await import('./index.js');
} catch (error) {
  console.error("[Setup] Fatal Error during startup:", error.message);
  process.exit(1);
}
