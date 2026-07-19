import express from 'express';
import cors from 'cors';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import helmet from 'helmet';
import 'dotenv/config';
import { sendAdminLeadNotification, sendCustomerLeadConfirmation, sendCustomerStatusChangeEmail } from './email.js';
import * as valid from './utils/validation.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT || 5001);

const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PUBLIC_DOMAIN);
const isProduction = process.env.NODE_ENV === 'production' || isRailway;

const jwtSecret = process.env.JWT_SECRET?.trim();
if (isProduction && (!jwtSecret || jwtSecret.length < 32)) {
  console.error('[Config] Fatal: JWT_SECRET must be at least 32 characters in production.');
  process.exit(1);
}
console.log('[JWT] Configuration:', {
  configured: Boolean(jwtSecret),
  length: jwtSecret?.length || 0,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function safeJsonParse(value, fallback = []) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('[JSON Parse Warning] Failed to parse:', value);
    return fallback;
  }
}

function ensureJsonString(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify([]);
    }
  }
  return JSON.stringify([]);
}

function validateRequired(data, fields) {
  const errors = {};
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `${field} is required`;
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
}
const trustProxyEnabled = process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true' || isProduction;
app.set('trust proxy', trustProxyEnabled ? 1 : false);

console.log('[Proxy] Configuration:', {
  enabled: trustProxyEnabled,
  value: app.get('trust proxy'),
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// --- CORS Configuration ---
const normalizeOrigin = (value = '') =>
  String(value)
    .trim()
    .replace(/\/+$/, '')
    .toLowerCase();

const allowedOrigins = new Set(
  String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)
);

const publicSiteOrigin = normalizeOrigin(
  process.env.PUBLIC_SITE_URL || ''
);

if (publicSiteOrigin) {
  allowedOrigins.add(publicSiteOrigin);
}

const railwayPublicOrigin = normalizeOrigin(
  process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : ''
);

if (railwayPublicOrigin) {
  allowedOrigins.add(railwayPublicOrigin);
}

console.log('[CORS] Configuration:', {
  allowedOriginsConfigured: Boolean(process.env.ALLOWED_ORIGINS),
  publicSiteUrlConfigured: Boolean(process.env.PUBLIC_SITE_URL),
  railwayPublicDomainConfigured: Boolean(process.env.RAILWAY_PUBLIC_DOMAIN),
  allowedOrigins: [...allowedOrigins],
});

function isSameRuntimeOrigin(req, origin) {
  if (!origin) {
    return true;
  }

  const protocol =
    String(
      req.headers['x-forwarded-proto'] ||
      req.protocol ||
      'https'
    )
      .split(',')[0]
      .trim();

  const host = String(
    req.headers['x-forwarded-host'] ||
    req.headers.host ||
    ''
  )
    .split(',')[0]
    .trim();

  if (!host) {
    return false;
  }

  const runtimeOrigin = normalizeOrigin(`${protocol}://${host}`);
  return normalizeOrigin(origin) === runtimeOrigin;
}

const corsMiddleware = cors((req, callback) => {
  const origin = req.headers.origin;
  const normalizedOrigin = normalizeOrigin(origin);

  const originAllowed =
    !origin ||
    allowedOrigins.has(normalizedOrigin) ||
    isSameRuntimeOrigin(req, origin) ||
    process.env.NODE_ENV !== 'production';

  if (!originAllowed) {
    console.warn('[CORS] Blocked origin:', {
      received: origin,
      normalized: normalizedOrigin,
      runtimeHost: req.headers['x-forwarded-host'] || req.headers.host || null,
      runtimeProto: req.headers['x-forwarded-proto'] || req.protocol || null,
      allowedOrigins: [...allowedOrigins],
    });
  }

  callback(null, {
    origin: originAllowed,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  });
});

// Only apply CORS to API routes — static assets must NEVER go through CORS
app.use('/api', corsMiddleware);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/* 
=========================================================
API DOCUMENTATION & SECURITY RULES
=========================================================
1. PUBLIC APIs (No token required):
   - POST /api/login        (Get admin token)
   - GET /api/services      (List all services)
   - POST /api/leads        (Submit contact form)
   - GET /api/posts         (List all blog posts)
   - GET /api/settings      (Get site settings)
   - GET /api/testimonials  (Get testimonials)
   - GET /api/partners      (Get partner logos)

2. ADMIN APIs (Requires Authorization: Bearer <token>):
   - POST, PUT, DELETE /api/services
   - GET, PUT /api/leads
   - POST, PUT, DELETE /api/posts
   - PUT /api/settings
   - POST, PUT, DELETE /api/testimonials
   - POST, PUT, DELETE /api/partners
   - POST /api/upload
=========================================================
*/

const PICS_DIR = path.join(process.cwd(), 'public/pics');
if (!fs.existsSync(PICS_DIR)) {
  fs.mkdirSync(PICS_DIR, { recursive: true });
}

const uploadLimits = { fileSize: 5 * 1024 * 1024 };
const uploadFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG and WEBP are allowed.'));
  }
};

const cloudinaryCredentialsConfigured =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME?.trim()) &&
  Boolean(process.env.CLOUDINARY_API_KEY?.trim()) &&
  Boolean(process.env.CLOUDINARY_API_SECRET?.trim());

let cloudinaryEnabled = false;

if (cloudinaryCredentialsConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    secure: true,
  });
  cloudinaryEnabled = true;
} else if (process.env.CLOUDINARY_URL) {
  cloudinaryEnabled = true;
}

