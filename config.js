import fs from 'fs';

/**
 * This script centralizes environment configuration, especially for DATABASE_URL.
 * It should be imported at the VERY TOP of any entry-point script (start.js, create-admin.js, etc.)
 * to ensure the environment is correctly configured before any other logic runs.
 */

const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PUBLIC_DOMAIN;
const isProduction = process.env.NODE_ENV === 'production' || isRailway;

// Provide a strict fallback for DATABASE_URL if missing
if (!process.env.DATABASE_URL) {
    if (isProduction) {
        console.warn('[WARNING] DATABASE_URL is missing in production!');
        if (isRailway) {
            const persistentDataDir = '/app/data';
            if (!fs.existsSync(persistentDataDir)) {
                try {
                    fs.mkdirSync(persistentDataDir, { recursive: true });
                    console.log(`[Auto-Config] Created persistent directory at ${persistentDataDir}`);
                } catch (err) {
                    console.error(`[Config] Fatal: Failed to create ${persistentDataDir} volume directory.`, err.message);
                    process.exit(1);
                }
            }
            process.env.DATABASE_URL = `file:${persistentDataDir}/production.db`;
        } else {
            process.env.DATABASE_URL = 'file:./production.db';
        }
        console.log(`[Auto-Config] Production DATABASE_URL forced to: ${process.env.DATABASE_URL}`);
    } else {
        process.env.DATABASE_URL = 'file:./dev.db';
        console.log(`[Auto-Config] Development DATABASE_URL set to: ${process.env.DATABASE_URL}`);
    }
} else if (isProduction && isRailway && !process.env.DATABASE_URL.includes('/app/data/')) {
    console.error(`[Config] Fatal: DATABASE_URL in production on Railway must point to /app/data/production.db. It is currently: ${process.env.DATABASE_URL}`);
    process.exit(1);
}