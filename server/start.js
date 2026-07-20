import './config.js'; // MUST be the first import
import { execSync } from 'child_process';

try {
  console.log('[Database Runtime]', {
    databaseUrl: process.env.DATABASE_URL || null,
  });
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
