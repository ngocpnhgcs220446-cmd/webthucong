# Experience Studio — Workshop / Travel / Online Experience Platform

A full React + Vite business website for a real workshop / travel experience / online workshop / DIY kit company.

The project is designed for **lead generation**: users browse services, click booking/inquiry, submit a form, and the sales team follows up using the built-in mini-CRM dashboard.

---

## 1. Project Overview

This project is a single full-stack MVP ready for production. 
**Note:** There is ONLY ONE main frontend app. There is no separate `admin/` folder. All admin features are tightly integrated into the main app via `/admin/*` routes.

- **Frontend**: React, Vite, React Router DOM, Lucide React, CSS responsive design.
- **Backend**: Express.js (runs on port 5001).
- **Database**: Prisma ORM with SQLite (`dev.db`).
- **Admin CMS**: Protected by JWT authentication (`/api/me`). Located inside `src/pages/`.
- **Lead Management**: Full Mini-CRM with filters, status updates, internal notes, and CSV export.

---

## 2. Folder Structure

```text
experience-platform/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets and uploaded images
├── server/
│   ├── index.js             # Express backend server
│   ├── email.js             # Email notification helper
│   └── seed.js              # Database seed script
└── src/
    ├── App.jsx              # Routing & ProtectedRoute
    ├── components/          # Reusable UI components
    ├── context/             # AuthContext for JWT validation
    ├── data/                # Static fallback data
    ├── pages/               # React pages (Home, Services, Contact, etc.)
    └── utils/               # Helpers (apiFetch, analytics)
```

---

## 3. How to Setup and Run Locally

Follow these steps to clean-install and start the project:

### Local Development
```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### Production Build & Start
```bash
npm run build
NODE_ENV=production npm start
```
Open `http://localhost:5001` in your browser. (Express will serve the built React app from `/dist`).

### What NOT to commit/send:
Do not upload the following files/folders to version control or production servers:
- `node_modules`
- `dist`
- `.env`
- `*.db` (e.g. `dev.db`)

### Deploy Render/Railway:
- **Build command:** `npm install && npm run db:generate && npm run build`
- **Start command:** `npm start`
- **Environment variables:**
  - `NODE_ENV=production`
  - `PORT=5001`
  - `DATABASE_URL=file:./dev.db`
  - `ADMIN_USERNAME=admin`
  - `ADMIN_PASSWORD=<strong-password>`
  - `JWT_SECRET=<long-random-secret>`
  - `SMTP_*` (optional for emails)
  - `CLOUDINARY_URL` (optional for image uploads)

> **Note:** SQLite is only good for MVP/low traffic. If deployed to serverless environments (Vercel/Netlify), local file uploads (`public/pics`) will reset; you MUST use Cloudinary.

---

## 4. API Overview

**Public APIs (No token required)**
- `GET /api/services` - List all services
- `GET /api/services/:slug` - Get single service
- `POST /api/leads` - Create a new booking inquiry (triggers email notification)
- `POST /api/login` - Authenticate admin, returns JWT
- `GET /api/settings` - Get homepage settings
- `GET /api/testimonials`, `GET /api/partners`, `GET /api/posts`

**Admin APIs (Require Authorization: Bearer <token>)**
- `GET /api/me` - Verify JWT token validity
- `GET /api/leads` - List leads with filters (`status`, `q`, `from`, `to`)
- `GET /api/leads/export` - Export leads to CSV
- `PUT /api/leads/:id` - Update lead status, internal notes, assigned to
- `POST /api/services`, `PUT /api/services/:id`, `DELETE /api/services/:id`
- `POST /api/upload` - Upload images (Max 5MB)
- `PUT /api/settings` - Update homepage layout

---

## 5. Production Notes

Before going live with real traffic:
1. **Change Secrets**: Update `ADMIN_PASSWORD` and `JWT_SECRET` in `.env`.
2. **Database Limitation**: SQLite is only good for low-traffic sites. For high traffic, change `provider = "sqlite"` to `"postgresql"` in `schema.prisma` and use a cloud DB like Supabase.
3. **File Uploads**: The current `/api/upload` saves files locally to `public/pics`. This works fine on a VPS, but **will break** if deployed to serverless environments (Vercel/Netlify). You MUST modify `server/index.js` to use Cloudinary, AWS S3, or Cloudflare R2 for uploads.

---

## 6. Troubleshooting

- **Build / Rolldown / Vite Error**: "Cannot find module @rolldown/binding...". 
  **Fix**: Delete `node_modules` and `package-lock.json`, then run `npm install`. This happens when cloning from a different OS.
- **Prisma Error**: "Table not found" or "Client is out of date". 
  **Fix**: Run `npm run db:generate` followed by `npm run db:push`.