let upload;
if (cloudinaryEnabled) {
  upload = multer({ storage: multer.memoryStorage(), limits: uploadLimits, fileFilter: uploadFilter });
} else {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, PICS_DIR);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
      const safeExt = path.extname(file.originalname).toLowerCase();
      cb(null, 'upload-' + uniqueSuffix + safeExt);
    }
  });
  upload = multer({ storage, limits: uploadLimits, fileFilter: uploadFilter });
}

function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: options.folder || 'experience-platform/products',
        unique_filename: true,
        overwrite: false,
        transformation: [
          { width: 2000, height: 2000, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) { reject(error); return; }
        if (!result?.secure_url) { reject(new Error('Cloudinary returned an invalid result')); return; }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

async function deleteCloudinaryImage(publicId) {
  if (!cloudinaryEnabled || !publicId) {
    return { result: 'skipped' };
  }
  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Bearer token format' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});


app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

app.post('/api/login', loginRateLimiter, async (req, res) => {
  const rawUsername = req.body.username;
  const username = typeof rawUsername === 'string' ? rawUsername.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  console.log('[Auth] Login request received:', {
    hasUsername: typeof rawUsername === 'string',
    hasPassword: typeof req.body.password === 'string',
  });

  if (!username || !password) {
    console.warn('[Auth] Login rejected:', { username: username || null, reason: 'invalid-payload' });
    return res.status(400).json({
      error: 'Username and password are required',
    });
  }

  const dbUser = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (dbUser) {
    if (!dbUser.active) {
      console.warn('[Auth] Login rejected:', { username, reason: 'admin-inactive' });
      return res.status(401).json({ // Changed to 401 per standard auth practices for invalid credentials
        error: 'Invalid username or password.',
      });
    }

    const passwordValid = await bcrypt.compare(
      password,
      dbUser.passwordHash
    );

    if (!passwordValid) {
      console.warn('[Auth] Login rejected:', { username, reason: 'password-mismatch' });
      return res.status(401).json({
        error: 'Invalid username or password.',
      });
    }

    const token = jwt.sign(
      {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role,
      },
      jwtSecret,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        id: dbUser.id,
        username: dbUser.username,
        name: dbUser.name,
        role: dbUser.role,
      },
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (adminUser && adminPass && username === adminUser && password === adminPass) {
      const token = jwt.sign({ id: 'super-admin', username, role: 'super-admin' }, jwtSecret, { expiresIn: '8h' });
      return res.json({ token, user: { id: 'super-admin', username, role: 'super-admin', name: 'Super Admin' } });
    }
  }

  console.warn('[Auth] Login rejected:', { username, reason: 'admin-not-found' });
  return res.status(401).json({
    error: 'Invalid username or password.',
  });
});

app.get('/api/me', authMiddleware, (req, res) => {
  // authMiddleware sets req.user now, let's make sure it does!
  res.json({ user: req.user });
});

app.post(
  '/api/upload',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Please select an image',
        });
      }

      if (cloudinaryEnabled) {
        const result = await uploadBufferToCloudinary(
          req.file.buffer,
          {
            folder: 'experience-platform/products',
          }
        );

        return res.status(201).json({
          success: true,
          imageUrl: result.secure_url,
          image: {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          },
        });
      }

      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          success: false,
          error: 'Image storage is not configured',
        });
      }

      if (!req.file.filename) {
        throw new Error(
          'Local upload did not produce a filename'
        );
      }

      const localUrl = `/pics/${req.file.filename}`;

      return res.status(201).json({
        success: true,
        imageUrl: localUrl,
        image: {
          url: localUrl,
          publicId: null,
          filename: req.file.filename,
        },
      });
    } catch (error) {
      console.error(
        'Image upload failed:',
        error.message
      );

      return res.status(500).json({
        success: false,
        error: 'Unable to upload image',
      });
    }
  }
);

// Get active services
app.get('/api/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: { packages: true, reviews: true }
    });
    // Parse JSON strings back to arrays
    const formattedServices = services.map(s => ({
      ...s,
      gallery: safeJsonParse(s.gallery),
      highlights: safeJsonParse(s.highlights),
      includes: safeJsonParse(s.includes),
      suitableFor: safeJsonParse(s.suitableFor),
      languages: safeJsonParse(s.languages),
      excludes: safeJsonParse(s.excludes),
      notAllowed: safeJsonParse(s.notAllowed),
      whatToBring: safeJsonParse(s.whatToBring),
      knowBeforeYouGo: safeJsonParse(s.knowBeforeYouGo),
      experienceTags: safeJsonParse(s.experienceTags),
      bookingTags: safeJsonParse(s.bookingTags),
      priorityTags: safeJsonParse(s.priorityTags),
      timeSlots: safeJsonParse(s.timeSlots)
    }));
    res.json(formattedServices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get all services (Admin)
app.get('/api/admin/services', authMiddleware, async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { packages: true, reviews: true }
    });
    // Parse JSON strings back to arrays
    const formattedServices = services.map(s => ({
      ...s,
      gallery: safeJsonParse(s.gallery),
      highlights: safeJsonParse(s.highlights),
      includes: safeJsonParse(s.includes),
      suitableFor: safeJsonParse(s.suitableFor),
      languages: safeJsonParse(s.languages),
      excludes: safeJsonParse(s.excludes),
      notAllowed: safeJsonParse(s.notAllowed),
      whatToBring: safeJsonParse(s.whatToBring),
      knowBeforeYouGo: safeJsonParse(s.knowBeforeYouGo),
      experienceTags: safeJsonParse(s.experienceTags),
      bookingTags: safeJsonParse(s.bookingTags),
      priorityTags: safeJsonParse(s.priorityTags),
      timeSlots: safeJsonParse(s.timeSlots)
    }));
    res.json(formattedServices);
  } catch (error) {
    console.error(error);
  }
});

