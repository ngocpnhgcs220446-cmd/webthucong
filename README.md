# Experience Platform

A complete web platform for managing and booking workshop experiences. Built with Vite, React, Express, and Prisma (SQLite).

## Requirements

- **Node.js**: v20 or higher
- **NPM**: v10 or higher

## Production Deployment Guide

### 1. Clean Installation
Always use a clean install to avoid dependency conflicts:
```bash
npm ci
```

### 2. Environment Variables (.env)
Use `.env.example` as a template for your production `.env` file. Do NOT put your `.env` file in source control or inside a Docker image build step.

```env
NODE_ENV=production
PORT=5001

PUBLIC_SITE_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
TRUST_PROXY=true # If behind Render, Railway, or Nginx

# SQLite Persistence Path
DATABASE_URL="file:/app/data/production.db"

JWT_SECRET=your-very-long-random-secret

# Used ONLY to seed the first AdminUser
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=your-secure-password
INITIAL_ADMIN_NAME=Administrator

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
# MUST be a Google App Password, not your real password
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=your-gmail@gmail.com
ADMIN_NOTIFY_EMAIL=admin@your-domain.com

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Do NOT set this to true in production
ALLOW_DESTRUCTIVE_SEED=false
```

**⚠️ Secret Rotation Warning:**
If you previously uploaded your source code with a `.env` file containing real passwords, you MUST immediately rotate (change) your Google App Password, JWT Secret, Cloudinary Secret, and Admin Password.

### 3. Database Migration (Pre-deploy)
You MUST run migrations against your production database before starting the server.
```bash
npm run db:migrate
```

### 4. Create Production Admin
Create the initial admin user using the script. This relies on the `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD` in your `.env` file:
```bash
npm run admin:create
```
*(The old fallback using `ADMIN_USERNAME` and `ADMIN_PASSWORD` directly is disabled in production for security.)*

### 5. Build and Start
```bash
npm run build
npm start
```

## Docker Deployment

This project includes a multi-stage Dockerfile that builds and runs the application securely.

```bash
docker build -t experience-platform .
docker run -d --name experience-platform \
  -p 5001:5001 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  experience-platform
```

> **Note on Persistence**: Ensure you mount a persistent volume to `/app/data` to prevent your SQLite database (`/app/data/production.db`) from being wiped when the container restarts.

## Cloudinary vs Local Storage

- **Production**: Requires Cloudinary. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. If missing, the API will safely return a 503 error rather than attempting to write to the local disk.
- **Development**: If Cloudinary variables are missing, the server will gracefully fallback to local disk storage (`public/pics`).

## Security Notes
- Never run `npm run db:seed` in production with `ALLOW_DESTRUCTIVE_SEED=true`. It will completely wipe your database.
- Backup your SQLite database regularly by copying the `.db` file.
