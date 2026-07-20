import { spawn } from 'node:child_process';
import { validateEnvironment, prepareDatabaseDirectory } from './config.js';

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: process.env,
      shell: false,
    });

    child.on('error', reject);

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function start() {
  try {
    validateEnvironment();
    prepareDatabaseDirectory();

    console.log('[Setup] Running database migrations...');

    await runCommand('npm', ['run', 'db:migrate']);

    // Always run to ensure admin exists on fresh deployments.
    // Safe to run every startup – will skip if admin already exists.
    console.log('[Setup] Ensuring admin user exists...');
    try {
      await runCommand('node', ['server/create-admin.js']);
    } catch (err) {
      console.warn('[Setup] Warning: Admin creation script exited with an error. Continuing anyway.');
    }

    if (process.env.AUTO_SEED === 'true') {
      console.log('[Setup] Running optional seed...');
      await runCommand('npm', ['run', 'db:seed']);
    } else {
      console.log('[Setup] Skipping auto-seed.');
    }

    console.log('[Setup] Starting application server...');

    await import('./index.js');
  } catch (error) {
    console.error('[Startup] Fatal error:', error?.message || error);
    process.exit(1);
  }
}

start();
