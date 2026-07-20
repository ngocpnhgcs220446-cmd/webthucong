import fs from 'fs';

const PRODUCTION_DATABASE_URL = 'file:/app/data/production.db';

export function validateEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (isProduction && databaseUrl !== PRODUCTION_DATABASE_URL) {
    throw new Error(
      `DATABASE_URL in production must be ${PRODUCTION_DATABASE_URL}. Current value: ${databaseUrl || 'missing'}`
    );
  }

  if (isProduction && (!jwtSecret || jwtSecret.length < 32)) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }

  console.log('[Config] Environment validated:', {
    nodeEnv: process.env.NODE_ENV,
    databaseUrl,
    jwtConfigured: Boolean(jwtSecret),
    jwtLength: jwtSecret?.length || 0,
  });
}

export function prepareDatabaseDirectory() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl === PRODUCTION_DATABASE_URL) {
    fs.mkdirSync('/app/data', {
      recursive: true,
    });

    console.log('[Config] Production database directory ready: /app/data');
  }
}