// Get single service by slug (Public)
app.get('/api/services/slug/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim();
    if (!slug || slug.length < 2 || slug === 'undefined' || slug === 'null') {
      return res.status(400).json({ error: 'A valid slug is required.' });
    }
    const service = await prisma.service.findUnique({
      where: { slug },
      include: { packages: { where: { active: true }, orderBy: { sortOrder: 'asc' } }, reviews: { where: { active: true }, orderBy: { sortOrder: 'asc' } } }
    });
    if (!service) return res.status(404).json({ error: 'Not found' });
    
    if (!service.active && (!req.user || !req.user.role)) {
       return res.status(404).json({ error: 'Not found' });
    }

    const formattedService = {
      ...service,
      gallery: safeJsonParse(service.gallery),
      highlights: safeJsonParse(service.highlights),
      includes: safeJsonParse(service.includes),
      suitableFor: safeJsonParse(service.suitableFor),
      languages: safeJsonParse(service.languages),
      excludes: safeJsonParse(service.excludes),
      notAllowed: safeJsonParse(service.notAllowed),
      whatToBring: safeJsonParse(service.whatToBring),
      knowBeforeYouGo: safeJsonParse(service.knowBeforeYouGo),
      experienceTags: safeJsonParse(service.experienceTags),
      bookingTags: safeJsonParse(service.bookingTags),
      priorityTags: safeJsonParse(service.priorityTags),
      timeSlots: safeJsonParse(service.timeSlots)
    };
    res.json(formattedService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create a new service
app.post('/api/services', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const errors = {};
    
    if (!data.title?.trim()) errors.title = 'Title is required';
    if (!data.category?.trim()) errors.category = 'Category is required';
    if (!data.price || !String(data.price).trim()) {
      errors.price = 'Price is required';
    } else {
      data.price = String(data.price);
    }
    
    data.slug = valid.createSlug(data.slug || data.title);
    if (!data.slug) errors.slug = 'Slug is required';
    
    if (Object.keys(errors).length > 0) return res.status(400).json({ error: 'Validation failed', fields: errors });
    
    if (data.minGuests && data.maxGuests && parseInt(data.minGuests) > parseInt(data.maxGuests)) {
      return res.status(400).json({ error: 'Validation failed', fields: { maxGuests: 'maxGuests must be >= minGuests' } });
    }

    let isFeatured = data.featured || false;
    let isActive = data.active !== undefined ? data.active : true;

    if (!isActive) {
      isFeatured = false;
    }

    if (isFeatured) {
      const count = await prisma.service.count({
        where: { featured: true, active: true }
      });
      if (count >= 4) {
        return res.status(400).json({ error: 'Home can only have 4 featured workshops.', fields: { featured: 'Unfeature another workshop first.' } });
      }
    }

    const newService = await prisma.service.create({
      data: {
        slug: data.slug,
        category: data.category,
        title: data.title,
        subtitle: data.subtitle || '',
        price: data.price ? String(data.price) : '',
        duration: data.duration || '',
        groupSize: data.groupSize || '',
        location: data.location || '',
        image: data.image || '',
        gallery: ensureJsonString(data.gallery),
        highlights: ensureJsonString(data.highlights),
        description: data.description || '',
        includes: ensureJsonString(data.includes),
        suitableFor: ensureJsonString(data.suitableFor),
        featured: isFeatured,
        active: isActive,
        sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
        minGuests: data.minGuests ? parseInt(data.minGuests) : null,
        maxGuests: data.maxGuests ? parseInt(data.maxGuests) : null,
        defaultEstimatedPrice: data.defaultEstimatedPrice ? parseFloat(data.defaultEstimatedPrice) : null,
        // Extended fields
        groupName: data.groupName || '',
        shortDescription: data.shortDescription || '',
        fullDescription: data.fullDescription || '',
        freeCancellation: data.freeCancellation !== undefined ? data.freeCancellation : true,
        cancellationPolicy: data.cancellationPolicy || '',
        reserveNowPayLater: data.reserveNowPayLater !== undefined ? data.reserveNowPayLater : true,
        reservePolicy: data.reservePolicy || '',
        availabilityNote: data.availabilityNote || '',
        instructorDescription: data.instructorDescription || '',
        languages: ensureJsonString(data.languages),
        wheelchairAccessible: data.wheelchairAccessible || false,
        smallGroup: data.smallGroup || false,
        groupLimit: data.groupLimit ? parseInt(data.groupLimit) : null,
        
        excludes: ensureJsonString(data.excludes),
        notAllowed: ensureJsonString(data.notAllowed),
        whatToBring: ensureJsonString(data.whatToBring),
        knowBeforeYouGo: ensureJsonString(data.knowBeforeYouGo),
        
        meetingPointTitle: data.meetingPointTitle || '',
        meetingPointDescription: data.meetingPointDescription || '',
        googleMapsUrl: data.googleMapsUrl || '',
        mapEmbed: data.mapEmbed || '',
        
        experienceTags: ensureJsonString(data.experienceTags),
        bookingTags: ensureJsonString(data.bookingTags),
        priorityTags: ensureJsonString(data.priorityTags),
        timeSlots: ensureJsonString(data.timeSlots)
      }
    });

    if (data.packages && Array.isArray(data.packages)) {
      for (const pkg of data.packages) {
        await prisma.servicePackage.create({
          data: {
            serviceId: newService.id,
            name: pkg.name,
            description: pkg.description || '',
            price: parseFloat(pkg.price) || 0,
            currency: pkg.currency || 'USD',
            priceLabel: pkg.priceLabel || '',
            duration: pkg.duration || '',
            groupSize: pkg.groupSize || '',
            minGuests: pkg.minGuests ? parseInt(pkg.minGuests) : null,
            maxGuests: pkg.maxGuests ? parseInt(pkg.maxGuests) : null,
            active: pkg.active !== undefined ? pkg.active : true,
            sortOrder: pkg.sortOrder ? parseInt(pkg.sortOrder) : 0
          }
        });
      }
    }

    res.status(201).json(newService);
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Service not found.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update a service
app.put('/api/services/:id', authMiddleware, async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const data = req.body;
    
    console.log('[Service Update] Request:', {
      id,
      bodyKeys: Object.keys(data || {}),
    });

    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'A valid service ID is required.' });
    }

    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    
    const errors = {};
    if (data.title !== undefined && !String(data.title).trim()) errors.title = 'Title is required';
    if (data.category !== undefined && !String(data.category).trim()) errors.category = 'Category is required';
    
    if (data.price !== undefined) {
      if (!String(data.price).trim()) {
        errors.price = 'Price is required';
      } else {
        data.price = String(data.price);
      }
    }
    
    if (data.slug !== undefined) {
      data.slug = valid.createSlug(data.slug);
      if (!data.slug) errors.slug = 'Slug is required';
    }
    
    if (Object.keys(errors).length > 0) return res.status(400).json({ error: 'Validation failed', fields: errors });
    
    if (data.minGuests && data.maxGuests && parseInt(data.minGuests) > parseInt(data.maxGuests)) {
      return res.status(400).json({ error: 'Validation failed', fields: { maxGuests: 'maxGuests must be >= minGuests' } });
    }

    let isFeatured = data.featured;
    let isActive = data.active;
    if (isActive === false) {
      isFeatured = false;
    }

    if (isFeatured) {
      const count = await prisma.service.count({
        where: { featured: true, active: true, id: { not: id } }
      });
      if (count >= 4) {
        return res.status(400).json({ error: 'Home can only have 4 featured workshops.', fields: { featured: 'Unfeature another workshop first.' } });
      }
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        slug: data.slug,
        category: data.category,
        title: data.title,
        subtitle: data.subtitle,
        price: data.price,
        duration: data.duration,
        groupSize: data.groupSize,
        location: data.location,
        image: data.image,
        gallery: ensureJsonString(data.gallery || []),
        highlights: ensureJsonString(data.highlights || []),
        description: data.description,
        includes: ensureJsonString(data.includes || []),
        suitableFor: ensureJsonString(data.suitableFor || []),
        featured: isFeatured,
        active: isActive,
        sortOrder: data.sortOrder !== undefined ? parseInt(data.sortOrder) : undefined,
        minGuests: data.minGuests !== undefined ? (data.minGuests ? parseInt(data.minGuests) : null) : undefined,
        maxGuests: data.maxGuests !== undefined ? (data.maxGuests ? parseInt(data.maxGuests) : null) : undefined,
        defaultEstimatedPrice: data.defaultEstimatedPrice !== undefined ? (data.defaultEstimatedPrice ? parseFloat(data.defaultEstimatedPrice) : null) : undefined,
        // Extended fields
        groupName: data.groupName,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        freeCancellation: data.freeCancellation,
        cancellationPolicy: data.cancellationPolicy,
        reserveNowPayLater: data.reserveNowPayLater,
        reservePolicy: data.reservePolicy,
        availabilityNote: data.availabilityNote,
        instructorDescription: data.instructorDescription,
        languages: ensureJsonString(data.languages || []),
        wheelchairAccessible: data.wheelchairAccessible,
        smallGroup: data.smallGroup,
        groupLimit: data.groupLimit !== undefined ? (data.groupLimit ? parseInt(data.groupLimit) : null) : undefined,
        
        excludes: ensureJsonString(data.excludes || []),
        notAllowed: ensureJsonString(data.notAllowed || []),
        whatToBring: ensureJsonString(data.whatToBring || []),
        knowBeforeYouGo: ensureJsonString(data.knowBeforeYouGo || []),
        
        meetingPointTitle: data.meetingPointTitle,
        meetingPointDescription: data.meetingPointDescription,
        googleMapsUrl: data.googleMapsUrl,
        mapEmbed: data.mapEmbed,

        experienceTags: ensureJsonString(data.experienceTags || []),
        bookingTags: ensureJsonString(data.bookingTags || []),
        priorityTags: ensureJsonString(data.priorityTags || []),
        timeSlots: ensureJsonString(data.timeSlots || [])
      }
    });

    if (data.packages && Array.isArray(data.packages)) {
      const packageIds = data.packages.map(p => p.id).filter(Boolean);
      await prisma.servicePackage.deleteMany({
        where: { serviceId: id, id: { notIn: packageIds } }
      });
      
      for (const pkg of data.packages) {
        if (pkg.id) {
          await prisma.servicePackage.update({
            where: { id: pkg.id },
            data: {
              name: pkg.name,
              description: pkg.description || '',
              price: parseFloat(pkg.price) || 0,
              currency: pkg.currency || 'USD',
              priceLabel: pkg.priceLabel || '',
              duration: pkg.duration || '',
              groupSize: pkg.groupSize || '',
              minGuests: pkg.minGuests ? parseInt(pkg.minGuests) : null,
              maxGuests: pkg.maxGuests ? parseInt(pkg.maxGuests) : null,
              active: pkg.active !== undefined ? pkg.active : true,
              sortOrder: pkg.sortOrder ? parseInt(pkg.sortOrder) : 0
            }
          });
        } else {
          await prisma.servicePackage.create({
            data: {
              serviceId: id,
              name: pkg.name,
              description: pkg.description || '',
              price: parseFloat(pkg.price) || 0,
              currency: pkg.currency || 'USD',
              priceLabel: pkg.priceLabel || '',
              duration: pkg.duration || '',
              groupSize: pkg.groupSize || '',
              minGuests: pkg.minGuests ? parseInt(pkg.minGuests) : null,
              maxGuests: pkg.maxGuests ? parseInt(pkg.maxGuests) : null,
              active: pkg.active !== undefined ? pkg.active : true,
              sortOrder: pkg.sortOrder ? parseInt(pkg.sortOrder) : 0
            }
          });
        }
      }
    }

    // Parse JSON arrays before sending back
    const response = {
      ...updatedService,
      gallery: safeJsonParse(updatedService.gallery),
      highlights: safeJsonParse(updatedService.highlights),
      includes: safeJsonParse(updatedService.includes),
      suitableFor: safeJsonParse(updatedService.suitableFor),
      languages: safeJsonParse(updatedService.languages),
      excludes: safeJsonParse(updatedService.excludes),
      notAllowed: safeJsonParse(updatedService.notAllowed),
      whatToBring: safeJsonParse(updatedService.whatToBring),
      knowBeforeYouGo: safeJsonParse(updatedService.knowBeforeYouGo),
      experienceTags: safeJsonParse(updatedService.experienceTags),
      bookingTags: safeJsonParse(updatedService.bookingTags),
      priorityTags: safeJsonParse(updatedService.priorityTags),
      timeSlots: safeJsonParse(updatedService.timeSlots)
    };
    res.json(response);
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Service not found.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete a service
app.delete('/api/services/:id', authMiddleware, async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    
    console.log('[Service Delete] Request:', {
      id,
    });

    if (!id) {
      return res.status(400).json({ error: 'Service ID is required.' });
    }

    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    await prisma.service.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Service not found.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Get Admin Dashboard data
app.get('/api/admin/dashboard', authMiddleware, async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'asc' }
    });

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let totalLeads = leads.length;
    let newLeads = 0;
    let confirmedBookings = 0;
    let completedBookings = 0;
    let estimatedRevenueThisMonth = 0;

    const monthlyRevenueMap = {};
    const monthlyLeadsMap = {};
    const statusMap = {};
    const serviceMap = {};

    leads.forEach(lead => {
      // KPI Counters
      if (lead.status === 'new') newLeads++;
      if (lead.status === 'confirmed') confirmedBookings++;
      if (lead.status === 'completed') completedBookings++;

      // Revenue Calculation (only if confirmed or completed)
      const leadMonth = `${lead.createdAt.getFullYear()}-${String(lead.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (leadMonth === currentMonthStr && (lead.status === 'confirmed' || lead.status === 'completed')) {
        estimatedRevenueThisMonth += (lead.estimatedRevenue || 0);
      }

      // Monthly Trends
      if (!monthlyLeadsMap[leadMonth]) monthlyLeadsMap[leadMonth] = 0;
      monthlyLeadsMap[leadMonth]++;

      if (lead.status === 'confirmed' || lead.status === 'completed') {
        if (!monthlyRevenueMap[leadMonth]) monthlyRevenueMap[leadMonth] = 0;
        monthlyRevenueMap[leadMonth] += (lead.estimatedRevenue || 0);
      }

      // Group by Status
      if (!statusMap[lead.status]) statusMap[lead.status] = 0;
      statusMap[lead.status]++;

      // Group by Service
      const serviceName = lead.serviceNameSnapshot || lead.serviceId || 'Unknown';
      if (!serviceMap[serviceName]) serviceMap[serviceName] = 0;
      serviceMap[serviceName]++;
    });

    const conversionRate = totalLeads === 0 ? 0 : Math.round(((confirmedBookings + completedBookings) / totalLeads) * 100);

    // Monthly Trends (Last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = monthNames[d.getMonth()];
      
      const monthLeads = leads.filter(l => {
        const ld = new Date(l.createdAt);
        return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
      });

      const rev = monthLeads
        .filter(l => ['confirmed', 'completed'].includes(l.status))
        .reduce((sum, l) => sum + (l.estimatedRevenue || 0), 0);
      
      monthlyData.push({
        name: monthLabel,
        leads: monthLeads.length,
        revenue: rev
      });
    }

    // Leads by Status
    const statusCounts = {};
    leads.forEach(l => {
      statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    });
    const leadsByStatus = Object.keys(statusCounts).map(k => ({
      status: k, count: statusCounts[k]
    }));

    // Leads by Service
    const serviceCounts = {};
    leads.forEach(l => {
      const sName = l.serviceNameSnapshot || 'Need consultation';
      serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
    });
    const leadsByService = Object.keys(serviceCounts).map(k => ({
      serviceName: k, count: serviceCounts[k]
    }));

    res.json({
      summary: {
        totalLeads, newLeads, confirmedBookings, completedBookings, estimatedRevenueThisMonth, conversionRate
      },
      monthlyRevenue: monthlyData.map(d => ({ name: d.name, revenue: d.revenue })),
      monthlyLeads: monthlyData.map(d => ({ name: d.name, leads: d.leads })),
      leadsByStatus,
      leadsByService
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.get('/api/admin/calendar', authMiddleware, async (req, res) => {
  try {
    const bookings = await prisma.lead.findMany({
      where: {
        bookingDate: { not: null },
        status: { in: ['confirmed', 'completed', 'deposit_paid'] }
      },
      orderBy: { bookingDate: 'asc' }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// Get all leads
app.get('/api/leads', authMiddleware, async (req, res) => {
  try {
    const { status, q, from, to, serviceId } = req.query;
    
    let whereClause = {};
    if (status) whereClause.status = status;
    if (serviceId) whereClause.serviceId = serviceId;
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt.gte = new Date(from);
      if (to) whereClause.createdAt.lte = new Date(to);
    }
    
    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { message: { contains: q } }
      ];
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Export leads CSV
app.get('/api/leads/export', authMiddleware, async (req, res) => {
  try {
    const { status, q, from, to, serviceId } = req.query;
    
    let whereClause = {};
    if (status) whereClause.status = status;
    if (serviceId) whereClause.serviceId = serviceId;
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt.gte = new Date(from);
      if (to) whereClause.createdAt.lte = new Date(to);
    }
    
    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { message: { contains: q } }
      ];
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    const headers = ['createdAt', 'name', 'email', 'phone', 'serviceNameSnapshot', 'date', 'guests', 'status', 'source', 'assignedTo', 'estimatedRevenue', 'internalNote'];
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringified = String(str);
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const csvRows = leads.map(lead => {
      return headers.map(header => escapeCsv(lead[header])).join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads_export.csv"');
    res.send(csvString);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export leads' });
  }
});

const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 lead submissions per window
  message: { error: 'Too many requests, please try again later.' }
});

// Create a new lead
app.post('/api/leads', leadLimiter, async (req, res) => {
  try {
    const data = req.body;
    const errors = {};
    
    const name = valid.normalizeName(data.name);
    const email = valid.normalizeEmail(data.email);
    const phone = valid.normalizePhone(data.phone);
    const date = String(data.date || data.preferredDate || '').trim();
    const message = String(data.message || '').trim().slice(0, 2000);

    const nameErr = valid.validateName(name, true);
    if (nameErr) errors.name = nameErr;
    
    const emailErr = valid.validateEmail(email, true);
    if (emailErr) errors.email = emailErr;
    
    const phoneErr = valid.validatePhone(phone, false);
    if (phoneErr) errors.phone = phoneErr;

    const dateErr = valid.validateDateString(date, false, false);
    if (dateErr && date) errors.date = dateErr;

    const rawGuests = String(data.guests || data.participants || '1');
    const parsedGuests = parseInt(rawGuests, 10);
    const guestErr = valid.validateInteger(parsedGuests, 1, 999, true);
    if (guestErr) errors.participants = guestErr;

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }

    let serviceNameSnapshot = 'Need consultation';
    let serviceId = (data.serviceId || '').trim();
    let packageId = (data.packageId || '').trim();
    let packageNameSnapshot = null;
    let packagePriceSnapshot = null;
    let packageCurrencySnapshot = null;

    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service || !service.active) {
        return res.status(400).json({ error: 'Validation failed', fields: { serviceId: 'Invalid or inactive service' } });
      }
      serviceNameSnapshot = service.title;

      if (packageId) {
        const pkg = await prisma.servicePackage.findFirst({
          where: { id: packageId, serviceId: serviceId, active: true }
        });
        if (!pkg) {
          return res.status(400).json({ error: 'Validation failed', fields: { packageId: 'Invalid or inactive package for this service' } });
        }
        packageNameSnapshot = pkg.name;
        packagePriceSnapshot = pkg.price;
        packageCurrencySnapshot = pkg.currency;
      }
    } else {
      serviceId = null;
      packageId = null;
    }

    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let newLead = null;
    let retries = 3;
    
    while (retries > 0 && !newLead) {
      try {
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        const referenceCode = `REQ-${datePrefix}-${random}`;
        
        newLead = await prisma.lead.create({
          data: {
            referenceCode,
            name,
            email,
            phone: phone || null,
            date: date || null,
            preferredTime: data.preferredTime || null,
            guests: parsedGuests,
            message: message || null,
            serviceId,
            serviceNameSnapshot,
            packageId,
            packageNameSnapshot,
            packagePriceSnapshot,
            packageCurrencySnapshot,
            source: data.source || 'website',
          }
        });
      } catch (err) {
        if (err.code === 'P2002' && err.meta?.target?.includes('referenceCode')) {
          retries--;
          if (retries === 0) throw err;
        } else {
          throw err;
        }
      }
    }

    const [adminResult, customerResult] = await Promise.allSettled([
      sendAdminLeadNotification(newLead),
      sendCustomerLeadConfirmation(newLead)
    ]);

    const adminNotificationStatus = adminResult.status === 'fulfilled' ? adminResult.value : 'failed';
    const customerConfirmationStatus = customerResult.status === 'fulfilled' ? customerResult.value : 'failed';

    if (adminResult.status === 'rejected') {
      console.error('[Email Error] Admin notification failed:', adminResult.reason);
    }
    if (customerResult.status === 'rejected') {
      console.error('[Email Error] Customer confirmation failed:', customerResult.reason);
    }

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      lead: {
        id: newLead.id,
        referenceCode: newLead.referenceCode,
        name: newLead.name,
        email: newLead.email,
        serviceNameSnapshot: newLead.serviceNameSnapshot
      },
      email: {
        adminNotification: adminNotificationStatus,
        customerConfirmation: customerConfirmationStatus
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update a lead status
app.put('/api/leads/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const errors = {};
    const validStatuses = ['new', 'contacted', 'quoted', 'deposit_paid', 'confirmed', 'completed', 'cancelled', 'lost'];
    if (data.status && !validStatuses.includes(data.status)) errors.status = 'Invalid status';
    
    if (data.status === 'lost') {
      const lostReasonErr = valid.validateText(data.lostReason, 500, true);
      if (lostReasonErr) errors.lostReason = lostReasonErr;
    }
    
    let revenue;
    if (data.estimatedRevenue !== undefined && data.estimatedRevenue !== '') {
      revenue = Number(data.estimatedRevenue);
      const revErr = valid.validateAmount(revenue, 0, 1000000000, false);
      if (revErr) errors.estimatedRevenue = revErr;
    }

    if (data.internalNote !== undefined) {
      const internalNoteErr = valid.validateText(data.internalNote, 5000, false);
      if (internalNoteErr) errors.internalNote = internalNoteErr;
    }

    if (Object.keys(errors).length > 0) return res.status(400).json({ error: 'Validation failed', fields: errors });

    const existingLead = await prisma.lead.findUnique({ where: { id } });
    if (!existingLead) return res.status(404).json({ error: 'Lead not found' });

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { 
        status: data.status,
        source: data.source,
        serviceNameSnapshot: data.serviceNameSnapshot,
        preferredContactMethod: data.preferredContactMethod,
        language: data.language,
        budget: data.budget,
        internalNote: data.internalNote,
        assignedTo: data.assignedTo,
        estimatedRevenue: data.estimatedRevenue !== undefined ? revenue : undefined,
        lastContactedAt: data.lastContactedAt ? new Date(data.lastContactedAt) : undefined,
        bookingDate: data.bookingDate !== undefined ? (data.bookingDate ? new Date(data.bookingDate) : null) : undefined,
        bookingEndDate: data.bookingEndDate !== undefined ? (data.bookingEndDate ? new Date(data.bookingEndDate) : null) : undefined,
        bookingLocation: data.bookingLocation,
        bookingType: data.bookingType,
        capacity: data.capacity !== undefined ? parseInt(data.capacity, 10) : undefined,
        attendees: data.attendees !== undefined ? parseInt(data.attendees, 10) : undefined,
        bookingNote: data.bookingNote,
        lostReason: data.status === 'lost' ? data.lostReason : null
      }
    });

    let emailStatus = 'skipped';
    if (data.status && data.status !== existingLead.status) {
      try {
        emailStatus = await sendCustomerStatusChangeEmail(updatedLead, data.status);
      } catch (err) {
        console.error('[Email Error] Failed to send status update:', err);
        emailStatus = 'failed';
      }
    }

    if (data.status && existingLead.status !== data.status) {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: 'status_change',
          oldValue: existingLead.status,
          newValue: data.status,
          createdBy: req.user ? req.user.username : 'admin'
        }
      });
    }

    res.json({ ...updatedLead, emailStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// --- POSTS ---
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(posts);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch posts' }); }
});

app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const newPost = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        image: data.image || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        published: data.published || false,
      }
    });
    res.status(201).json(newPost);
  } catch (error) { res.status(500).json({ error: 'Failed to create post' }); }
});

app.put('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        image: data.image,
        excerpt: data.excerpt,
        content: data.content,
        published: data.published,
      }
    });
    res.json(updatedPost);
  } catch (error) { res.status(500).json({ error: 'Failed to update post' }); }
});

app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) { res.status(500).json({ error: 'Failed to delete post' }); }
});

// --- SETTINGS ---
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch settings' }); }
});

app.put('/api/settings', authMiddleware, async (req, res) => {
  try {
    const updates = req.body; 
    const errors = {};
    
    if (updates.companyName !== undefined) {
      const err = valid.validateName(updates.companyName, true);
      if (err) errors.companyName = err;
    }
    if (updates.email !== undefined) {
      const err = valid.validateEmail(updates.email, true);
      if (err) errors.email = err;
    }
    if (updates.hotline !== undefined) {
      const err = valid.validatePhone(updates.hotline, true);
      if (err) errors.hotline = err;
    }
    
    // Validate social links
    ['facebookUrl', 'instagramUrl', 'tripadvisorUrl', 'googleMapsUrl'].forEach(key => {
      if (updates[key] !== undefined && updates[key].trim() !== '') {
        const err = valid.isValidHttpUrl(updates[key], false);
        if (err) errors[key] = err;
      }
    });

    if (Object.keys(errors).length > 0) return res.status(400).json({ error: 'Validation failed', fields: errors });
    for (const [key, value] of Object.entries(updates)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to update settings' }); }
});

// --- TESTIMONIALS ---
app.get('/api/testimonials', async (req, res) => {
  try {
    const items = await prisma.testimonial.findMany();
    res.json(items);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch testimonials' }); }
});

app.post('/api/testimonials', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const newItem = await prisma.testimonial.create({
      data: {
        name: data.name,
        role: data.role || '',
        avatar: data.avatar || '',
        comment: data.comment || '',
      }
    });
    res.status(201).json(newItem);
  } catch (error) { res.status(500).json({ error: 'Failed to create testimonial' }); }
});

app.put('/api/testimonials/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        avatar: data.avatar,
        comment: data.comment,
      }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update testimonial' }); }
});

app.delete('/api/testimonials/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) { res.status(500).json({ error: 'Failed to delete testimonial' }); }
});

// --- PARTNERS ---
app.get('/api/partners', async (req, res) => {
  try {
    const items = await prisma.partner.findMany();
    res.json(items);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch partners' }); }
});

app.post('/api/partners', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const newItem = await prisma.partner.create({
      data: {
        name: data.name,
        logo: data.logo || '',
      }
    });
    res.status(201).json(newItem);
  } catch (error) { res.status(500).json({ error: 'Failed to create partner' }); }
});

app.put('/api/partners/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.partner.update({
      where: { id },
      data: {
        name: data.name,
        logo: data.logo,
      }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update partner' }); }
});

app.delete('/api/partners/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.partner.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) { res.status(500).json({ error: 'Failed to delete partner' }); }
});

// --- TEAM MEMBERS ---
app.get('/api/team-members', async (req, res) => {
  try {
    const items = await prisma.teamMember.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(items);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch team members' }); }
});

app.post('/api/team-members', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const newItem = await prisma.teamMember.create({
      data: {
        name: data.name || 'New Member',
        role: data.role || 'Role',
        bio: data.bio || '',
        image: data.image || '',
        sortOrder: data.sortOrder || 0,
        active: data.active !== undefined ? data.active : true,
      }
    });
    res.status(201).json(newItem);
  } catch (error) { res.status(500).json({ error: 'Failed to create team member' }); }
});

app.put('/api/team-members/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.teamMember.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        bio: data.bio,
        image: data.image,
        sortOrder: data.sortOrder,
        active: data.active,
      }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update team member' }); }
});

app.delete('/api/team-members/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.teamMember.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) { res.status(500).json({ error: 'Failed to delete team member' }); }
});

// --- FAQs ---
app.get('/api/faqs', async (req, res) => {
  try {
    const items = await prisma.fAQ.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(items);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch FAQs' }); }
});

app.post('/api/faqs', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const newItem = await prisma.fAQ.create({
      data: {
        question: data.question || 'New Question',
        answer: data.answer || '',
        sortOrder: data.sortOrder || 0,
        active: data.active !== undefined ? data.active : true,
      }
    });
    res.status(201).json(newItem);
  } catch (error) { res.status(500).json({ error: 'Failed to create FAQ' }); }
});

app.put('/api/faqs/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.fAQ.update({
      where: { id },
      data: {
        question: data.question,
        answer: data.answer,
        sortOrder: data.sortOrder,
        active: data.active,
      }
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: 'Failed to update FAQ' }); }
});

app.delete('/api/faqs/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.fAQ.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) { res.status(500).json({ error: 'Failed to delete FAQ' }); }
});

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');

console.log('Production frontend paths:', {
  projectRoot: PROJECT_ROOT,
  distDir: DIST_DIR,
  indexFile: INDEX_FILE,
  distExists: fs.existsSync(DIST_DIR),
  indexExists: fs.existsSync(INDEX_FILE),
});

// Serve uploaded pics
app.use('/pics', express.static(PICS_DIR));

if (isProduction) {
  app.use(
    express.static(DIST_DIR, {
      index: false,
      fallthrough: true,
      maxAge: '1d',
    })
  );

  app.use('/api', (req, res) => {
    return res.status(404).json({ error: 'API route not found' });
  });

  app.use('/assets', (req, res) => {
    return res.status(404).type('text/plain').send('Frontend asset not found');
  });

  app.use((req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    if (
      req.path === '/api' ||
      req.path.startsWith('/api/') ||
      req.path === '/assets' ||
      req.path.startsWith('/assets/') ||
      req.path === '/pics' ||
      req.path.startsWith('/pics/') ||
      req.path === '/uploads' ||
      req.path.startsWith('/uploads/')
    ) {
      return next();
    }

    if (path.extname(req.path)) {
      return next();
    }

    if (!fs.existsSync(INDEX_FILE)) {
      console.error('[Frontend] index.html is missing:', INDEX_FILE);
      return res.status(500).json({ error: 'Frontend build is missing' });
    }

    return res.sendFile(INDEX_FILE);
  });
} else {
  // 404 for unhandled API routes in dev
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });
}

// Global 404 handler for any remaining requests (only triggers if SPA fallback didn't catch it, or for non-GET methods)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Multer Error Handler
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'Image must be smaller than 5 MB' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ success: false, error: 'Invalid image upload field' });
    }
    return res.status(400).json({ success: false, error: 'Invalid image upload request' });
  }

  if (error?.message === 'Invalid file type. Only JPG, PNG and WEBP are allowed.') {
    return res.status(400).json({ success: false, error: error.message });
  }

  return next(error);
});

// Global Error Handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed by CORS' });
  }

  console.error('Unhandled server error:', { method: req.method, path: req.path, message: error?.message });

  if (isProduction) {
    res.status(error.status || 500).json({ error: 'Internal server error' });
  } else {
    res.status(error.status || 500).json({ error: error?.message, stack: error?.stack });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => {
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
